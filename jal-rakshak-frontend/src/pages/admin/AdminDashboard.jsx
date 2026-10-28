import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import { adminApi } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import AlertBroadcastModal from '../../components/admin/AlertBroadcastModal'
import CommandIncidentFeed from '../../components/admin/CommandIncidentFeed'
import WeatherPanel from '../../components/admin/WeatherPanel'
import FloodPredictionPanel from '../../components/admin/FloodPredictionPanel'
import CitizenEvidencePanel from '../../components/admin/CitizenEvidencePanel'
import SatelliteEvidencePanel from '../../components/admin/SatelliteEvidencePanel'
import CycloneIntelligencePanel from '../../components/admin/CycloneIntelligencePanel'
import VulnerabilityPanel from '../../components/admin/VulnerabilityPanel'
import { OperationalPlanPanel } from '../../components/admin/OperationalPlanPanel'
import ResponseActionQueue from '../../components/admin/ResponseActionQueue'
import ResponseUnitsPanel from '../../components/admin/ResponseUnitsPanel'
import JudgeDemoControlBar from '../../components/admin/JudgeDemoControlBar'
import WhatRespondersShouldDoPanel from '../../components/admin/WhatRespondersShouldDoPanel'
import AlertCenterPanel from '../../components/admin/AlertCenterPanel'
import { CanonicalScenario, CANONICAL_SCENARIO_DEFINITIONS, getSynchronizedScenarios } from '../../domain/canonicalState'
import {
  fetchNormalizedWeather,
  getBaselineRiskState,
  evaluateFloodIntelligence,
  normalizeCitizenReport,
  normalizeEmergencySOS,
  normalizeShelter,
  normalizeResponseUnit,
  evaluateDispatchDecisions,
  GANJAM_DEMO_RESPONSE_UNITS,
  satelliteAdapter,
  cycloneAdapter,
  vulnerabilityAdapter,
  allocationAdapter,
} from '../../services/adapters'
import { evaluateSatelliteFusion } from '../../services/intelligence/satellite/satelliteFusionEngine'
import { evaluateCycloneIntelligence } from '../../services/intelligence/cyclone/cycloneRiskEngine'
import { evaluateVulnerabilityIntelligence } from '../../services/intelligence/vulnerability/vulnerabilityPriorityEngine'
import { generateOperationalPlan, getOperationalTimeline } from '../../services/intelligence/allocation/resourceAllocationEngine'
import { SourceCategory } from '../../domain/contracts'
import {
  ShieldAlert,
  Flame,
  Radio,
  Users,
  Home,
  LifeBuoy,
  FileCheck2,
  Waves,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  Satellite,
  Compass,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export default function AdminDashboard() {
  const { emergencies, reports, shelters, rescueTeams, rivers, fetchLiveDatabaseData, loadingData } = useFloodData()
  const { alerts } = useAlert()
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [backendStats, setBackendStats] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weatherState, setWeatherState] = useState(null)

  // Real-time operational clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load initial baseline weather via adapter
  useEffect(() => {
    let isMounted = true
    fetchNormalizedWeather({ scenario: 'BASELINE' }).then((w) => {
      if (isMounted && w) setWeatherState(w)
    })
    return () => { isMounted = false }
  }, [])

  // Fetch backend admin metrics
  const loadAdminMetrics = useCallback(async () => {
    try {
      const stats = await adminApi.getDashboardStats()
      if (stats) setBackendStats(stats)
    } catch (err) {
      console.warn('Backend metrics offline, using deterministic Ganjam baseline:', err.message)
    }
  }, [])

  useEffect(() => {
    loadAdminMetrics()
  }, [loadAdminMetrics])

  const [masterScenario, setMasterScenario] = useState('CRITICAL_OPERATION')
  const [scenario, setScenario] = useState('SEVERE')
  const [evidenceScenario, setEvidenceScenario] = useState('CRITICAL_INCIDENT')

  const handleMasterScenarioChange = useCallback((newScenario) => {
    setMasterScenario(newScenario)
    const sync = getSynchronizedScenarios(newScenario)

    setScenario(sync.weather)
    setEvidenceScenario(sync.evidence)
    setSatelliteScenario(sync.satellite)
    setCycloneScenario(sync.cyclone)
    setVulnerabilityScenario(sync.vulnerability)
    setOperationalScenario(sync.operational)

    fetchNormalizedWeather({ scenario: sync.weather, forceRefresh: true }).then((w) => {
      if (w) setWeatherState(w)
    })
  }, [])

  const handleScenarioChange = useCallback((newScenario) => {
    setScenario(newScenario)
    fetchNormalizedWeather({ scenario: newScenario, forceRefresh: true }).then((w) => {
      if (w) setWeatherState(w)
    })
  }, [])

  const handleEvidenceScenarioChange = useCallback((newEvScenario) => {
    setEvidenceScenario(newEvScenario)
    if (newEvScenario !== 'BASELINE' && scenario === 'BASELINE') {
      setScenario('WORSENING')
      fetchNormalizedWeather({ scenario: 'WORSENING', forceRefresh: true }).then((w) => {
        if (w) setWeatherState(w)
      })
    }
  }, [scenario])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await Promise.allSettled([
      fetchLiveDatabaseData(),
      loadAdminMetrics(),
      fetchNormalizedWeather({ scenario, forceRefresh: true }).then(setWeatherState),
    ])
    setRefreshing(false)
  }

  // Canonical Flood Intelligence
  const { floodPrediction, riskState: baseRiskState, zones, groundEvidence } = useMemo(() => {
    return evaluateFloodIntelligence({ scenario, weatherState, evidenceScenario })
  }, [scenario, weatherState, evidenceScenario])

  // Normalized Incident Feed (combines verified reports and SOS emergencies)
  const normalizedIncidents = useMemo(() => {
    const list = []
    emergencies.forEach((e) => {
      const norm = normalizeEmergencySOS(e)
      if (norm) list.push(norm)
    })
    reports.forEach((r) => {
      const norm = normalizeCitizenReport(r)
      if (norm) list.push(norm)
    })
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [emergencies, reports])

  // Normalized Shelters (reflecting ground evidence impacts if shelter is at risk)
  const normalizedShelters = useMemo(() => {
    return shelters.map((s) => {
      const norm = normalizeShelter(s)
      const isImpacted = groundEvidence?.impactedShelters?.some(
        (sh) => sh.shelterId === norm.id || norm.name.toLowerCase().includes('aska')
      )
      if (isImpacted) {
        return {
          ...norm,
          status: 'AT_RISK',
          riskLevel: 'HIGH',
          isRecommended: false,
          roadCondition: 'Approach road waterlogged by ground runoff (Citizen verified)',
        }
      }
      return norm
    })
  }, [shelters, groundEvidence])

  // Phase 6: Earth Observation + Satellite Verification & Evidence Fusion
  const [satelliteScenario, setSatelliteScenario] = useState('SATELLITE_CONFIRMS')
  const [isVerifyingSatellite, setIsVerifyingSatellite] = useState(false)

  const satelliteFusion = useMemo(() => {
    return evaluateSatelliteFusion({
      scenario: satelliteScenario,
      groundEvidenceItems: groundEvidence?.items || [],
      shelters: normalizedShelters,
      responseUnits: GANJAM_DEMO_RESPONSE_UNITS,
    })
  }, [satelliteScenario, groundEvidence, normalizedShelters])

  const handleSatelliteVerify = useCallback(() => {
    setIsVerifyingSatellite(true)
    setTimeout(() => {
      setIsVerifyingSatellite(false)
    }, 600)
  }, [])

  // Phase 7: Cyclone Intelligence + Bay of Bengal Track Integration
  const [cycloneScenario, setCycloneScenario] = useState('APPROACHING')

  const cycloneIntelligence = useMemo(() => {
    const baseScore = satelliteScenario === 'SATELLITE_CONFIRMS'
      ? (satelliteFusion?.canonicalRiskScore || 81)
      : (baseRiskState?.score || 74)

    return evaluateCycloneIntelligence({
      scenario: cycloneScenario,
      baseRiskScore: baseScore,
      weatherSeverity: weatherState?.severity || 'WARNING',
      floodRiskScore: baseRiskState?.score || 74,
      previousIncidents: satelliteFusion?.dispatchResult?.incidents || normalizedIncidents,
      shelters: normalizedShelters,
      responseUnits: GANJAM_DEMO_RESPONSE_UNITS,
    })
  }, [cycloneScenario, satelliteScenario, satelliteFusion, baseRiskState, weatherState, normalizedIncidents, normalizedShelters])

  // Authoritative Canonical RiskState (Single Source of Truth: Weather -> Flood -> Citizen -> Satellite -> Cyclone)
  const riskState = useMemo(() => {
    let intermediateState = baseRiskState
    if (satelliteScenario === 'SATELLITE_CONFIRMS') {
      intermediateState = {
        ...baseRiskState,
        score: satelliteFusion.canonicalRiskScore, // 81 (CRITICAL)
        severity: satelliteFusion.severity,
        affectedAreaKm2: satelliteFusion.affectedAreaKm2, // 57.0 km²
        affectedPopulation: satelliteFusion.affectedPopulation, // 8,900
        reasons: [
          'Sentinel-1 SAR surface water detection confirmed ground reports (82% overlap)',
          `Multimodal Fusion: Base model 60% + Ground evidence +14% + Satellite SAR +7% → ${satelliteFusion.canonicalRiskScore}% CRITICAL`,
          `Sensor: Sentinel-1 SAR Dual-Pol (Lee Speckle + Otsu) • Status: ${satelliteFusion.observation?.dataStatus || 'DEMO'}`,
          `Affected area updated to ${satelliteFusion.affectedAreaKm2} km² • Population at risk: ${satelliteFusion.affectedPopulation.toLocaleString('en-IN')}`,
        ],
      }
    } else if (satelliteScenario === 'EVIDENCE_CONFLICT' || satelliteScenario === 'NO_SATELLITE') {
      intermediateState = {
        ...baseRiskState,
        score: 74,
        severity: 'HIGH',
        affectedAreaKm2: 54.0,
        affectedPopulation: 8400,
        reasons: [
          satelliteScenario === 'EVIDENCE_CONFLICT'
            ? 'Evidence conflict: Satellite radar backscatter does not corroborate ground report location'
            : 'Satellite overpass unavailable — Canonical risk remains 74% based on verified ground evidence',
        ],
      }
    }

    if (cycloneIntelligence && cycloneIntelligence.multiHazard) {
      const mh = cycloneIntelligence.multiHazard
      return {
        ...intermediateState,
        score: mh.combinedRiskScore,
        severity: mh.combinedSeverity,
        source: cycloneIntelligence.observation?.dataStatus || 'DEMO',
        cycloneInfluence: mh.cycloneContribution,
        reasons: [
          mh.reason,
          `Multi-Hazard Fusion: Base Hazard ${mh.baseHazardScore}% + Cyclone Proximity/Surge influence +${mh.cycloneContribution}% (${mh.weatherInteractionBonus > 0 ? `includes +${mh.weatherInteractionBonus}% weather amplification` : 'un-amplified'}) → ${mh.combinedRiskScore}% ${mh.combinedSeverity}`,
          `Ganjam Proximity: ${cycloneIntelligence.observation?.distanceToGanjamKm ?? 'N/A'} km (${cycloneIntelligence.observation?.proximityBand ?? 'N/A'}) • Approach: ~${cycloneIntelligence.observation?.approachTimeHours ?? 'N/A'} hrs`,
          `Coastal Surge Risk: ${cycloneIntelligence.cycloneRisk?.stormSurgeRisk ?? 0}% • Coastal Exposure: ${cycloneIntelligence.cycloneRisk?.coastalExposure ?? 'MODERATE'}`,
          ...(intermediateState.reasons || []),
        ],
      }
    }

    return intermediateState
  }, [baseRiskState, satelliteScenario, satelliteFusion, cycloneIntelligence])

  // Phase 8: Vulnerability & Population Exposure Intelligence
  const [vulnerabilityScenario, setVulnerabilityScenario] = useState('BASELINE')

  const vulnerabilityData = useMemo(() => {
    return evaluateVulnerabilityIntelligence({
      scenario: vulnerabilityScenario,
      riskState,
      cycloneRisk: cycloneIntelligence?.cycloneRisk || { stormSurgeRisk: 72 },
      blockedRoads: groundEvidence?.blockedRoads || ['SH-36'],
      citizenReports: groundEvidence?.evidenceList || [],
      satelliteConfirmed: satelliteScenario !== 'NO_SATELLITE',
    })
  }, [vulnerabilityScenario, riskState, cycloneIntelligence, groundEvidence, satelliteScenario])

  // Phase 5: Deterministic Rescue Orchestration & Dispatch Intelligence (Recalculated with Satellite, Cyclone & Phase 8 Vulnerability)
  const [selectedActionId, setSelectedActionId] = useState('ACT-01')
  const [selectedUnitId, setSelectedUnitId] = useState('RU-02')

  const dispatchIntelligence = useMemo(() => {
    let baseDispatch = null
    if (cycloneIntelligence?.dispatchResult) {
      baseDispatch = cycloneIntelligence.dispatchResult
    } else if (satelliteFusion?.dispatchResult) {
      baseDispatch = satelliteFusion.dispatchResult
    } else {
      baseDispatch = evaluateDispatchDecisions({
        scenario: evidenceScenario,
        riskState,
        groundEvidence,
        shelters: normalizedShelters,
        responseUnits: GANJAM_DEMO_RESPONSE_UNITS,
      })
    }

    // Phase 8 Integration: Enrich Action Queue with Demographic & Infrastructure Priority Directives
    if (vulnerabilityData?.decisions && vulnerabilityData.decisions.length > 0) {
      const vulnActions = vulnerabilityData.decisions.map((dec, idx) => ({
        id: `ACT-VULN-0${idx + 1}`,
        priority: dec.priority,
        incidentId: dec.incidentId,
        title: dec.id === 'DEC-INFRA-HOSP'
          ? 'Protect Aska Sub-Divisional Hospital Corridor'
          : dec.id === 'DEC-SHELTER-SH04'
            ? 'Enforce Evacuee Redirection from Surge Shelter SH-04'
            : `Priority Evacuation: ${dec.incidentId}`,
        summary: dec.rationale[0] || 'Vulnerability & critical lifeline directive',
        action: dec.action,
        etaMinutes: 15,
        decision: dec,
      }))

      return {
        ...baseDispatch,
        actionQueue: [...vulnActions, ...(baseDispatch.actionQueue || [])],
        decisions: [...vulnerabilityData.decisions, ...(baseDispatch.decisions || [])],
      }
    }

    return baseDispatch
  }, [cycloneIntelligence, satelliteFusion, evidenceScenario, riskState, groundEvidence, normalizedShelters, vulnerabilityData])

  const handleSelectAction = useCallback((action) => {
    setSelectedActionId(action.id)
    if (action.decision?.responseUnitId) {
      setSelectedUnitId(action.decision.responseUnitId)
    }
  }, [])


  const handleSelectUnit = useCallback((unit) => {
    setSelectedUnitId(unit.id)
  }, [])

  // Phase 9: Operational Planning, Resource Allocation & Evacuation Optimization
  const [operationalScenario, setOperationalScenario] = useState('CRITICAL_OPERATION')
  const [selectedMissionId, setSelectedMissionId] = useState('MIS-CRIT-01')

  const operationalPlan = useMemo(() => {
    return generateOperationalPlan(operationalScenario)
  }, [operationalScenario])

  const operationalTimeline = useMemo(() => {
    return getOperationalTimeline(operationalScenario)
  }, [operationalScenario])


  // Deterministic KPI computations (No random numbers on re-render)
  const totalCapacity = shelters.reduce((acc, s) => acc + (Number(s?.capacity) || Number(s?.totalCapacity) || 0), 0) || 3400
  const totalOccupancy = shelters.reduce((acc, s) => acc + (Number(s?.currentOccupancy) || Number(s?.occupancy) || 0), 0) || 1280
  const occupancyPct = Math.round((totalOccupancy / totalCapacity) * 100)

  const activeIncidentsCount = (groundEvidence?.evidenceList?.length || 0) + (normalizedIncidents.length || 8)
  const verifiedIncidentsCount = groundEvidence?.verifiedCount || (reports.filter(r => r?.verified || r?.verificationStatus === 'VERIFIED').length || 5)
  const pendingSosCount = emergencies.filter(
    (e) => (e?.status || '').toUpperCase() === 'PENDING' || (e?.status || '').toUpperCase() === 'PENDING_ASSIGNMENT'
  ).length || (groundEvidence?.criticalSosCount || 1)

  const deployedSquadsCount = rescueTeams.filter((t) =>
    ['DEPLOYED', 'ON_MISSION', 'ON_SCENE', 'DISPATCHED'].includes((t?.status || '').toUpperCase())
  ).length || 4

  // Ganjam River Hydrograph: Rushikulya Basin (Purushottampur Gauge)
  const rushikulyaTelemetry = rivers.find((r) => r?.id && typeof r.id === 'string' && r.id.includes('rushikulya')) || {
    name: 'Rushikulya (Purushottampur Gauge, Ganjam)',
    currentLevel: 16.40,
    warningLevel: 15.83,
    dangerLevel: 16.83,
    inflow: '2.85 Lakh Cusecs',
    outflow: '2.70 Lakh Cusecs',
    gatesOpen: 'Rushikulya Barrage Monitored',
    capacityPct: 88.5,
    downstreamTransitTime: '~6h to Ganjam Coastal Estuary',
  }

  const riverHydrographData = [
    { time: '06:00', inflow: 2.10, outflow: 2.05, level: 15.80 },
    { time: '09:00', inflow: 2.35, outflow: 2.25, level: 16.05 },
    { time: '12:00', inflow: 2.60, outflow: 2.50, level: 16.25 },
    { time: '15:00', inflow: 2.85, outflow: 2.70, level: 16.40 },
    { time: '18:00 (Live)', inflow: 2.85, outflow: 2.70, level: 16.40 },
    { time: '21:00 (Est)', inflow: 3.05, outflow: 2.90, level: 16.65 },
  ]

  return (
    <div className="space-y-6">
      {/* Command Center Header & Identity (Section 5 EOC Layout) */}
      <div className="flex flex-col gap-4 bg-slate-900/95 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/25">
                PS-074 • GANJAM DISASTER INTELLIGENCE EOC
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>COMMAND CENTER ACTIVE</span>
              </span>
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                DECISION-SUPPORT PROTOTYPE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Ganjam Disaster Intelligence EOC
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              District Emergency Operations Center • Hyperlocal Multi-Hazard Risk Fusion, Vulnerability Prioritization & Resource Allocation Engine
            </p>
          </div>

          {/* Operational Status & Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Clock Display */}
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-right shrink-0">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>EOC Time (IST)</span>
              </div>
              <div className="text-sm font-bold text-slate-200">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing || loadingData}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer"
              title="Sync all telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loadingData ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            <button
              onClick={() => setBroadcastOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition animate-pulse cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Warning</span>
            </button>
          </div>
        </div>

        {/* Section 5 Operational Status Strip */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              INCIDENT: <strong className="text-white">GANJAM-FLOOD-001</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 font-bold">
              STATUS: {(CANONICAL_SCENARIO_DEFINITIONS[masterScenario] || {}).status || 'CRITICAL'}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 font-bold">
              CANONICAL RISK: {riskState.score}% (Modelled)
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 font-bold">
              RESPONSE PRIORITY: {(CANONICAL_SCENARIO_DEFINITIONS[masterScenario] || {}).responsePriority || 96}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              SCENARIO: <strong className="text-cyan-400">{(CANONICAL_SCENARIO_DEFINITIONS[masterScenario] || {}).name || masterScenario}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-bold">
              DATA: LIVE / CACHED / DEMO
            </span>
          </div>

          <span className="text-[10px] text-slate-500 italic">
            Decision-support prototype • Not official emergency dispatch
          </span>
        </div>
      </div>

      {/* 3-Minute Interactive Judge Demo Mode Bar */}
      <JudgeDemoControlBar
        currentScenario={masterScenario}
        onScenarioChange={handleMasterScenarioChange}
      />

      {/* Specialized Command Center Rooms Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          to="/admin/satellite"
          className="p-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/40 transition group shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Satellite Radar Room</div>
              <div className="text-[10px] text-slate-400">Sentinel-1 SAR Fusion</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-indigo-400/70 group-hover:text-indigo-300 transition" />
        </Link>

        <Link
          to="/admin/cyclone"
          className="p-3.5 rounded-2xl bg-orange-950/40 hover:bg-orange-900/50 border border-orange-700/40 transition group shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/30 text-orange-400 border border-orange-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-orange-300 transition">Cyclone & Surge Room</div>
              <div className="text-[10px] text-slate-400">Cyclone Radar</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-orange-400/70 group-hover:text-orange-300 transition" />
        </Link>

        <Link
          to="/admin/vulnerability"
          className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-700/40 transition group shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-rose-300 transition">Demographic Lifelines</div>
              <div className="text-[10px] text-slate-400">SVI & Hospital Defense</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-rose-400/70 group-hover:text-rose-300 transition" />
        </Link>

        <Link
          to="/admin/operations"
          className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/40 transition group shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">Tactical Fleet Dispatch</div>
              <div className="text-[10px] text-slate-400">ODRAF / Evacuation Ops</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-emerald-400/70 group-hover:text-emerald-300 transition" />
        </Link>
      </div>

      {/* Top KPI Metrics Strip (6 Deterministic Indicators Driven by Canonical Risk) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Overall District Risk"
          value={`${riskState.score}%`}
          subtitle={`Severity: ${riskState.severity} (${riskState.source})`}
          icon={ShieldAlert}
          color={riskState.severity === 'HIGH' || riskState.severity === 'CRITICAL' ? 'red' : 'orange'}
          trend="up"
          trendValue={
            evidenceScenario === 'CRITICAL_INCIDENT'
              ? `Evidence Delta +22% → ${riskState.score}%`
              : evidenceScenario === 'GROUND_EVIDENCE'
                ? `Evidence Delta +14% → ${riskState.score}%`
                : scenario === 'SEVERE'
                  ? `Severe ~${riskState.score}%`
                  : scenario === 'WORSENING' || scenario === 'ESCALATED'
                    ? `Worsening ~${riskState.score}%`
                    : `Baseline ${riskState.score}%`
          }
        />
        <StatCard
          title="Active Ground Incidents"
          value={activeIncidentsCount}
          subtitle={`${verifiedIncidentsCount} Ground Verified`}
          icon={FileCheck2}
          color="red"
          trend="up"
          trendValue={`${activeIncidentsCount} Total`}
        />
        <StatCard
          title="Affected Inundation Area"
          value={`${riskState.affectedAreaKm2} km²`}
          subtitle="Rushikulya & Coastal Plain"
          icon={Waves}
          color="cyan"
          trend="up"
          trendValue={
            evidenceScenario === 'CRITICAL_INCIDENT'
              ? `Surge: 60.0 km² (+12 km²)`
              : evidenceScenario === 'GROUND_EVIDENCE'
                ? `Surge: 54.0 km² (+6 km²)`
                : scenario === 'SEVERE'
                  ? `Surge: +27.8 km²`
                  : scenario === 'WORSENING' || scenario === 'ESCALATED'
                    ? `Surge: +13.8 km²`
                    : `Footprint: ${riskState.affectedAreaKm2} km²`
          }
        />
        <StatCard
          title="Population at Risk"
          value={riskState.affectedPopulation.toLocaleString('en-IN')}
          subtitle="Low-lying flood footprint"
          icon={Users}
          color="red"
          trend="up"
          trendValue={
            evidenceScenario === 'CRITICAL_INCIDENT'
              ? `Critical Exposure: ~8,900`
              : evidenceScenario === 'GROUND_EVIDENCE'
                ? `Ground Exposure: ~8,400`
                : scenario === 'SEVERE'
                  ? `Severe Exposure: ~11,500`
                  : scenario === 'WORSENING' || scenario === 'ESCALATED'
                    ? `High Exposure: ~7,000`
                    : `Baseline: 4,850`
          }
        />
        <StatCard
          title="Relief Shelter Capacity"
          value={`${occupancyPct}%`}
          subtitle={`${totalOccupancy.toLocaleString('en-IN')} / ${totalCapacity.toLocaleString('en-IN')}`}
          icon={Home}
          color="purple"
          trend="up"
          trendValue="6 Shelters"
        />
        <StatCard
          title="Active Response Units"
          value={`${deployedSquadsCount} / ${rescueTeams.length || 4}`}
          subtitle="NDRF / ODRAF Squads"
          icon={LifeBuoy}
          color="emerald"
          trend="down"
          trendValue="Deployed"
        />
      </div>

      {/* Live Operational Intelligence Pipeline (Section 8: 14 Sequential Stages) */}
      <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Live Operational Decision Pipeline (Detect → Verify → Understand → Prioritize → Allocate → Act → Reallocate)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-700/60 font-bold">
            Canonical Multi-Hazard Risk — Modelled
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px] font-mono">
          {/* 1. WEATHER */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">1. WEATHER</span>
            <span className="text-cyan-400 font-bold">{weatherState?.rainfall3h || 160}mm / 3h</span>
            <span className="text-[9px] text-slate-500 block">IMD / Open-Meteo</span>
          </div>

          {/* 2. FLOOD */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">2. FLOOD MODEL</span>
            <span className="text-amber-400 font-bold">Level 16.40m</span>
            <span className="text-[9px] text-slate-500 block">Rushikulya Basin ML</span>
          </div>

          {/* 3. GROUND EVIDENCE */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">3. GROUND EVIDENCE</span>
            <span className="text-emerald-400 font-bold">{groundEvidence?.verifiedCount || 2} Verified (94%)</span>
            <span className="text-[9px] text-slate-500 block">Photos + SOS Triage</span>
          </div>

          {/* 4. SATELLITE */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">4. SATELLITE</span>
            <span className="text-indigo-400 font-bold">57 km² (+24.5%)</span>
            <span className="text-[9px] text-slate-500 block">Sentinel-1 SAR Radar</span>
          </div>

          {/* 5. CYCLONE */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">5. CYCLONE TRACK</span>
            <span className="text-orange-400 font-bold">182 km (Surge 72%)</span>
            <span className="text-[9px] text-slate-500 block">Cyclone Trajectory</span>
          </div>

          {/* 6. MULTI-HAZARD FUSION */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">6. HAZARD FUSION</span>
            <span className="text-red-400 font-bold">{riskState.score}% {riskState.severity}</span>
            <span className="text-[9px] text-slate-500 block">Multi-Hazard Bounded</span>
          </div>

          {/* 7. EXPOSURE */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">7. POP. EXPOSURE</span>
            <span className="text-cyan-300 font-bold">{vulnerabilityData.summary?.totalExposedPopulation?.toLocaleString('en-IN') || '7,200'} Pax</span>
            <span className="text-[9px] text-slate-500 block">Flood Footprint Mesh</span>
          </div>

          {/* 8. VULNERABILITY */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">8. VULNERABILITY</span>
            <span className="text-rose-400 font-bold">2,600 Priority</span>
            <span className="text-[9px] text-slate-500 block">Mobility + Elderly + Kids</span>
          </div>

          {/* 9. INFRASTRUCTURE */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">9. INFRA IMPACT</span>
            <span className="text-purple-400 font-bold">Hospital Access 88</span>
            <span className="text-[9px] text-slate-500 block">SH-36 Cutoff Alert</span>
          </div>

          {/* 10. RESPONSE PRIORITY */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">10. PRIORITY SCORE</span>
            <span className="text-red-400 font-bold">Priority 96 (CRITICAL)</span>
            <span className="text-[9px] text-slate-500 block">Aska Floodplain Sector</span>
          </div>

          {/* 11. RESOURCE ALLOCATION */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">11. RESOURCE FLEET</span>
            <span className="text-emerald-400 font-bold">RU-02 (Boat), RU-03</span>
            <span className="text-[9px] text-slate-500 block">Capacity-Constrained Greedy</span>
          </div>

          {/* 12. EVACUATION */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">12. EVACUATION</span>
            <span className="text-cyan-300 font-bold">SH-02 / SH-03 / SH-05</span>
            <span className="text-[9px] text-slate-500 block">Multi-Shelter Balanced</span>
          </div>

          {/* 13. MISSIONS */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">13. MISSION QUEUE</span>
            <span className="text-amber-400 font-bold">5 Active / 1 Constrained</span>
            <span className="text-[9px] text-slate-500 block">Preemption P-98 &gt; P-62</span>
          </div>

          {/* 14. ACTION */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 font-bold block">14. DISPATCH ACTION</span>
            <span className="text-emerald-400 font-bold">Safe Detour (+1.5km)</span>
            <span className="text-[9px] text-slate-500 block">Live Operational Directives</span>
          </div>
        </div>
      </div>

      {/* Dynamic Weather & Risk Escalation Explanation Banner */}
      {(scenario !== 'BASELINE' || evidenceScenario !== 'BASELINE') && (
        <div className="p-4 rounded-3xl bg-red-950/40 border border-red-800/80 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-200 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600 text-white shrink-0 mt-0.5 shadow-md shadow-red-600/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  Risk Level Escalated
                </span>
                <span className="text-xs font-mono font-bold bg-red-900/90 px-2 py-0.5 rounded text-white border border-red-700/60">
                  {evidenceScenario === 'CRITICAL_INCIDENT'
                    ? 'Baseline 60% → 82% (CRITICAL)'
                    : evidenceScenario === 'GROUND_EVIDENCE'
                      ? 'Baseline 60% → 74% (HIGH)'
                      : `Baseline 48% → ${riskState.score}% (${riskState.severity})`}
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  {riskState.reasons[0]}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {riskState.reasons[1] || `Supporting Factors: 3h accumulation (${weatherState?.rainfall3h || 160}mm), 24h catchment precipitation (${weatherState?.rainfall24h || 250}mm), river tributaries nearing flood marks.`}
              </p>
              {riskState.reasons[2] && (
                <div className="text-[11px] text-cyan-300/90 font-mono flex items-center gap-2 flex-wrap pt-0.5">
                  <span>{riskState.reasons[2]}</span>
                  {riskState.reasons[3] && <span>• {riskState.reasons[3]}</span>}
                  {riskState.reasons[4] && <span>• {riskState.reasons[4]}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-full bg-red-900/70 text-red-200 border border-red-700/80">
              {evidenceScenario !== 'BASELINE' ? 'CITIZEN GROUND EVIDENCE FUSED' : `${weatherState?.source || 'LIVE'} WEATHER + FLOOD MODEL`}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {evidenceScenario !== 'BASELINE' ? 'Decision-Support Ground Triage' : 'Hydrological Decision Support'}
            </span>
          </div>
        </div>
      )}

      {/* AI Flood Prediction Intelligence Panel (FLASH-FLOOD Adapted) */}
      <FloodPredictionPanel
        floodPrediction={floodPrediction}
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
      />

      {/* Phase 6: Earth Observation + Satellite Verification Section */}
      <SatelliteEvidencePanel
        satelliteFusion={satelliteFusion}
        satelliteScenario={satelliteScenario}
        onScenarioChange={setSatelliteScenario}
        onVerify={handleSatelliteVerify}
        isVerifying={isVerifyingSatellite}
      />

      {/* Phase 7: Cyclone Intelligence Track Integration */}
      <CycloneIntelligencePanel
        cycloneIntelligence={cycloneIntelligence}
        cycloneObservation={cycloneIntelligence.observation}
        cycloneRisk={cycloneIntelligence.cycloneRisk}
        multiHazard={cycloneIntelligence.multiHazard}
        timeline={cycloneIntelligence.timeline}
        currentScenario={cycloneScenario}
        cycloneScenario={cycloneScenario}
        onScenarioChange={setCycloneScenario}
      />

      {/* WHAT SHOULD RESPONDERS DO NOW? (Section 13 Directive Panel) */}
      <WhatRespondersShouldDoPanel
        scenario={masterScenario}
        onSelectAction={handleSelectAction}
      />

      {/* Primary GIS Map Section (Map Dominance with Ground Evidence Layers) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-extrabold text-sm text-white">
              Ganjam Hyperlocal GIS Situational Risk Map
            </h3>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
              CENTER: 19.31°N, 84.79°E (BRAHMAPUR / GANJAM)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Critical Zone</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>High Risk</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>Photo Evidence</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Road Blocked</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span>Satellite SAR Extent (Phase 6)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500 animate-pulse" />
              <span>Cyclone Track & Cone (Phase 7)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500" />
              <span>Critical Infrastructure (Phase 8)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Pop. Exposure (Phase 8)</span>
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-800">
          <FloodRiskMap
            height="520px"
            zoom={12}
            showControls={true}
            activeZones={zones}
            groundEvidence={groundEvidence}
            responseUnits={dispatchIntelligence.responseUnits}
            dispatchRoute={dispatchIntelligence.routeEvaluation}
            satelliteObservation={satelliteFusion.observation}
            cycloneObservation={cycloneIntelligence.observation}
            populationExposure={vulnerabilityData.exposures}
            criticalInfrastructure={vulnerabilityData.criticalInfrastructure}
            infrastructureImpacts={vulnerabilityData.infrastructureImpacts}
            zonePriorities={vulnerabilityData.zonePriorities}
          />
        </div>
      </div>

      {/* Phase 5 & 8: Rescue Orchestration + Consequence Decision Intelligence Section */}
      <div className="space-y-4">
        {/* Visible Pipeline Connecting Risk -> Exposure -> Vulnerability -> Response Priority -> Dispatch */}
        <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                Multi-Hazard Consequence & Response Priority Pipeline (Phase 5 & 8)
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/50">
              Deterministic Decision Support • Modelled Population & Facilities
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 overflow-x-auto py-1 gap-1">
            <span className="text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              MULTI-HAZARD RISK ({riskState.score}%)
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              POPULATION EXPOSURE ({vulnerabilityData.summary?.totalExposedPopulation?.toLocaleString('en-IN') || '8,900'})
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-rose-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              VULNERABILITY ({vulnerabilityData.summary?.totalVulnerablePopulation?.toLocaleString('en-IN') || '2,600'})
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-purple-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              INFRA IMPACT ({vulnerabilityData.summary?.infrastructureAtRiskCount || 5} AT RISK)
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-red-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              RESPONSE PRIORITY (UP TO 96)
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              RESOURCE ALLOCATION
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 shrink-0">
              EVACUATION & DISPATCH
            </span>
          </div>
        </div>

        {/* Phase 5 Orchestration Grid: Action Queue + Response Units */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <ResponseActionQueue
              actionQueue={dispatchIntelligence.actionQueue}
              selectedActionId={selectedActionId}
              onSelectAction={handleSelectAction}
            />
          </div>

          <div className="lg:col-span-5">
            <ResponseUnitsPanel
              responseUnits={dispatchIntelligence.responseUnits}
              selectedUnitId={selectedUnitId}
              onSelectUnit={handleSelectUnit}
            />
          </div>
        </div>

        {/* Operational Alert & Communication Center (Section 9) */}
        <AlertCenterPanel scenario={masterScenario} />
      </div>

      {/* Phase 8: Vulnerability & Population Exposure Intelligence Panel */}
      <VulnerabilityPanel
        vulnerabilityData={vulnerabilityData}
        currentScenario={vulnerabilityScenario}
        onScenarioChange={setVulnerabilityScenario}
      />

      {/* Phase 9: Operational Planning, Resource Allocation & Evacuation Panel */}
      <OperationalPlanPanel
        operationalPlan={operationalPlan}
        operationalTimeline={operationalTimeline}
        currentScenario={operationalScenario}
        onScenarioChange={setOperationalScenario}
        onSelectMission={(m) => setSelectedMissionId(m.id || m.missionId)}
        selectedMissionId={selectedMissionId}
      />


      {/* Phase 4: Citizen Intelligence + Ground Evidence Command Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <CitizenEvidencePanel
            evidenceList={groundEvidence?.evidenceList || []}
            evidenceScenario={evidenceScenario}
            onScenarioChange={handleEvidenceScenarioChange}
            verifiedCount={groundEvidence?.verifiedCount || 5}
            activeCount={groundEvidence?.activeCount || 8}
            highSeverityCount={groundEvidence?.highSeverityCount || 2}
            criticalSosCount={groundEvidence?.criticalSosCount || 1}
            evidenceRiskContribution={groundEvidence?.evidenceRiskContribution || 0}
            blockedRoads={groundEvidence?.blockedRoads || []}
            impactedShelters={groundEvidence?.impactedShelters || []}
          />
        </div>

        {/* Evidence-to-Action Decision Loop Card */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white">Evidence-to-Action Loop</h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Phase 4 Demo
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-slate-300">Deterministic Evidence Fusion:</div>
            <div className="font-mono text-[10px] space-y-1.5 text-slate-400">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">1. Forecast Risk:</span>
                <span className="text-white font-bold">60% HIGH (Worsening)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">2. Field Evidence:</span>
                <span className="text-amber-400 font-bold">{groundEvidence?.verifiedCount || 0} Verified Items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">3. Verification Score:</span>
                <span className="text-emerald-400 font-bold">91% - 97% Confidence</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-400">4. Risk Contribution:</span>
                <span className="text-red-400 font-bold">+{groundEvidence?.evidenceRiskContribution || 0}% Delta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">5. Canonical Risk:</span>
                <span className="text-cyan-400 font-bold">{riskState.score}% ({riskState.severity})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">6. Affected Footprint:</span>
                <span className="text-slate-200 font-bold">{riskState.affectedAreaKm2} km²</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed italic">
            "The system is not relying only on a forecast. It continuously incorporates verified ground evidence and updates the local risk picture."
          </div>
        </div>
      </div>

      {/* Lower Operational Grid: Weather, Incidents, River Telemetry & Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weather Intelligence Panel */}
        <div className="lg:col-span-4 space-y-6">
          <WeatherPanel
            weather={weatherState}
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
          />

          {/* Rushikulya River Telemetry Card */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white">Rushikulya River Telemetry</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                Level: {rushikulyaTelemetry.currentLevel}m / 16.83m
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Purushottampur Gauge Telemetry & Sluice Discharge (CWC Ganjam Division)
            </p>

            {/* Hydrograph Chart */}
            <div className="h-40 w-full bg-slate-950/70 p-2 rounded-2xl border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riverHydrographData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rushInflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748B" fontSize={9} />
                  <YAxis domain={[1.5, 3.5]} stroke="#64748B" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="inflow" stroke="#06B6D4" fill="url(#rushInflowGrad)" strokeWidth={2} name="Inflow (Lakh Cusecs)" />
                  <Area type="monotone" dataKey="outflow" stroke="#EC4899" fill="transparent" strokeWidth={2} strokeDasharray="3 3" name="Barrage Discharge" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Inflow Rate:</span>
                <strong className="text-cyan-400 font-bold">{rushikulyaTelemetry.inflow}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Barrage Discharge:</span>
                <strong className="text-rose-400 font-bold">{rushikulyaTelemetry.outflow}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Downstream Transit:</span>
                <span className="text-slate-200 font-semibold">{rushikulyaTelemetry.downstreamTransitTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ground Incident Feed */}
        <div className="lg:col-span-4">
          <CommandIncidentFeed incidents={normalizedIncidents} />
        </div>

        {/* Shelter & Emergency Response Overview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ganjam Shelters Directory Summary */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-sm text-white">Ganjam Relief Shelters</h3>
              </div>
              <Link to="/shelters" className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-0.5">
                <span>View All ({normalizedShelters.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {normalizedShelters.slice(0, 4).map((sh) => (
                <div key={sh.id} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <strong className="text-white font-semibold line-clamp-1">{sh.name}</strong>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0 font-bold">
                      {sh.occupancyPct}% Full
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                    <span className="line-clamp-1">{sh.locationName}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Elevation: {sh.elevationMeters}m</span>
                    <span className="text-emerald-400 font-medium">{sh.availableSlots} Beds Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick SOS Response Queue Link */}
          <div className="bg-gradient-to-br from-red-950/60 to-slate-900 rounded-3xl border border-red-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                <h3 className="font-extrabold text-sm text-white">Emergency SOS Response</h3>
              </div>
              <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30 font-mono">
                {pendingSosCount} PENDING
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Critical field dispatch queue for stranded households, infants, and medical emergencies.
            </p>

            <Link
              to="/admin/emergencies"
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
            >
              <span>Manage SOS Rescue Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Broadcast Modal */}
      <AlertBroadcastModal isOpen={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
    </div>
  )
}
