import React from 'react'
import {
  CloudRain,
  Wind,
  Thermometer,
  Compass,
  TrendingUp,
  AlertTriangle,
  Radio,
  Clock,
  Gauge,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { SourceCategory } from '../../domain/contracts'

export default function WeatherPanel({
  weather,
  scenario = 'BASELINE',
  onScenarioChange,
}) {
  if (!weather) return null

  const isLive = weather.source === SourceCategory.LIVE
  const isCached = weather.source === 'CACHED'
  const trend = weather.trend || 'STABLE'
  const severity = weather.severity || 'WATCH'

  const getTrendColor = (t) => {
    switch (t) {
      case 'SEVERE':
        return 'text-red-400 bg-red-950/60 border-red-800/60'
      case 'WORSENING':
        return 'text-orange-400 bg-orange-950/60 border-orange-800/60'
      case 'IMPROVING':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
      case 'STABLE':
      default:
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60'
    }
  }

  const getSeverityBadge = (s) => {
    switch (s) {
      case 'SEVERE':
        return { label: 'SEVERE SQUALL', color: 'bg-red-500/20 text-red-300 border-red-500/40' }
      case 'WARNING':
        return { label: 'WARNING LEVEL', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' }
      case 'WATCH':
        return { label: 'WATCH ADVISORY', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
      case 'NORMAL':
      default:
        return { label: 'NORMAL MONSOON', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
    }
  }

  const sevBadge = getSeverityBadge(severity)

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header with Source & Freshness */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Ganjam Weather Intelligence</h3>
              <p className="text-[10px] text-slate-400">
                {weather.stationName || 'IMD Gopalpur Telemetry (Ganjam)'}
              </p>
            </div>
          </div>

          {/* Ground Truth Provenance Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isCached
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLive ? 'bg-emerald-400 animate-pulse' : isCached ? 'bg-blue-400' : 'bg-amber-400'
                }`}
              />
              <span>SOURCE: {weather.source || 'DEMO'}</span>
            </span>
          </div>
        </div>

        {/* Freshness Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2.5 mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{weather.freshness || 'Telemetry feed active'}</span>
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sevBadge.color}`}>
            {sevBadge.label}
          </span>
        </div>
      </div>

      {/* Demo Scenario Control Strip */}
      <div className="bg-slate-950/80 p-2 rounded-2xl border border-slate-800/90">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Weather Scenario (Demo Simulation)
          </span>
          <span className="text-[9px] font-mono text-slate-500">Model Input Driver</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onScenarioChange && onScenarioChange('BASELINE')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${
              scenario === 'BASELINE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Baseline (68mm)
          </button>
          <button
            type="button"
            onClick={() => onScenarioChange && onScenarioChange('WORSENING')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${
              scenario === 'WORSENING' || scenario === 'ESCALATED'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Worsening (90mm)
          </button>
          <button
            type="button"
            onClick={() => onScenarioChange && onScenarioChange('SEVERE')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${
              scenario === 'SEVERE'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Severe (&gt;100mm)
          </button>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rainfall Intensity & Windows */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Precipitation Rate</span>
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
            {weather.rainfallMmPerHour}
            <span className="text-xs font-normal text-slate-400">mm/hr</span>
          </div>
          <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>3h Accumulation:</span>
              <strong className="text-cyan-300 font-mono">{weather.rainfall3h || (weather.rainfallMmPerHour * 1.7).toFixed(1)} mm</strong>
            </div>
            <div className="flex justify-between">
              <span>24h Total Window:</span>
              <strong className="text-cyan-300 font-mono">{weather.rainfall24h || (weather.rainfallMmPerHour * 2.7).toFixed(1)} mm</strong>
            </div>
          </div>
        </div>

        {/* Wind Velocity & Gusts */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>Wind Velocity</span>
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
            {weather.windSpeedKmh}
            <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Wind Gust:</span>
              <strong className="text-blue-300 font-mono">{weather.windGustKmh || 58} km/h</strong>
            </div>
            <div className="flex justify-between truncate">
              <span>Dir:</span>
              <span className="text-slate-300 font-medium truncate">{weather.windDirection || 'ENE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Secondary Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 block">Temperature</span>
          <strong className="text-slate-200 font-mono">{weather.temperatureC}°C</strong>
        </div>
        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 block">Pressure</span>
          <strong className="text-amber-400 font-mono">{weather.pressure || 996} hPa</strong>
        </div>
        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 block">Precip Prob</span>
          <strong className="text-cyan-400 font-mono">{weather.precipitationProbability || 85}%</strong>
        </div>
      </div>

      {/* Weather Trend & Condition Classification */}
      <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Observed Condition:</span>
          <strong className="text-white font-medium">{weather.condition || weather.forecastCondition}</strong>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Measurable Trend:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTrendColor(trend)}`}>
            {trend}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Modelled Severity:</span>
          <span className="text-slate-300 font-semibold">{severity} (MODELLED WEATHER)</span>
        </div>
      </div>

      {/* Compact 6-Hour Forecast Strip */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300">
              6-Hour Precipitation Forecast
            </span>
            <span className="text-[9px] font-mono text-cyan-400">Open-Meteo Hourly</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {weather.forecast.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 text-center space-y-0.5"
              >
                <div className="text-[10px] font-mono text-slate-400 font-bold">{item.time}</div>
                <div className="text-xs font-black font-mono text-cyan-300">{item.rainfallMm}mm</div>
                <div className="text-[9px] text-slate-400">{item.precipitationProbability}% pop</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
