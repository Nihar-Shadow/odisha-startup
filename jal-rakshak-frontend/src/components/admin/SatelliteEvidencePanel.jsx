import React, { useState } from 'react'
import {
  Satellite,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { DataStatus } from '../../domain/contracts'

export default function SatelliteEvidencePanel({
  satelliteFusion,
  satelliteScenario = 'SATELLITE_CONFIRMS',
  onScenarioChange,
  onVerify,
  isVerifying = false,
}) {
  const [activeSensor, setActiveSensor] = useState('SAR') // 'SAR' | 'NDWI'

  const observation = satelliteFusion?.observation || {}
  const spatialAgreement = satelliteFusion?.spatialAgreement || {}
  const isConflict = Boolean(satelliteFusion?.evidenceConflict)
  const isUnavailable = satelliteScenario === 'NO_SATELLITE' || observation.dataStatus === DataStatus.UNAVAILABLE

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
          LIVE SATELLITE
        </span>
      )
    }
    if (observation.dataStatus === DataStatus.CACHED) {
      return (
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          CACHED OBSERVATION
        </span>
      )
    }
    return (
      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        DEMO OBSERVATION
      </span>
    )
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">
                Earth Observation + Satellite Verification
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Phase 6
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sentinel-1 SAR Dual-Pol Backscatter & Sentinel-2 NDWI Evidence Fusion (Drishti Core)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {statusBadge()}
          <button
            onClick={onVerify}
            disabled={isVerifying}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
              isVerifying
                ? 'bg-indigo-900 text-indigo-300 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying...' : 'SATELLITE VERIFY'}</span>
          </button>
        </div>
      </div>

      {/* Demo Scenario Selectors (Section 23 Requirements) */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 bg-slate-950/70 rounded-2xl border border-slate-800">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pl-1">
          Demo Scenarios:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onScenarioChange('SATELLITE_CONFIRMS')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              satelliteScenario === 'SATELLITE_CONFIRMS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ✓ Scenario B: Satellite Confirms (82% Overlap)
          </button>
          <button
            onClick={() => onScenarioChange('EVIDENCE_CONFLICT')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              satelliteScenario === 'EVIDENCE_CONFLICT'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⚠ Scenario C: Evidence Conflict (Review)
          </button>
          <button
            onClick={() => onScenarioChange('NO_SATELLITE')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              satelliteScenario === 'NO_SATELLITE'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ✕ Scenario A: No Satellite
          </button>
        </div>
      </div>

      {/* Sensor Tab Switcher: SAR vs NDWI */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSensor('SAR')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSensor === 'SAR'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Sentinel-1 SAR Radar (Cloud Penetrating)</span>
        </button>
        <button
          onClick={() => setActiveSensor('NDWI')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSensor === 'NDWI'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Sentinel-2 Optical NDWI (Water Index)</span>
        </button>
      </div>

      {/* Conflict Alert Banner if applicable */}
      {isConflict && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-600/60 rounded-2xl text-amber-200 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Evidence Conflict Detected — Human Review Recommended
            </span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {satelliteFusion.evidenceConflict?.explanation ||
              'Satellite observation does not strongly overlap reported citizen location. Manual verification recommended.'}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-amber-800/40">
            <span className="text-amber-300">Action: MANUAL_REVIEW (Ground report preserved; risk escalation withheld)</span>
            <span className="bg-amber-900/60 px-2 py-0.5 rounded text-amber-200">Overlap: {Math.round((spatialAgreement.overlapRatio || 0.18) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Satellite Telemetry Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensor / Orbit</span>
          <strong className="text-xs font-bold text-white block mt-0.5">
            {activeSensor === 'SAR' ? 'Sentinel-1 Dual-Pol' : 'Sentinel-2 MSI'}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">Descending • 10m res</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Flood Detected</span>
          <strong className={`text-xs font-bold block mt-0.5 ${
            isUnavailable ? 'text-slate-400' : observation.floodDetected ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {isUnavailable ? 'N/A' : observation.floodDetected ? 'YES (Inundated)' : 'NO'}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">Threshold: Otsu / &gt;0.3</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Confidence</span>
          <strong className="text-xs font-bold text-cyan-400 block mt-0.5">
            {isUnavailable ? '0%' : `${Math.round((observation.confidence || 0.89) * 100)}%`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">Sensor Quality Metric</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Affected Area</span>
          <strong className="text-xs font-bold text-white block mt-0.5">
            {isUnavailable ? '—' : `${observation.affectedAreaKm2 || 51.8} km²`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">Polygon Area Calc</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Water Change</span>
          <strong className={`text-xs font-bold block mt-0.5 ${
            isUnavailable ? 'text-slate-400' : 'text-amber-400'
          }`}>
            {isUnavailable ? '—' : `+${observation.changePercent || 18}%`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">vs 14-day baseline</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Ground Overlap</span>
          <strong className={`text-xs font-bold block mt-0.5 ${
            isUnavailable ? 'text-slate-400' : isConflict ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isUnavailable ? '—' : `${Math.round((spatialAgreement.overlapRatio || 0.82) * 100)}%`}
          </strong>
          <span className="text-[9px] font-mono text-slate-500">{spatialAgreement.status || 'CONFIRMED'}</span>
        </div>
      </div>

      {/* Multimodal Evidence Fusion Table & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Fusion Matrix Table */}
        <div className="lg:col-span-7 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Multimodal Evidence Fusion Matrix
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/50">
              Corroboration Logic
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">1. Citizen Ground Reports</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300">91% Conf</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">2. Hydrological Flood Model</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300">Risk 60 Base</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  HIGH
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">3. Satellite Sentinel-1 SAR</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300">89% Conf • 51.8 km²</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isUnavailable
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : isConflict
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                }`}>
                  {isUnavailable ? 'UNAVAILABLE' : isConflict ? 'CONFLICT' : 'CONFIRMED'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
              <span className="font-bold text-white">4. Combined Fusion Confidence</span>
              <strong className="text-sm font-mono font-extrabold text-cyan-300">
                {Math.round((satelliteFusion?.fusionConfidence || 0.94) * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Compact Evidence-to-Action Timeline */}
        <div className="lg:col-span-5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Evidence Timeline
            </span>
            <span className="text-[10px] font-mono text-slate-400">Sequential Chain</span>
          </div>

          <div className="space-y-2">
            {(satelliteFusion?.timeline || []).map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800 shrink-0 mt-0.5">
                  {step.time}
                </span>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-slate-200 flex items-center justify-between">
                    <span>{step.stage.replace('_', ' ')}</span>
                    <span className="text-[9px] font-mono text-slate-400">{step.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
