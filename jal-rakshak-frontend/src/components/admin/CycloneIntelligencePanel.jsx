import React from 'react'
import {
  Wind,
  Compass,
  AlertTriangle,
  Clock,
  Waves,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { DataStatus, CycloneStatus } from '../../domain/contracts'

const cleanCycloneName = (name) => {
  if (!name) return 'CYCLONE-01'
  return name
    .replace(/BAY OF BENGAL-01/gi, 'CYCLONE-01')
    .replace(/BOB-01\s*\(Bay of Bengal\)/gi, 'CYCLONE-01')
    .replace(/BOB-MONITOR-02\s*\(Central Bay of Bengal\)/gi, 'CYC-MONITOR-02')
    .replace(/BOB-ENSEMBLE-SPREAD\s*\(Dispersed Track\)/gi, 'CYC-ENSEMBLE-SPREAD')
    .replace(/Bay of Bengal/gi, 'Coastal')
    .replace(/BAY_OF_BENGAL/gi, 'Coastal')
    .trim()
}

const cleanBasin = (basin) => {
  if (!basin) return 'Coastal Basin'
  const cleaned = basin
    .replace(/Bay of Bengal/gi, '')
    .replace(/BAY_OF_BENGAL/gi, '')
    .trim()
  return cleaned || 'Coastal Basin'
}

export default function CycloneIntelligencePanel({
  cycloneIntelligence,
  cycloneObservation,
  cycloneRisk,
  multiHazard,
  timeline,
  currentScenario,
  cycloneScenario = 'APPROACHING',
  onScenarioChange,
}) {
  const observation = cycloneObservation || cycloneIntelligence?.observation || {}
  const activeScenario = currentScenario || cycloneScenario || 'APPROACHING'
  const proximityBand = observation.proximityBand || cycloneIntelligence?.proximityBand || 'LOW'
  const isNoCyclone = observation.status === CycloneStatus.NO_CYCLONE
  const isUnavailable = observation.dataStatus === DataStatus.UNAVAILABLE

  const statusBadge = () => {
    if (isUnavailable) {
      return (
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          UNAVAILABLE
        </span>
      )
    }
    if (observation.dataStatus === DataStatus.LIVE) {
      return (
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE CYCLONE DATA
        </span>
      )
    }
    if (observation.dataStatus === DataStatus.CACHED) {
      return (
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          CACHED CYCLONE DATA
        </span>
      )
    }
    return (
      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
        DEMO CYCLONE SCENARIO
      </span>
    )
  }

  const proximityBadge = () => {
    if (proximityBand === 'SEVERE') {
      return <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold text-[10px]">SEVERE &lt;150km</span>
    }
    if (proximityBand === 'WARNING') {
      return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold text-[10px]">WARNING 150-300km</span>
    }
    if (proximityBand === 'WATCH') {
      return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded font-bold text-[10px]">WATCH 300-500km</span>
    }
    return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">LOW &gt;500km</span>
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400">
            <Wind className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">
                Cyclone Intelligence & Track
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Phase 7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              GDACS Real-Time Cyclone Telemetry & Forecast Trajectory Modelled for Ganjam, Odisha
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {statusBadge()}
        </div>
      </div>

      {/* Scenario Buttons (Section 25 Requirements) */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 bg-slate-950/70 rounded-2xl border border-slate-800">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pl-1">
          Cyclone Scenarios:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onScenarioChange('APPROACHING')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeScenario === 'APPROACHING'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ✓ Scenario C: Approaching (~180 km)
          </button>
          <button
            onClick={() => onScenarioChange('DISTANT')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeScenario === 'DISTANT'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Scenario B: Distant (~450 km)
          </button>
          <button
            onClick={() => onScenarioChange('UNCERTAIN')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeScenario === 'UNCERTAIN'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Scenario D: Uncertain Track
          </button>
          <button
            onClick={() => onScenarioChange('NO_CYCLONE')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeScenario === 'NO_CYCLONE'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Scenario A: No Cyclone
          </button>
        </div>
      </div>

      {/* Primary Cyclone Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Cyclone Name</span>
          <strong className="text-xs font-bold text-white block mt-0.5 truncate">
            {cleanCycloneName(observation.cycloneName)}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">{cleanBasin(observation.basin)}</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Classification</span>
          <strong className={`text-xs font-bold block mt-0.5 ${
            isNoCyclone ? 'text-slate-400' : 'text-orange-400'
          }`}>
            {isNoCyclone ? 'NO CYCLONE' : observation.intensity || 'Severe'}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">IMD Standard Scale</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Wind / Pressure</span>
          <strong className="text-xs font-bold text-cyan-400 block mt-0.5">
            {isNoCyclone ? '—' : `${observation.maxWindKph} km/h • ${observation.centralPressureHpa} hPa`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">Peak Sustained Gusts</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Ganjam Distance</span>
          <strong className="text-xs font-bold text-white block mt-0.5">
            {isNoCyclone ? '—' : `${Math.round(observation.distanceToGanjamKm)} km`}
          </strong>
          <div className="mt-0.5">{proximityBadge()}</div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Movement</span>
          <strong className="text-xs font-bold text-slate-200 block mt-0.5">
            {isNoCyclone ? '—' : `${observation.movementDirection} @ ${observation.movementSpeedKph} km/h`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">ETA: ~{observation.approachTimeHours}h</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Cyclone Risk</span>
          <strong className={`text-xs font-bold block mt-0.5 ${
            isNoCyclone ? 'text-slate-400' : observation.cycloneRiskScore >= 60 ? 'text-red-400' : 'text-amber-400'
          }`}>
            {isNoCyclone ? '0 / 100' : `${observation.cycloneRiskScore} / 100`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">Multi-Factor Score</span>
        </div>
      </div>

      {/* Multi-Hazard Interaction & Track Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Multi-Hazard Fusion Box (Section 24) */}
        <div className="lg:col-span-6 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Multi-Hazard Risk Interaction
            </span>
            <span className="text-[10px] font-mono text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-700/50">
              Flood + Cyclone Fusion
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">1. Satellite-Confirmed Flood Risk</span>
              <strong className="font-mono text-cyan-300 font-bold">81 (CRITICAL)</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">2. Cyclone Hazard Index</span>
              <strong className="font-mono text-orange-300 font-bold">
                {observation.cycloneRiskScore || 0} ({isNoCyclone ? 'NONE' : observation.cycloneRiskScore >= 60 ? 'HIGH' : 'MODERATE'})
              </strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">3. Weather Severity Context</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                WARNING (Rainband Interaction)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/40">
              <div>
                <span className="font-bold text-white block">4. Canonical Combined Risk</span>
                <span className="text-[10px] font-mono text-slate-400">
                  Bounded Contribution: +{cycloneIntelligence?.cycloneContribution || 0}% Delta (No Double Counting)
                </span>
              </div>
              <strong className="text-base font-mono font-extrabold text-red-400">
                {cycloneIntelligence?.canonicalRiskScore || 89}% ({cycloneIntelligence?.severity || 'CRITICAL'})
              </strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Primary Hazard Driver:</span>
            <span>{cycloneIntelligence?.primaryDriver}</span>
          </div>
        </div>

        {/* Track Analysis & Coastal Exposure Progress */}
        <div className="lg:col-span-6 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Track Analysis & Coastal Exposure
            </span>
            <span className="text-[10px] font-mono text-slate-400">Ganjam Coastal Sector</span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Ganjam Proximity Index</span>
                <strong className="text-white font-mono">{Math.round(Math.max(0, 100 - (observation.distanceToGanjamKm / 5)))}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, 100 - (observation.distanceToGanjamKm / 5)))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Forecast Track Confidence</span>
                <strong className="text-cyan-300 font-mono">{Math.round((observation.confidence || 0.8) * 100)}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((observation.confidence || 0.8) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Storm Surge & Tidal Inundation Risk</span>
                <strong className="text-red-400 font-mono">{observation.stormSurgeRisk || 76}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${observation.stormSurgeRisk || 76}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">
                Pre-Positioned Priority Resources:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(cycloneIntelligence?.priorityResources || []).map((res, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-950/70 text-orange-200 border border-orange-700/50"
                  >
                    {res.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
