/**
 * Emergency & Rescue Response Adapter — PS-074 Ganjam Disaster Intelligence
 * Normalizes field responder squads, modelled response units, and dispatch decisions.
 */

import { createResponseUnit, SourceCategory } from '../../domain/contracts'
import {
  GANJAM_DEMO_RESPONSE_UNITS,
  evaluateDispatchDecisions,
  calculateIncidentPriorityScore,
  evaluateRouteSafety,
  recommendShelter,
  determineResourcePriorities,
  matchBestResponseUnit,
} from '../intelligence/dispatch/dispatchEngine'

export function normalizeResponseUnit(rawTeam, source = SourceCategory.DEMO) {
  if (!rawTeam) return null

  return createResponseUnit({
    id: rawTeam.id || rawTeam._id || `RU-${Date.now()}`,
    name: rawTeam.name || rawTeam.teamName || 'Ganjam Emergency Response Unit',
    commander: rawTeam.commander || rawTeam.leadOfficer || 'ODRAF Officer',
    type: rawTeam.type || rawTeam.unitType || 'RESCUE_TEAM',
    unitType: rawTeam.unitType || rawTeam.type || 'Rescue Team',
    location: rawTeam.location || {
      lat: rawTeam.lat ?? rawTeam.latitude ?? 19.31,
      lng: rawTeam.lng ?? rawTeam.longitude ?? 84.79,
      name: rawTeam.currentLocation || rawTeam.baseLocation || 'Ganjam Operational Base',
    },
    currentLocation: rawTeam.currentLocation || rawTeam.baseLocation || 'Ganjam Operational Base',
    lat: rawTeam.lat ?? rawTeam.latitude ?? 19.31,
    lng: rawTeam.lng ?? rawTeam.longitude ?? 84.79,
    status: rawTeam.status || 'AVAILABLE',
    activeMissionId: rawTeam.activeMissionId || rawTeam.currentIncidentId || null,
    currentIncidentId: rawTeam.currentIncidentId || rawTeam.activeMissionId || null,
    capacity: rawTeam.capacity ?? rawTeam.capacityPersons ?? 15,
    capacityPersons: rawTeam.capacityPersons ?? rawTeam.capacity ?? 15,
    capabilities: rawTeam.capabilities || ['SEARCH', 'WATER_RESCUE'],
    availability: rawTeam.availability !== undefined ? rawTeam.availability : rawTeam.status !== 'UNAVAILABLE',
    source,
    lastUpdated: rawTeam.lastUpdated || new Date().toISOString(),
  })
}

export {
  GANJAM_DEMO_RESPONSE_UNITS,
  evaluateDispatchDecisions,
  calculateIncidentPriorityScore,
  evaluateRouteSafety,
  recommendShelter,
  determineResourcePriorities,
  matchBestResponseUnit,
}
