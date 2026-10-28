/**
 * Citizen Incident & Ground Evidence Adapter — PS-074 Ganjam Disaster Intelligence
 * Normalizes ground-truth citizen reports, images, road alerts, and SOS beacons into unified canonical structures.
 */

import {
  createCitizenIncident,
  createEvidence,
  SourceCategory,
  SeverityLevel,
  EvidenceType,
  EvidenceVerificationStatus,
  EvidenceSource,
} from '../../domain/contracts'
import {
  scoreAndVerifyEvidence,
  calculateEvidenceRiskContribution,
  evaluateGroundEvidenceIntelligence,
  getEvidenceForScenario,
  DEMO_GROUND_EVIDENCE,
} from '../intelligence/evidence/evidenceEngine'

export function normalizeCitizenReport(rawReport, source = SourceCategory.CITIZEN) {
  if (!rawReport) return null

  let severity = SeverityLevel.MEDIUM
  const waterDepth = String(rawReport.waterDepth || rawReport.description || '').toLowerCase()
  if (waterDepth.includes('chest') || waterDepth.includes('waist') || waterDepth.includes('1.') || waterDepth.includes('2.')) {
    severity = SeverityLevel.HIGH
  }
  if (rawReport.trappedPeople > 5 || rawReport.status === 'ESCALATED_TO_RESCUE') {
    severity = SeverityLevel.CRITICAL
  }

  const lat = rawReport.lat ?? rawReport.latitude ?? rawReport.location?.coordinates?.[1] ?? 19.31
  const lng = rawReport.lng ?? rawReport.longitude ?? rawReport.location?.coordinates?.[0] ?? 84.79
  const locationName =
    typeof rawReport.locationName === 'string' && rawReport.locationName
      ? rawReport.locationName
      : typeof rawReport.address === 'string' && rawReport.address
      ? rawReport.address
      : typeof rawReport.location === 'string' && rawReport.location
      ? rawReport.location
      : 'Ganjam'

  return createCitizenIncident({
    id: rawReport.id || rawReport._id || `REP-${Date.now()}`,
    lat: Number(lat) || 19.31,
    lng: Number(lng) || 84.79,
    locationName,
    category: rawReport.category || 'Waterlogging & Flood',
    description: rawReport.description || 'Hazard condition reported by citizen',
    severity,
    source,
    verified: Boolean(rawReport.verified || rawReport.verificationStatus === 'VERIFIED'),
    confidence: (rawReport.aiConfidence ?? 90) / 100,
    imageUrl: rawReport.imageUrl || rawReport.image?.secureUrl || null,
    trappedPeople: rawReport.trappedPeople ?? 0,
    needsBoat: Boolean(rawReport.needsBoat),
    status: rawReport.status || (rawReport.verified ? 'VERIFIED' : 'PENDING_REVIEW'),
    timestamp: rawReport.timestamp || rawReport.createdAt || new Date().toISOString(),
  })
}

export function normalizeEmergencySOS(rawSos) {
  if (!rawSos) return null

  const lat = rawSos.lat ?? rawSos.latitude ?? rawSos.location?.coordinates?.[1] ?? 19.31
  const lng = rawSos.lng ?? rawSos.longitude ?? rawSos.location?.coordinates?.[0] ?? 84.79
  const locationName =
    typeof rawSos.locationName === 'string' && rawSos.locationName
      ? rawSos.locationName
      : typeof rawSos.address === 'string' && rawSos.address
      ? rawSos.address
      : typeof rawSos.location === 'string' && rawSos.location
      ? rawSos.location
      : 'Ganjam District'

  return createCitizenIncident({
    id: rawSos.id || rawSos._id || rawSos.requestId || `SOS-${Date.now()}`,
    lat: Number(lat) || 19.31,
    lng: Number(lng) || 84.79,
    locationName,
    category: `SOS: ${rawSos.category || rawSos.requestType || 'Emergency Rescue Required'}`,
    description: rawSos.description || 'Emergency SOS Beacon triggered',
    severity: SeverityLevel.CRITICAL,
    source: SourceCategory.SOS,
    verified: true,
    confidence: 0.98,
    trappedPeople: rawSos.totalPeople ?? rawSos.peopleCount ?? 1,
    needsBoat: true,
    status: rawSos.status || 'DISPATCHED',
    timestamp: rawSos.timestamp || rawSos.createdAt || new Date().toISOString(),
  })
}

/**
 * Normalizes any raw citizen submission into canonical Evidence contract
 */
export function normalizeCitizenEvidence(raw) {
  if (!raw) return null

  let type = EvidenceType.FLOOD_REPORT
  if (raw.type && Object.values(EvidenceType).includes(raw.type)) {
    type = raw.type
  } else if (raw.category?.toLowerCase().includes('sos') || raw.isSos) {
    type = EvidenceType.SOS
  } else if (raw.category?.toLowerCase().includes('road') || raw.affectedRoad) {
    type = EvidenceType.ROAD_BLOCKAGE
  } else if (raw.category?.toLowerCase().includes('shelter') || raw.affectedShelter) {
    type = EvidenceType.SHELTER_REPORT
  } else if (raw.imageUrl || raw.image) {
    type = EvidenceType.IMAGE
  }

  const lat = raw.lat ?? raw.latitude ?? raw.location?.coordinates?.[1] ?? raw.location?.lat ?? 19.31
  const lng = raw.lng ?? raw.longitude ?? raw.location?.coordinates?.[0] ?? raw.location?.lng ?? 84.79
  const name =
    typeof raw.locationName === 'string' && raw.locationName
      ? raw.locationName
      : typeof raw.address === 'string' && raw.address
      ? raw.address
      : typeof raw.location === 'string' && raw.location
      ? raw.location
      : typeof raw.location?.name === 'string'
      ? raw.location.name
      : 'Ganjam'

  const scored = scoreAndVerifyEvidence({
    ...raw,
    type,
    location: { lat, lng, name },
  })

  return createEvidence({
    id: raw.id || raw._id || `E-${Date.now()}`,
    type,
    source: raw.source || EvidenceSource.CITIZEN,
    timestamp: raw.timestamp || raw.createdAt || new Date().toISOString(),
    location: { lat, lng, name },
    imageUrl: raw.imageUrl || raw.image?.secureUrl || null,
    description: raw.description || '',
    severity: raw.severity || (type === EvidenceType.SOS ? SeverityLevel.CRITICAL : SeverityLevel.HIGH),
    confidence: scored.confidence,
    verificationStatus: raw.verificationStatus || scored.verificationStatus,
    floodIndicators: raw.floodIndicators || {
      detected: Boolean(raw.imageUrl || type === EvidenceType.FLOOD_REPORT),
      waterDepthEst: raw.waterDepth || null,
      confidence: scored.confidence,
    },
    affectedRoad: raw.affectedRoad || null,
    affectedShelter: raw.affectedShelter || null,
    riskContribution: calculateEvidenceRiskContribution({
      ...raw,
      type,
      confidence: scored.confidence,
      verificationStatus: scored.verificationStatus,
    }),
    appliedToRisk: scored.verificationStatus === EvidenceVerificationStatus.VERIFIED,
    metadata: raw.metadata || {},
  })
}

// Re-export core evidence engine functions for seamless integration
export {
  evaluateGroundEvidenceIntelligence,
  getEvidenceForScenario,
  scoreAndVerifyEvidence,
  calculateEvidenceRiskContribution,
  DEMO_GROUND_EVIDENCE,
}
