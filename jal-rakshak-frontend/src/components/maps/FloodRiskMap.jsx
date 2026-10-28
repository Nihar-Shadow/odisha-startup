import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { useFloodData } from '../../context/FloodDataContext'
import { useLocation } from '../../context/LocationContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import MapLegend from './MapLegend'
import MapControls from './MapControls'
import {
  Navigation,
  Phone,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertOctagon,
  ExternalLink,
  MapPin,
  Building2,
  Hospital,
  Zap,
} from 'lucide-react'
import { GANJAM_MODELLED_INFRASTRUCTURE } from '../../services/intelligence/vulnerability/infrastructureImpactEngine'
import { GANJAM_MODELLED_POPULATION_EXPOSURE } from '../../services/intelligence/vulnerability/vulnerabilityPriorityEngine'

// Center and bounds adjuster component for Leaflet
function MapRecenter({ center, zoom, bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length > 1) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      } catch (e) {
        // fallback
      }
    } else if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 })
    }
  }, [center, zoom, bounds, map])
  return null
}

export default function FloodRiskMap({
  height = '600px',
  center = null,
  zoom = 13,
  showControls = true,
  routeWaypoints = null,
  highlightShelterId = null,
  activeNavPoint = null,
  isNavigating = false,
  activeZones = null,
  groundEvidence = null,
  responseUnits = null,
  dispatchRoute = null,
  satelliteObservation = null,
  cycloneObservation = null,
  populationExposure = null,
  criticalInfrastructure = null,
  infrastructureImpacts = null,
  zonePriorities = null,
}) {
  const { riskZones: defaultRiskZones, shelters, reports, emergencies, rescueTeams } = useFloodData()
  const riskZones = activeZones || defaultRiskZones
  const activeGroundEvidence = groundEvidence?.evidenceList || (Array.isArray(groundEvidence) ? groundEvidence : [])
  const { selectedLocation } = useLocation()
  const { latitude: gpsLat, longitude: gpsLng, accuracy: gpsAcc } = useGeolocation()

  const liveLat = selectedLocation?.latitude ?? gpsLat ?? 19.31
  const liveLng = selectedLocation?.longitude ?? gpsLng ?? 84.79
  const userLocation = [liveLat, liveLng]
  const userLocationName = selectedLocation?.name || 'Ganjam (Brahmapur)'
  const userDistrict = selectedLocation?.district ? `• District: ${selectedLocation.district}` : '• District: Ganjam'
  const userAccuracy = Math.round(selectedLocation?.accuracy ?? gpsAcc ?? 75)

  const defaultCenter = activeNavPoint || center || userLocation
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(isNavigating ? 16 : zoom)
  const [selectedTime, setSelectedTime] = useState('NOW')
  const [layers, setLayers] = useState({
    zones: true,
    shelters: true,
    emergencies: true,
    reports: true,
    rescue: true,
    groundEvidence: true,
    responseUnits: true,
    dispatchRoutes: true,
    satelliteExtent: true,
    cycloneTrack: true,
    criticalInfrastructure: true,
    populationExposure: true,
    priorityZones: true,
  })

  // Keep map centered if external activeNavPoint or center prop updates
  useEffect(() => {
    if (activeNavPoint) {
      setMapCenter(activeNavPoint)
      setMapZoom(16)
    } else if (center) {
      setMapCenter(center)
    }
  }, [activeNavPoint, center])

  // Create custom DivIcons for Leaflet
  const createDivIcon = (htmlContent, className = 'custom-div-icon', iconSize = [32, 32]) => {
    return L.divIcon({
      html: htmlContent,
      className,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
      popupAnchor: [0, -iconSize[1] / 2],
    })
  }

  // Icons HTML
  const sosIcon = createDivIcon(
    `<div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute w-8 h-8 rounded-full bg-red-600 animate-ping opacity-75"></span>
      <span class="relative w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-lg font-bold text-[10px]">SOS</span>
    </div>`,
    'sos-marker',
    [32, 32]
  )

  const shelterIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-purple-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>`,
    'shelter-marker',
    [32, 32]
  )

  const reportIcon = createDivIcon(
    `<div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-white flex items-center justify-center shadow-md">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    </div>`,
    'report-marker',
    [28, 28]
  )

  const rescueIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
    </div>`,
    'rescue-marker',
    [32, 32]
  )

  const userGpsIcon = createDivIcon(
    `<div class="relative flex items-center justify-center w-6 h-6">
      <span class="absolute w-6 h-6 rounded-full bg-brand-500 animate-ping opacity-60"></span>
      <span class="relative w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-md"></span>
    </div>`,
    'user-marker',
    [24, 24]
  )

  const navArrowIcon = createDivIcon(
    `<div class="relative flex items-center justify-center w-10 h-10">
      <span class="absolute w-10 h-10 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
      <span class="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xl font-bold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </span>
    </div>`,
    'nav-arrow-marker',
    [40, 40]
  )

  // Ground Evidence Phase 4 DivIcons
  const evidenceFloodIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-full bg-cyan-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
    </div>`,
    'evidence-flood-marker',
    [32, 32]
  )

  const evidenceImageIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </div>`,
    'evidence-image-marker',
    [32, 32]
  )

  const evidenceSosIcon = createDivIcon(
    `<div class="relative flex items-center justify-center w-9 h-9">
      <span class="absolute w-9 h-9 rounded-full bg-red-600 animate-ping opacity-80"></span>
      <span class="relative w-8 h-8 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-xl font-black text-[10px]">SOS</span>
    </div>`,
    'evidence-sos-marker',
    [36, 36]
  )

  const evidenceRoadIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-amber-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>`,
    'evidence-road-marker',
    [32, 32]
  )

  const evidenceShelterIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-purple-700 border-2 border-amber-400 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="12" y1="12" x2="12" y2="15"/><circle cx="12" cy="18" r="0.5"/></svg>
    </div>`,
    'evidence-shelter-marker',
    [32, 32]
  )

  const unitBoatIcon = createDivIcon(
    `<div class="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
    </div>`,
    'response-boat-marker',
    [36, 36]
  )

  const unitAmbulanceIcon = createDivIcon(
    `<div class="w-9 h-9 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v12M6 12h12"/></svg>
    </div>`,
    'response-ambulance-marker',
    [36, 36]
  )

  const unitSupplyIcon = createDivIcon(
    `<div class="w-9 h-9 rounded-full bg-purple-600 border-2 border-white text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    </div>`,
    'response-supply-marker',
    [36, 36]
  )

  const unitFireIcon = createDivIcon(
    `<div class="w-9 h-9 rounded-full bg-amber-600 border-2 border-white text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
    </div>`,
    'response-fire-marker',
    [36, 36]
  )

  // Phase 8 Critical Infrastructure DivIcons
  const infraHospitalIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-rose-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-sm">🏥</div>`,
    'infra-hospital-marker',
    [32, 32]
  )
  const infraBridgeIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-amber-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-sm">🌉</div>`,
    'infra-bridge-marker',
    [32, 32]
  )
  const infraPowerIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-yellow-500 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-sm">⚡</div>`,
    'infra-power-marker',
    [32, 32]
  )
  const infraWaterIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-sm">💧</div>`,
    'infra-water-marker',
    [32, 32]
  )
  const infraShelterIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-purple-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-sm">🏠</div>`,
    'infra-shelter-marker',
    [32, 32]
  )
  const infraGenericIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-slate-700 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-sm">🏛️</div>`,
    'infra-generic-marker',
    [32, 32]
  )

  const handleLocateMe = () => {
    setMapCenter(userLocation)
    setMapZoom(14)
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapRecenter center={mapCenter} zoom={mapZoom} bounds={routeWaypoints} />

        {/* Base OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Jal Rakshak AI'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS Circle & Marker */}
        <Marker position={userLocation} icon={userGpsIcon}>
          <Popup>
            <div className="p-3 text-xs font-sans min-w-[200px]">
              <div className="flex items-center gap-1.5 text-brand-600 mb-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Your Live GPS Location</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{userLocationName}</h4>
              {userDistrict && <p className="text-slate-600 font-semibold text-[11px] mt-0.5">{userDistrict}</p>}
              <div className="mt-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-600 flex justify-between">
                <span>[{liveLat.toFixed(4)}, {liveLng.toFixed(4)}]</span>
                <span>±{userAccuracy}m</span>
              </div>
              <Link
                to="/route"
                className="mt-2.5 inline-flex items-center gap-1.5 w-full justify-center px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate to Safe Shelter
              </Link>
            </div>
          </Popup>
        </Marker>
        {/* Active In-Map Navigation Waypoint / User Turn Marker */}
        {activeNavPoint && (
          <Marker position={activeNavPoint} icon={navArrowIcon}>
            <Popup>
              <div className="p-2 text-xs font-sans font-bold text-emerald-700">
                <span>Active Navigation Step Target</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Flood Risk Polygons */}
        {layers.zones &&
          riskZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: selectedTime === '+6h' ? zone.fillOpacity + 0.2 : zone.fillOpacity,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-3 text-xs font-sans max-w-[280px] space-y-1.5">
                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-200">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white inline-block"
                      style={{ backgroundColor: zone.color }}
                    >
                      ZONE: {zone.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">
                      Risk: {zone.riskScore || zone.score || 89} {zone.severity || 'CRITICAL'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{zone.name}</h4>
                  <div className="space-y-0.5 text-[11px] text-slate-600 font-mono">
                    <div>Exposed Population: <strong className="text-slate-900">{(zone.affectedPopulation || zone.populationAtRisk || 7200).toLocaleString('en-IN')}</strong></div>
                    <div>Vulnerable Population: <strong className="text-rose-700 font-bold">{(zone.vulnerablePopulation || 2600).toLocaleString('en-IN')}</strong></div>
                    <div>Infrastructure Impact: <strong className="text-purple-700 font-bold">{zone.infraImpact || 'HIGH'}</strong></div>
                    <div>Road Status: <strong className="text-red-700 font-bold">{zone.roadStatus || 'SH-36 BLOCKED'}</strong></div>
                  </div>
                  <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-semibold">
                    Recommended Action: {zone.recommendedAction || 'Prioritize vulnerable population evacuation.'}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100 font-mono">
                    <span>Conf: {Math.round((zone.confidence || 0.85) * 100)}%</span>
                    <span>MODELLED RISK ZONE</span>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

        {/* Relief Shelters Markers */}
        {layers.shelters &&
          shelters
            .filter((s) => !isNaN(Number(s?.lat)) && !isNaN(Number(s?.lng)))
            .map((shelter) => (
              <Marker key={shelter.id} position={[Number(shelter.lat), Number(shelter.lng)]} icon={shelterIcon}>
                <Popup>
                  <div className="p-3 text-xs font-sans max-w-[260px] space-y-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono">
                        {shelter.id || 'SH-02'}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${shelter.status === 'AT_RISK' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {shelter.status || 'RECOMMENDED'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{shelter.name}</h4>
                    <p className="text-slate-500 text-[11px]">
                      {typeof shelter.locationName === 'string' ? shelter.locationName : shelter.address || 'Ganjam'}
                    </p>

                    <div className="space-y-0.5 text-[11px] font-mono text-slate-600">
                      <div>Capacity: <strong className="text-emerald-700 font-bold">{shelter.availableSlots || (shelter.capacity ? shelter.capacity - (shelter.currentOccupancy || 0) : 1060)} available</strong></div>
                      <div>Elevation: <strong className="text-slate-800">{shelter.elevationMeters || 28}m</strong></div>
                      <div>Risk: <strong className={shelter.riskLevel === 'CRITICAL' || shelter.riskLevel === 'HIGH' ? 'text-red-700 font-bold' : 'text-slate-800'}>{shelter.riskLevel || 'LOW'}</strong></div>
                      <div>Status: <strong className={shelter.status === 'AT_RISK' ? 'text-red-700 font-bold' : 'text-emerald-700'}>{shelter.status || 'RECOMMENDED'}</strong></div>
                    </div>

                    <div className="mt-2 flex gap-1.5">
                      <Link
                        to={`/route?shelter=${shelter.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-600 text-white font-semibold text-[11px] hover:bg-brand-700"
                      >
                        <Navigation className="w-3 h-3" /> Safe Route
                      </Link>
                      <a
                        href={`tel:${shelter.phone || '+916802220100'}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Call Shelter"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* SOS Emergency Distress Markers */}
        {layers.emergencies &&
          emergencies
            .filter((s) => !isNaN(Number(s?.lat)) && !isNaN(Number(s?.lng)))
            .map((sos) => (
              <Marker key={sos.id} position={[Number(sos.lat), Number(sos.lng)]} icon={sosIcon}>
                <Popup>
                  <div className="p-3 text-xs font-sans max-w-[260px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                        PRIORITY {sos.priority} ({sos.priorityScore}/100)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{sos.id}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{sos.category}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {typeof sos.location === 'string' ? sos.location : sos.address || sos.locationName || 'Ganjam District'}
                    </p>

                    <div className="mt-2 bg-red-50 p-2 rounded-lg border border-red-100 text-[11px] text-red-900 space-y-1">
                      <p className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-red-600" /> {sos.peopleCount} Stranded Persons
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{sos.description}</p>
                      <p className="text-[10px] font-bold text-brand-700 mt-1">
                        Assigned: {sos.assignedTeam || 'Pending Team Dispatch'}
                      </p>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <Link
                        to={`/rescue/assignments`}
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700"
                      >
                        Field Rescue Details &rarr;
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Citizen Hazard Reports */}
        {layers.reports &&
          reports
            .filter((r) => !isNaN(Number(r?.lat)) && !isNaN(Number(r?.lng)))
            .map((rep) => (
              <Marker key={rep.id} position={[Number(rep.lat), Number(rep.lng)]} icon={reportIcon}>
                <Popup>
                  <div className="p-2 text-xs font-sans max-w-[240px]">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      HAZARD REPORT ({rep.status})
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{rep.category}</h4>
                    <p className="text-slate-500 text-[10px]">
                      {typeof rep.location === 'string' ? rep.location : rep.address || rep.locationName || 'Ganjam'}
                    </p>
                    <p className="text-slate-700 text-[11px] mt-1 italic">"{rep.description}"</p>
                    <div className="mt-1.5 text-[10px] text-slate-500 flex justify-between">
                      <span>Depth: <strong>{rep.waterDepth}</strong></span>
                      <span>AI Conf: <strong>{rep.aiConfidence}%</strong></span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Rescue Boats */}
        {layers.rescue &&
          rescueTeams
            .filter((t) => !isNaN(Number(t?.lat)) && !isNaN(Number(t?.lng)))
            .map((team) => (
              <Marker key={team.id} position={[Number(team.lat), Number(team.lng)]} icon={rescueIcon}>
                <Popup>
                  <div className="p-3 text-xs font-sans max-w-[240px]">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      RESCUE SQUAD ({team.status})
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{team.name}</h4>
                    <p className="text-slate-500 text-[11px]">Cmdr: {team.commander}</p>
                    <p className="text-slate-700 text-[11px] mt-1">Craft: {team.unitType}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Phase 4: Ground Truth Citizen Evidence Layer */}
        {layers.groundEvidence &&
          activeGroundEvidence.map((ev) => {
            const evLat = ev.location?.lat ?? ev.lat ?? 19.31
            const evLng = ev.location?.lng ?? ev.lng ?? 84.79
            const locName = ev.location?.name || ev.locationName || 'Ganjam'
            const isVerified = ev.verificationStatus === 'VERIFIED'
            
            let icon = evidenceFloodIcon
            let typeLabel = 'Flood Report'
            if (ev.type === 'IMAGE' || ev.imageUrl) {
              icon = evidenceImageIcon
              typeLabel = 'Image Evidence'
            } else if (ev.type === 'SOS') {
              icon = evidenceSosIcon
              typeLabel = 'SOS Distress'
            } else if (ev.type === 'ROAD_BLOCKAGE' || ev.affectedRoad) {
              icon = evidenceRoadIcon
              typeLabel = 'Road Blockage'
            } else if (ev.type === 'SHELTER_REPORT' || ev.affectedShelter) {
              icon = evidenceShelterIcon
              typeLabel = 'Shelter Issue'
            }

            return (
              <Marker key={ev.id} position={[evLat, evLng]} icon={icon}>
                <Popup>
                  <div className="p-3 text-xs font-sans max-w-[280px]">
                    <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        GROUND EVIDENCE
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">{ev.id}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Type:</span>
                        <strong className="text-slate-900">{typeLabel}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Location:</span>
                        <strong className="text-slate-800 text-right truncate max-w-[150px]">{locName}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Severity:</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                          ev.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 font-bold' :
                          ev.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 font-bold' :
                          'bg-amber-100 text-amber-700 font-bold'
                        }`}>
                          {ev.severity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Confidence:</span>
                        <strong className="text-slate-900 font-mono">{Math.round((ev.confidence || 0.9) * 100)}%</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Status:</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ev.verificationStatus || 'VERIFIED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Reported:</span>
                        <span className="text-slate-600">Recent field report</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-semibold">Risk Contribution:</span>
                        <strong className="text-red-600 font-mono font-bold">+{ev.riskContribution || 0} Risk</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-200 italic">
                      "{ev.description}"
                    </p>

                    {ev.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                        <img src={ev.imageUrl} alt="Ground Evidence" className="w-full h-24 object-cover" />
                      </div>
                    )}

                    {ev.affectedRoad && (
                      <div className="mt-2 p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                        <strong>Road Alert:</strong> {ev.affectedRoad.roadName} ({ev.affectedRoad.status})
                      </div>
                    )}

                    {ev.affectedShelter && (
                      <div className="mt-2 p-1.5 rounded bg-purple-50 border border-purple-200 text-[10px] text-purple-900">
                        <strong>Shelter Impact:</strong> {ev.affectedShelter.shelterName} ({ev.affectedShelter.status})
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

        {/* Safe Route Polyline Overlay */}
        {routeWaypoints && routeWaypoints.length > 1 && (
          <>
            <Polyline
              positions={routeWaypoints}
              pathOptions={{
                color: '#0284C7',
                weight: 8,
                opacity: 0.35,
              }}
            />
            <Polyline
              positions={routeWaypoints}
              pathOptions={{
                color: '#0284C7',
                weight: 5,
                opacity: 1,
                dashArray: '10, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Phase 5 Dispatch Routes: Safe Detour and Rejected Blocked Road */}
        {layers.dispatchRoutes && dispatchRoute?.recommendedRoute?.waypoints && (
          <>
            {/* Safe Alternative Route Polyline */}
            <Polyline
              positions={dispatchRoute.recommendedRoute.waypoints}
              pathOptions={{
                color: '#0284C7',
                weight: 8,
                opacity: 0.35,
              }}
            />
            <Polyline
              positions={dispatchRoute.recommendedRoute.waypoints}
              pathOptions={{
                color: '#0284C7',
                weight: 5,
                opacity: 1,
                dashArray: '10, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Rejected Blocked Route (e.g. SH-36) */}
        {layers.dispatchRoutes && dispatchRoute?.rejectedRoute?.waypoints && (
          <Polyline
            positions={dispatchRoute.rejectedRoute.waypoints}
            pathOptions={{
              color: '#EF4444',
              weight: 4,
              opacity: 0.85,
              dashArray: '6, 6',
              lineCap: 'round',
            }}
          />
        )}

        {/* Modelled Response Units (Phase 5) */}
        {layers.responseUnits && responseUnits && responseUnits.map((unit) => {
          const uLat = unit.location?.lat ?? unit.lat ?? 19.31
          const uLng = unit.location?.lng ?? unit.lng ?? 84.79
          let icon = unitBoatIcon
          if (unit.type === 'AMBULANCE' || unit.capabilities?.includes('MEDICAL')) icon = unitAmbulanceIcon
          else if (unit.type === 'SUPPLY_VEHICLE' || unit.capabilities?.includes('SUPPLIES')) icon = unitSupplyIcon
          else if (unit.type === 'FIRE_RESPONSE') icon = unitFireIcon

          return (
            <Marker key={unit.id} position={[uLat, uLng]} icon={icon}>
              <Popup>
                <div className="p-3 text-xs font-sans max-w-[260px] space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                      {unit.id}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${unit.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-800'}`}>
                      {unit.status || 'PRE-POSITIONED'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{unit.name}</h4>
                  <div className="text-[11px] text-slate-500">{unit.location?.name || unit.currentLocation || 'Ganjam Sector'}</div>
                  <div className="space-y-0.5 text-[11px] font-mono text-slate-600">
                    <div>Capability: <strong className="text-slate-900">{unit.capabilities?.join(', ') || 'WATER_RESCUE, EVACUATION'}</strong></div>
                    <div>Capacity: <strong className="text-slate-900">{unit.capacity || 16} Persons</strong></div>
                    <div>Status: <strong className={unit.status === 'AVAILABLE' ? 'text-emerald-700' : 'text-cyan-700'}>{unit.status || 'PRE-POSITIONED'}</strong></div>
                    {unit.currentIncidentId && <div>Incident: <strong className="text-cyan-700">{unit.currentIncidentId}</strong></div>}
                    {unit.etaMinutes && <div>ETA: <strong className="text-cyan-700">{unit.etaMinutes} min</strong></div>}
                  </div>
                  <div className="pt-1 border-t border-slate-100 text-[9px] text-slate-400 font-mono">
                    PROVENANCE: DETERMINISTIC RESOURCE ALLOCATION
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Phase 6: Satellite Earth Observation Extent Layer (Sentinel-1 SAR) */}
        {layers.satelliteExtent && satelliteObservation && satelliteObservation.geometry?.coordinates && (
          <Polygon
            positions={
              // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
              satelliteObservation.geometry.coordinates[0].map((coord) =>
                coord[0] > 70 ? [coord[1], coord[0]] : [coord[0], coord[1]]
              )
            }
            pathOptions={{
              color: '#6366F1',
              fillColor: '#818CF8',
              fillOpacity: 0.35,
              weight: 2.5,
              dashArray: '6, 6',
            }}
          >
            <Popup>
              <div className="p-3 text-xs font-sans max-w-[270px]">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    SATELLITE OBSERVATION
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {satelliteObservation.dataStatus || 'DEMO'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">
                  {satelliteObservation.satellite || 'Sentinel-1'} ({satelliteObservation.sensor || 'SAR'})
                </h4>
                <div className="text-[11px] text-slate-600">
                  Observation: {satelliteObservation.observationType || 'Flood Extent'}
                </div>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acquisition:</span>
                    <strong className="text-slate-800 font-mono text-[10px]">
                      {satelliteObservation.acquisitionTime || '2026-10-19 05:11 UTC'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confidence:</span>
                    <strong className="text-indigo-600 font-mono font-bold">
                      {Math.round((satelliteObservation.confidence || 0.89) * 100)}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affected Area:</span>
                    <strong className="text-slate-800 font-mono">
                      {satelliteObservation.affectedAreaKm2 || 51.8} km²
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Spatial Overlap:</span>
                    <strong className="text-emerald-700 font-mono font-bold">82%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Citizen Evidence:</span>
                    <span className="text-emerald-700 font-bold">3 matching reports</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model Agreement:</span>
                    <span className="text-indigo-700 font-bold">HIGH</span>
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 italic">
                  Copernicus Sentinel-1 SAR Dual-Pol Inundation Extent (Lee speckle + Otsu thresholding)
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Phase 7: Cyclone Intelligence + Bay of Bengal Track & Forecast Cone */}
        {layers.cycloneTrack && cycloneObservation && cycloneObservation.status !== 'NO_CYCLONE' && (
          <>
            {/* Uncertainty Cone Polygon */}
            {cycloneObservation.uncertaintyCone?.geometry?.coordinates?.[0] && (
              <Polygon
                positions={cycloneObservation.uncertaintyCone.geometry.coordinates[0].map((coord) =>
                  coord[0] > 70 ? [coord[1], coord[0]] : [coord[0], coord[1]]
                )}
                pathOptions={{
                  color: '#EA580C',
                  fillColor: '#F97316',
                  fillOpacity: 0.16,
                  weight: 2,
                  dashArray: '5, 5',
                }}
              >
                <Popup>
                  <div className="p-2.5 text-xs font-sans max-w-[220px]">
                    <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
                      FORECAST UNCERTAINTY CONE
                    </span>
                    <p className="text-[11px] text-slate-700 mt-1">
                      70% probability envelope based on ensemble trajectory dispersion.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Status: {cycloneObservation.dataStatus || 'DEMO'}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            )}

            {/* Historical Track (Solid Orange Line) */}
            {cycloneObservation.historicalTrack && cycloneObservation.historicalTrack.length > 0 && (
              <Polyline
                positions={[
                  ...cycloneObservation.historicalTrack.map((p) => [p.latitude, p.longitude]),
                  ...(cycloneObservation.position ? [[cycloneObservation.position.latitude, cycloneObservation.position.longitude]] : []),
                ]}
                pathOptions={{
                  color: '#F97316',
                  weight: 3.5,
                  opacity: 0.85,
                }}
              />
            )}

            {/* Forecast Track (Dashed Red Line) */}
            {cycloneObservation.forecastTrack && cycloneObservation.forecastTrack.length > 0 && (
              <Polyline
                positions={[
                  ...(cycloneObservation.position ? [[cycloneObservation.position.latitude, cycloneObservation.position.longitude]] : []),
                  ...cycloneObservation.forecastTrack.map((p) => [p.latitude, p.longitude]),
                ]}
                pathOptions={{
                  color: '#EF4444',
                  weight: 3.5,
                  dashArray: '6, 6',
                  opacity: 0.95,
                }}
              />
            )}

            {/* Current Cyclone Eye Marker */}
            {cycloneObservation.position && (
              <Marker
                position={[cycloneObservation.position.latitude, cycloneObservation.position.longitude]}
                icon={createDivIcon(
                  `<div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
                    <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                    <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 2.5px dashed #ef4444; background: rgba(15, 23, 42, 0.92); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(239, 68, 68, 0.7);">
                      <span style="font-size: 15px;">🌀</span>
                    </div>
                  </div>`,
                  'cyclone-marker-icon',
                  [38, 38]
                )}
              >
                <Popup>
                  <div className="p-3 text-xs font-sans max-w-[280px]">
                    <div className="flex items-center justify-between pb-1 border-b border-orange-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        CYCLONE INTELLIGENCE
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {cycloneObservation.dataStatus || 'DEMO'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name:</span>
                        <strong className="text-slate-900 font-bold">{cycloneObservation.cycloneName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <strong className="text-red-700 font-bold">{cycloneObservation.status}</strong>
                      </div>
                      {cycloneObservation.maxWindKph && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Maximum Wind:</span>
                          <strong className="text-slate-800 font-mono">{cycloneObservation.maxWindKph} km/h</strong>
                        </div>
                      )}
                      {cycloneObservation.centralPressureHpa && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Central Pressure:</span>
                          <strong className="text-slate-800 font-mono">{cycloneObservation.centralPressureHpa} hPa</strong>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Distance to Ganjam:</span>
                        <strong className="text-red-600 font-mono font-bold">{cycloneObservation.distanceToGanjamKm} km</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Movement:</span>
                        <strong className="text-slate-800 font-mono">{cycloneObservation.movementDirection} @ {cycloneObservation.movementSpeedKph} km/h</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Forecast:</span>
                        <span className="text-amber-700 font-bold">Approaching Odisha Coast</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cyclone Risk:</span>
                        <strong className="text-red-700 font-bold font-mono">{cycloneObservation.cycloneRiskScore || 68} / 100</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Data:</span>
                        <span className="text-slate-600 font-mono font-bold">{cycloneObservation.dataStatus || 'DEMO'}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 italic">
                      Cyclone Track • Ganjam Proximity Model (Decision-Support)
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Ganjam Target Reference Marker */}
            <Marker
              position={[19.31, 84.79]}
              icon={createDivIcon(
                `<div style="display: flex; align-items: center; justify-content: center; background: #0F172A; border: 2px solid #06B6D4; color: #06B6D4; border-radius: 9999px; width: 26px; height: 26px; box-shadow: 0 0 10px rgba(6, 182, 212, 0.7); font-size: 13px;">🎯</div>`,
                'ganjam-ref-marker',
                [26, 26]
              )}
            >
              <Popup>
                <div className="p-2 text-xs font-sans max-w-[210px]">
                  <strong className="text-cyan-700 font-bold block">GANJAM OPERATIONAL CENTER</strong>
                  <span className="text-slate-600 text-[11px] font-mono">19.31°N, 84.79°E</span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Canonical reference point for cyclone track proximity calculations.
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Phase 8: Critical Infrastructure Layer */}
        {layers.criticalInfrastructure && (
          <>
            {(criticalInfrastructure || GANJAM_MODELLED_INFRASTRUCTURE).map((item) => {
              const impact = (infrastructureImpacts || []).find((imp) => imp.infrastructureId === item.id) || {
                impactScore: 85,
                impactLevel: 'CRITICAL',
                accessRisk: 'CRITICAL',
                accessRiskScore: 88,
                recommendedAction: 'Protect alternate medical corridor.',
              }

              let icon = infraGenericIcon
              if (item.type === 'HOSPITAL') icon = infraHospitalIcon
              else if (item.type === 'BRIDGE') icon = infraBridgeIcon
              else if (item.type === 'POWER_SUBSTATION') icon = infraPowerIcon
              else if (item.type === 'WATER_SUPPLY') icon = infraWaterIcon
              else if (item.type === 'SHELTER') icon = infraShelterIcon

              return (
                <Marker
                  key={`infra-${item.id}`}
                  position={[item.location?.lat || item.lat, item.location?.lng || item.lng]}
                  icon={icon}
                >
                  <Popup>
                    <div className="p-2.5 text-xs font-sans max-w-[250px] space-y-1.5">
                      <div className="flex items-center justify-between border-b pb-1">
                        <strong className="text-slate-900 font-bold">{item.name}</strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                          {impact.impactLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                        <div>Impact Risk: <strong className={impact.impactLevel === 'CRITICAL' ? 'text-red-700 font-bold' : 'text-slate-800'}>{impact.impactLevel || 'CRITICAL'} ({impact.impactScore || 85}/100)</strong></div>
                        <div>Access Risk: <strong className={impact.accessRisk === 'CRITICAL' || impact.accessRisk > 80 ? 'text-red-700 font-bold' : 'text-slate-800'}>{impact.accessRiskScore || (impact.accessRisk === 'CRITICAL' ? 88 : 35)}</strong></div>
                        <div>Road: <strong className={item.serviceDependency?.roadAccess === 'BLOCKED' || impact.accessRisk === 'CRITICAL' ? 'text-red-700 font-bold' : 'text-slate-800'}>SH-36 {item.serviceDependency?.roadAccess || 'BLOCKED'}</strong></div>
                      </div>
                      <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-semibold">
                        Action: {impact.recommendedAction || 'Protect alternate medical corridor.'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono pt-0.5">
                        PROVENANCE: MODELLED INFRASTRUCTURE
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </>
        )}

        {/* Phase 8: Population Exposure Layer */}
        {layers.populationExposure && (
          <>
            {(populationExposure || GANJAM_MODELLED_POPULATION_EXPOSURE.SATELLITE_CONFIRMED).map((exp) => {
              const zoneCoords = {
                'ZONE-GANJAM-01': [19.26, 84.91],
                'ZONE-GANJAM-02': [19.61, 84.66],
                'ZONE-GANJAM-03': [19.52, 84.88],
              }[exp.zoneId] || [19.31, 84.79]

              return (
                <Circle
                  key={`pop-exp-${exp.id}`}
                  center={zoneCoords}
                  radius={Math.max(1200, Math.min(3500, exp.exposedPopulation * 0.35))}
                  pathOptions={{
                    color: '#06B6D4',
                    fillColor: '#06B6D4',
                    fillOpacity: 0.15,
                    dashArray: '4 4',
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="p-2 text-xs font-sans max-w-[220px] space-y-1">
                      <strong className="text-cyan-800 font-bold block">MODELLED POPULATION EXPOSURE</strong>
                      <div className="text-[11px] font-mono text-slate-700">
                        <div>Zone: <strong>{exp.zoneId}</strong></div>
                        <div>Exposed: <strong className="text-cyan-700">{exp.exposedPopulation?.toLocaleString('en-IN')}</strong> / {exp.population?.toLocaleString('en-IN')}</div>
                        <div>Vulnerable: <strong className="text-rose-700">{exp.vulnerablePopulation?.toLocaleString('en-IN')}</strong></div>
                        <div>Elderly: {exp.elderlyPopulation?.toLocaleString('en-IN')} • Children: {exp.childrenPopulation?.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="text-[9px] text-slate-400 pt-1 border-t">
                        PROVENANCE: MODELLED EXPOSURE
                      </div>
                    </div>
                  </Popup>
                </Circle>
              )
            })}
          </>
        )}

        {/* Phase 8: Priority Zones Layer */}
        {layers.priorityZones && zonePriorities && (
          <>
            {zonePriorities.map((pz) => {
              const zoneCoords = {
                'ZONE-GANJAM-01': [19.268, 84.915],
                'ZONE-GANJAM-02': [19.618, 84.668],
                'ZONE-GANJAM-03': [19.525, 84.888],
              }[pz.zoneId] || [19.31, 84.79]

              const isCritical = pz.priorityClass === 'CRITICAL'

              return (
                <Marker
                  key={`pzone-${pz.zoneId}`}
                  position={zoneCoords}
                  icon={createDivIcon(
                    `<div class="relative flex items-center justify-center">
                      ${isCritical ? '<span class="absolute w-8 h-8 rounded-full bg-red-600 animate-ping opacity-75"></span>' : ''}
                      <span class="relative px-2 py-1 rounded-lg ${isCritical ? 'bg-red-600' : 'bg-orange-600'} border-2 border-white text-white font-mono font-black text-[10px] shadow-lg">
                        PRIORITY ${pz.priorityScore}
                      </span>
                    </div>`,
                    'pzone-marker',
                    [80, 28]
                  )}
                >
                  <Popup>
                    <div className="p-2 text-xs font-sans max-w-[220px] space-y-1">
                      <strong className={isCritical ? 'text-red-700 font-bold block' : 'text-orange-700 font-bold block'}>
                        {pz.priorityClass} RESPONSE PRIORITY
                      </strong>
                      <div className="text-[11px] font-mono text-slate-700">
                        <div>Score: <strong>{pz.priorityScore}/100</strong></div>
                        <div>Threat: {pz.primaryThreat}</div>
                      </div>
                      <div className="p-1 rounded bg-slate-50 text-[10px] text-slate-700">
                        <strong>Action:</strong> {pz.recommendedAction}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </>
        )}
      </MapContainer>

      {/* Floating Controls Overlay */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] w-64 sm:w-72 space-y-2 pointer-events-auto">
          <MapControls
            layers={layers}
            setLayers={setLayers}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            onLocateUser={handleLocateMe}
          />
        </div>
      )}

      {/* Floating Legend Overlay */}
      {showControls && (
        <div className="hidden md:block absolute bottom-6 left-4 z-[1000] max-w-xs pointer-events-auto">
          <MapLegend />
        </div>
      )}
    </div>
  )
}
