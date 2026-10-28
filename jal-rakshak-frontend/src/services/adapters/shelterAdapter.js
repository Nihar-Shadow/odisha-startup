/**
 * Shelter Adapter — PS-074 Ganjam Disaster Intelligence
 * Normalizes relief shelter directories and occupancy metrics.
 */

import { createShelter, SourceCategory } from '../../domain/contracts'

export function normalizeShelter(rawShelter, source = SourceCategory.DEMO) {
  if (!rawShelter) return null

  const lat = rawShelter.lat ?? rawShelter.latitude ?? rawShelter.location?.coordinates?.[1] ?? 19.31
  const lng = rawShelter.lng ?? rawShelter.longitude ?? rawShelter.location?.coordinates?.[0] ?? 84.79
  const locationName =
    typeof rawShelter.locationName === 'string' && rawShelter.locationName
      ? rawShelter.locationName
      : typeof rawShelter.address === 'string' && rawShelter.address
      ? rawShelter.address
      : typeof rawShelter.location === 'string' && rawShelter.location
      ? rawShelter.location
      : 'Ganjam, Odisha'

  return createShelter({
    id: rawShelter.id || rawShelter._id || rawShelter.shelterId || `SH-${Date.now()}`,
    name: rawShelter.name || 'Ganjam Relief Shelter',
    locationName,
    lat: Number(lat) || 19.31,
    lng: Number(lng) || 84.79,
    capacity: rawShelter.totalCapacity ?? rawShelter.capacity ?? 1000,
    occupancy: rawShelter.currentOccupancy ?? rawShelter.occupancy ?? 0,
    status: rawShelter.status || 'ACTIVE',
    riskLevel: rawShelter.riskLevel || 'LOW',
    isRecommended: rawShelter.isRecommended !== undefined ? rawShelter.isRecommended : true,
    facilities: rawShelter.facilities || ['First Aid', 'Clean Water', 'Power Backup'],
    elevationMeters: rawShelter.elevationMeters ?? 30,
    roadCondition: rawShelter.roadCondition || 'Passable',
    phone: rawShelter.phone || rawShelter.contact?.phone || '+91 680 220011',
    source,
  })
}
