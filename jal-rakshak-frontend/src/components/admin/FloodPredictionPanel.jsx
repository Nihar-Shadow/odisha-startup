import React from 'react'
import {
  BrainCircuit,
  Droplets,
  Clock,
  ShieldAlert,
  Compass,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

export default function FloodPredictionPanel({
  floodPrediction,
  scenario = 'BASELINE',
  onScenarioChange,
}) {
  if (!floodPrediction) return null

  const isCritical = floodPrediction.severity === 'CRITICAL'
  const isHighOrCritical = floodPrediction.severity === 'HIGH' || isCritical
  const factors = floodPrediction.contributingFactors || {
    rainfall: 32,
    river: 28,
    soil: 15,
    slope: 12,
    proximity: 8,
    lightning: 5,
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100 space-y-4">
      {/* Header with Source & Scenario Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Hyperlocal Flood Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/60">
                DECISION-SUPPORT MODEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Rushikulya & Bahuda River Catchments • Dynamic Weather & Sensor Input
            </p>
          </div>
        </div>

        {/* Demo Scenario Switch (Developer / Evaluation Controls) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-1">Scenario:</span>
          <button
            type="button"
            onClick={() => onScenarioChange && onScenarioChange('BASELINE')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              scenario === 'BASELINE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Baseline (48)
          </button>
          <button
            type="button"
            onClick={() => onScenarioChange && onScenarioChange('WORSENING')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              scenario === 'WORSENING' || scenario === 'ESCALATED'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Worsening (~60)
          </button>
          <button
            type="button"
            onClick={() => onScenarioChange && onScenarioChange('SEVERE')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              scenario === 'SEVERE'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Severe (~76)
          </button>
        </div>
      </div>

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Risk Score & Severity */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Calibrated Risk</span>
            <Activity className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black ${
                isCritical ? 'text-red-400' : isHighOrCritical ? 'text-orange-400' : 'text-amber-400'
              }`}
            >
              {floodPrediction.score}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <span
            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
              isCritical
                ? 'bg-red-950/80 text-red-300 border-red-800/70'
                : isHighOrCritical
                ? 'bg-orange-950/60 text-orange-400 border-orange-800/50'
                : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
            }`}
          >
            {floodPrediction.severity}
          </span>
        </div>

        {/* Flood Probability & Confidence */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Flood Probability</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-300">
              {Math.round(floodPrediction.probability * 100)}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            Confidence: <strong className="text-slate-200">{Math.round(floodPrediction.confidence * 100)}%</strong>
          </div>
        </div>

        {/* Expected Arrival Window */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Onset Window</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-300">
              {floodPrediction.estimatedArrivalHours ? `~${floodPrediction.estimatedArrivalHours}` : '4-6'}
            </span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Rainfall Rate: <strong className="text-slate-200">{floodPrediction.rainfallMmPerHour} mm/h</strong>
          </span>
        </div>

        {/* Impact Footprint */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Impact Footprint</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-purple-300">
              {floodPrediction.affectedAreaKm2}
            </span>
            <span className="text-[10px] text-slate-400">km²</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Pop at Risk: <strong className="text-slate-200">{floodPrediction.affectedPopulation?.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Configured Model Factor Weights Breakdown (Honest Explainability) */}
      <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wide uppercase text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" /> Hydrological Factor Contributions (Configured Model Weights)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Normalized CWC/NDRF Heuristic Weights</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-xs">
          {/* Heavy Rainfall */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Rainfall Accumulation</span>
              <strong className="text-blue-400">{factors.rainfall}%</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${factors.rainfall}%` }}
              />
            </div>
          </div>

          {/* River Surge */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Rushikulya Gauge</span>
              <strong className="text-cyan-400">{factors.river}%</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${factors.river}%` }}
              />
            </div>
          </div>

          {/* Soil Saturation */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Soil Saturation</span>
              <strong className="text-amber-400">{factors.soil}%</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${factors.soil}%` }}
              />
            </div>
          </div>

          {/* Coastal Slope Lowlands */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Low-lying Slope (&lt;4°)</span>
              <strong className="text-emerald-400">{factors.slope}%</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${factors.slope}%` }}
              />
            </div>
          </div>

          {/* Channel Proximity */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Bank Proximity</span>
              <strong className="text-purple-400">{factors.proximity}%</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${factors.proximity}%` }}
              />
            </div>
          </div>

          {/* Lightning / Squall */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Convective Activity</span>
              <strong className="text-yellow-400">{factors.lightning}%</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${factors.lightning}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decision-Support Operational Recommendation */}
      <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-200">
        <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-blue-300 font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
            Decision-Support Operational Action Plan
          </strong>
          {floodPrediction.recommendation}
        </div>
      </div>
    </div>
  )
}
