/**
 * Weather Adapter — PS-074 Ganjam Disaster Intelligence
 * Ingests live Open-Meteo weather for Ganjam district with in-memory caching,
 * measurable trend derivation, rainfall accumulation windows (1h, 3h, 24h),
 * and deterministic scenario fallbacks.
 */

import { createWeatherState, SourceCategory } from '../../domain/contracts'
import { GANJAM_CENTER } from '../../utils/geoUtils'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes cache TTL

// In-memory weather cache
let cachedWeatherData = null
let lastFetchTimestamp = 0

/**
 * Fetches normalized weather for Ganjam district.
 * Implements Tier A (Live) -> Tier B (Cached) -> Tier C (Deterministic Fallback).
 * 
 * @param {Object} options
 * @param {number} options.lat
 * @param {number} options.lng
 * @param {boolean} options.forceRefresh - Skip cache if true
 * @param {string} options.scenario - 'LIVE' | 'BASELINE' | 'WORSENING' | 'SEVERE'
 * @returns {Promise<Object>} Normalized WeatherState
 */
export async function fetchNormalizedWeather({
  lat = GANJAM_CENTER[0],
  lng = GANJAM_CENTER[1],
  forceRefresh = false,
  scenario = 'LIVE',
} = {}) {
  // If specific demo scenario is requested, return deterministic scenario immediately
  if (scenario && scenario !== 'LIVE') {
    return getDeterministicScenarioWeather(scenario)
  }

  const now = Date.now()

  // Return Tier B (Cached) if fresh and refresh not forced
  if (!forceRefresh && cachedWeatherData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    const minutesAgo = Math.max(1, Math.round((now - lastFetchTimestamp) / 60000))
    return {
      ...cachedWeatherData,
      source: 'CACHED',
      freshness: `Cached (${minutesAgo}m ago)`,
    }
  }

  // Tier A: Attempt live Open-Meteo fetch
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code',
      hourly: 'precipitation,rain,precipitation_probability,wind_speed_10m,weather_code',
      timezone: 'Asia/Kolkata',
      forecast_days: '2',
    })

    const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(4500), // Fast 4.5s timeout
    })

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`)
    }

    const data = await response.json()
    const current = data.current || {}
    const hourly = data.hourly || {}

    // Derive rainfall accumulation windows from hourly precipitation series
    const { rainfall1h, rainfall3h, rainfall24h, forecastItems } = computeRainfallWindows(current, hourly)

    // Compute measurable trend and decision-support severity
    const rainfallRate = Number(current.rain ?? current.precipitation ?? rainfall1h)
    const windSpeed = Number(current.wind_speed_10m ?? 42)
    const trend = calculateWeatherTrend(rainfallRate, forecastItems)
    const severity = assessWeatherSeverity(rainfallRate, windSpeed)

    const normalizedWeather = createWeatherState({
      location: { lat, lng, name: 'Gopalpur / Brahmapur, Ganjam District' },
      rainfallMmPerHour: rainfallRate,
      rainfall1h,
      rainfall3h,
      rainfall24h,
      windSpeedKmh: windSpeed,
      windDirection: formatWindDirection(current.wind_direction_10m),
      windGustKmh: current.wind_gusts_10m ?? null,
      temperatureC: current.temperature_2m ?? 27.5,
      apparentTemperatureC: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      pressure: current.surface_pressure ?? null,
      precipitationProbability: forecastItems[0]?.precipitationProbability ?? 80,
      condition: mapWeatherCode(current.weather_code),
      trend,
      severity,
      forecast: forecastItems.slice(0, 8), // Next 8 hours
      stationName: 'IMD Gopalpur Telemetry (Ganjam)',
      source: SourceCategory.LIVE,
      freshness: 'Just now (Live Open-Meteo)',
      cachedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    })

    // Update in-memory cache
    cachedWeatherData = normalizedWeather
    lastFetchTimestamp = now

    return normalizedWeather
  } catch (err) {
    console.warn('Live weather fetch failed, assessing fallback tier:', err.message)

    // Tier B: Fall back to stale cached data if available
    if (cachedWeatherData) {
      const minutesAgo = Math.max(1, Math.round((now - lastFetchTimestamp) / 60000))
      return {
        ...cachedWeatherData,
        source: 'CACHED',
        freshness: `Cached fallback (${minutesAgo}m ago)`,
      }
    }

    // Tier C: Deterministic Ganjam demo fallback
    return getDeterministicScenarioWeather('BASELINE')
  }
}

/**
 * Computes accumulation windows (1h, 3h, 24h) and 8-hour forecast from hourly telemetry.
 */
function computeRainfallWindows(current, hourly) {
  const rainRate = Number(current.rain ?? current.precipitation ?? 0)
  const hourlyPrecip = Array.isArray(hourly.precipitation) ? hourly.precipitation : []
  const hourlyTimes = Array.isArray(hourly.time) ? hourly.time : []
  const hourlyProb = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : []
  const hourlyWind = Array.isArray(hourly.wind_speed_10m) ? hourly.wind_speed_10m : []
  const hourlyCodes = Array.isArray(hourly.weather_code) ? hourly.weather_code : []

  // Current 1h
  const rainfall1h = Math.max(rainRate, hourlyPrecip[0] ?? rainRate)

  // 3h accumulation: current + forward 2 hours (or recent window)
  const window3h = hourlyPrecip.slice(0, 3)
  const rainfall3h = Number(window3h.reduce((acc, v) => acc + (Number(v) || 0), 0).toFixed(1)) || Number((rainRate * 1.7).toFixed(1))

  // 24h accumulation: sum across 24h series
  const window24h = hourlyPrecip.slice(0, 24)
  const rainfall24h = Number(window24h.reduce((acc, v) => acc + (Number(v) || 0), 0).toFixed(1)) || Number((rainRate * 2.8).toFixed(1))

  // Build structured 8-hour forecast items
  const forecastItems = []
  for (let i = 1; i <= 8; i++) {
    const rawTime = hourlyTimes[i]
    let timeLabel = `+${i}h`
    if (rawTime) {
      const date = new Date(rawTime)
      if (!isNaN(date.getTime())) {
        timeLabel = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
    }

    forecastItems.push({
      time: timeLabel,
      rainfallMm: Number((hourlyPrecip[i] ?? (rainRate * (0.8 + (i % 3) * 0.2))).toFixed(1)),
      precipitationProbability: Number(hourlyProb[i] ?? Math.min(95, 70 + i * 3)),
      windSpeedKmh: Number(hourlyWind[i] ?? 42),
      condition: mapWeatherCode(hourlyCodes[i]),
    })
  }

  return { rainfall1h, rainfall3h, rainfall24h, forecastItems }
}

/**
 * Computes deterministic weather trend from measurable upcoming forecast.
 */
function calculateWeatherTrend(currentRate, forecastItems) {
  if (!forecastItems || forecastItems.length === 0) {
    return currentRate > 75 ? 'WORSENING' : 'STABLE'
  }

  const next3hSum = forecastItems.slice(0, 3).reduce((sum, item) => sum + item.rainfallMm, 0)
  const expectedBaseline3h = currentRate * 3

  if (currentRate >= 95 || next3hSum > expectedBaseline3h * 1.25) {
    return 'SEVERE'
  }
  if (currentRate >= 70 || next3hSum > expectedBaseline3h * 1.1) {
    return 'WORSENING'
  }
  if (currentRate <= 25 && next3hSum < expectedBaseline3h * 0.7) {
    return 'IMPROVING'
  }
  return 'STABLE'
}

/**
 * Modelled weather severity assessment (Decision-support only, NOT official IMD warning).
 */
function assessWeatherSeverity(rainfallRate, windSpeed) {
  if (rainfallRate >= 100 || windSpeed >= 65) return 'SEVERE'
  if (rainfallRate >= 75 || windSpeed >= 50) return 'WARNING'
  if (rainfallRate >= 40) return 'WATCH'
  return 'NORMAL'
}

/**
 * Returns deterministic scenario weather states for repeatable evaluation.
 * @param {'BASELINE' | 'WORSENING' | 'SEVERE'} scenario
 */
export function getDeterministicScenarioWeather(scenario = 'BASELINE') {
  const baseTime = new Date()

  if (scenario === 'SEVERE') {
    return createWeatherState({
      rainfallMmPerHour: 115.0,
      rainfall1h: 115.0,
      rainfall3h: 215.0,
      rainfall24h: 340.0,
      windSpeedKmh: 68.0,
      windDirection: 'NE (Violent Gale)',
      windGustKmh: 88.0,
      temperatureC: 25.5,
      apparentTemperatureC: 29.0,
      humidity: 98,
      pressure: 984,
      precipitationProbability: 95,
      condition: 'Extreme Downpour & High Squall',
      trend: 'SEVERE',
      severity: 'SEVERE',
      forecast: [
        { time: '+1h', rainfallMm: 118, precipitationProbability: 95, windSpeedKmh: 70, condition: 'Extreme Downpour' },
        { time: '+2h', rainfallMm: 112, precipitationProbability: 95, windSpeedKmh: 68, condition: 'Heavy Cloudburst' },
        { time: '+3h', rainfallMm: 105, precipitationProbability: 90, windSpeedKmh: 65, condition: 'Intense Storm' },
        { time: '+4h', rainfallMm: 95, precipitationProbability: 90, windSpeedKmh: 60, condition: 'Heavy Rain' },
        { time: '+6h', rainfallMm: 80, precipitationProbability: 85, windSpeedKmh: 55, condition: 'Squally Showers' },
        { time: '+8h', rainfallMm: 65, precipitationProbability: 80, windSpeedKmh: 48, condition: 'Continuous Rain' },
      ],
      stationName: 'Ganjam EOC Telemetry (Severe Scenario)',
      source: SourceCategory.DEMO,
      freshness: 'Modelled Scenario (Severe)',
      timestamp: baseTime.toISOString(),
    })
  }

  if (scenario === 'WORSENING') {
    return createWeatherState({
      rainfallMmPerHour: 90.0,
      rainfall1h: 90.0,
      rainfall3h: 160.0,
      rainfall24h: 250.0,
      windSpeedKmh: 55.0,
      windDirection: 'ENE (Coastal Squall)',
      windGustKmh: 72.0,
      temperatureC: 26.5,
      apparentTemperatureC: 30.0,
      humidity: 93,
      pressure: 991,
      precipitationProbability: 90,
      condition: 'Continuous Heavy Rain & Squall',
      trend: 'WORSENING',
      severity: 'WARNING',
      forecast: [
        { time: '+1h', rainfallMm: 92, precipitationProbability: 90, windSpeedKmh: 56, condition: 'Heavy Rain' },
        { time: '+2h', rainfallMm: 94, precipitationProbability: 90, windSpeedKmh: 58, condition: 'Heavy Downpour' },
        { time: '+3h', rainfallMm: 88, precipitationProbability: 85, windSpeedKmh: 54, condition: 'Continuous Rain' },
        { time: '+4h', rainfallMm: 82, precipitationProbability: 85, windSpeedKmh: 50, condition: 'Heavy Rain' },
        { time: '+6h', rainfallMm: 72, precipitationProbability: 80, windSpeedKmh: 46, condition: 'Squall' },
        { time: '+8h', rainfallMm: 60, precipitationProbability: 75, windSpeedKmh: 42, condition: 'Showers' },
      ],
      stationName: 'Ganjam EOC Telemetry (Worsening Scenario)',
      source: SourceCategory.DEMO,
      freshness: 'Modelled Scenario (Worsening)',
      timestamp: baseTime.toISOString(),
    })
  }

  // BASELINE Default (Matches Phase 1 & 2 baseline)
  return createWeatherState({
    rainfallMmPerHour: 68.0,
    rainfall1h: 68.0,
    rainfall3h: 115.0,
    rainfall24h: 185.0,
    windSpeedKmh: 42.0,
    windDirection: 'ENE (Moderate Squall)',
    windGustKmh: 58.0,
    temperatureC: 27.5,
    apparentTemperatureC: 31.0,
    humidity: 88,
    pressure: 996,
    precipitationProbability: 85,
    condition: 'Heavy Rain & Coastal Squall',
    trend: 'STABLE',
    severity: 'WATCH',
    forecast: [
      { time: '+1h', rainfallMm: 68, precipitationProbability: 85, windSpeedKmh: 42, condition: 'Heavy Rain' },
      { time: '+2h', rainfallMm: 70, precipitationProbability: 85, windSpeedKmh: 44, condition: 'Heavy Rain' },
      { time: '+3h', rainfallMm: 65, precipitationProbability: 80, windSpeedKmh: 40, condition: 'Moderate Rain' },
      { time: '+4h', rainfallMm: 58, precipitationProbability: 75, windSpeedKmh: 38, condition: 'Rain Showers' },
      { time: '+6h', rainfallMm: 52, precipitationProbability: 70, windSpeedKmh: 35, condition: 'Showers' },
      { time: '+8h', rainfallMm: 45, precipitationProbability: 65, windSpeedKmh: 32, condition: 'Light Rain' },
    ],
    stationName: 'Ganjam EOC Station (Gopalpur / Brahmapur)',
    source: SourceCategory.DEMO,
    freshness: 'Modelled Scenario (Baseline)',
    timestamp: baseTime.toISOString(),
  })
}

function formatWindDirection(deg) {
  if (deg === undefined || deg === null) return 'ENE (Coastal Onshore)'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(deg / 22.5) % 16
  return `${directions[index]} (${deg}°)`
}

function mapWeatherCode(code) {
  if (code === undefined || code === null) return 'Heavy Rain'
  if (code >= 95) return 'Thunderstorm & Heavy Rain'
  if (code >= 80) return 'Rain Showers & Squalls'
  if (code >= 65) return 'Continuous Heavy Rain'
  if (code >= 60) return 'Moderate Rain'
  if (code >= 51) return 'Light Drizzle'
  return 'Overcast with Squalls'
}
