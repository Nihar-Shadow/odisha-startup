/**
 * Geospatial conversion & coordinate normalization utilities for Ganjam Disaster Intelligence.
 *
 * Coordinate Convention:
 * - Leaflet internal format: [lat, lng] (e.g. [19.31, 84.79])
 * - GeoJSON standard format: [lng, lat] (e.g. [84.79, 19.31])
 */

export const GANJAM_CENTER = [19.31, 84.79] // [lat, lng] Brahmapur, Ganjam District, Odisha

export const GANJAM_BBOX = {
  minLat: 18.95,
  maxLat: 20.15,
  minLng: 84.10,
  maxLng: 85.25,
}

/**
 * Converts a GeoJSON [lng, lat] pair to a Leaflet [lat, lng] pair.
 * @param {[number, number]} geoCoord - [lng, lat]
 * @returns {[number, number]} [lat, lng]
 */
export function toLeafletCoord(geoCoord) {
  if (!Array.isArray(geoCoord) || geoCoord.length < 2) return GANJAM_CENTER
  const [lng, lat] = geoCoord
  return [Number(lat), Number(lng)]
}

/**
 * Converts a Leaflet [lat, lng] pair to a GeoJSON [lng, lat] pair.
 * @param {[number, number]} leafletCoord - [lat, lng]
 * @returns {[number, number]} [lng, lat]
 */
export function toGeoJsonCoord(leafletCoord) {
  if (!Array.isArray(leafletCoord) || leafletCoord.length < 2) return [GANJAM_CENTER[1], GANJAM_CENTER[0]]
  const [lat, lng] = leafletCoord
  return [Number(lng), Number(lat)]
}

/**
 * Normalizes a polygon from GeoJSON [lng, lat] coordinates to Leaflet [lat, lng] coordinates.
 * @param {Array<[number, number]>} rings - Array of [lng, lat]
 * @returns {Array<[number, number]>} Array of [lat, lng]
 */
export function toLeafletPolygon(rings) {
  if (!Array.isArray(rings)) return []
  return rings.map(toLeafletCoord)
}

/**
 * Normalizes a polygon from Leaflet [lat, lng] coordinates to GeoJSON [lng, lat] coordinates.
 * @param {Array<[number, number]>} rings - Array of [lat, lng]
 * @returns {Array<[number, number]>} Array of [lng, lat]
 */
export function toGeoJsonPolygon(rings) {
  if (!Array.isArray(rings)) return []
  return rings.map(toGeoJsonCoord)
}

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}
