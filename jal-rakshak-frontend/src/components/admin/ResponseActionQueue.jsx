import React, { useState } from 'react'
import {
  ShieldAlert,
  Flame,
  Clock,
  ArrowRight,
  LifeBuoy,
  Truck,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Home,
  Info,
} from 'lucide-react'

export default function ResponseActionQueue({
  actionQueue = [],
  selectedActionId,
  onSelectAction,
}) {
  const [activeRationaleId, setActiveRationaleId] = useState(null)

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40'
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      case 'MEDIUM':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600'
    }
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'RESCUE':
        return 'bg-red-600 text-white'
      case 'EVACUATE':
        return 'bg-orange-600 text-white'
      case 'REDIRECT':
        return 'bg-amber-600 text-white'
      case 'SUPPLY':
        return 'bg-purple-600 text-white'
      default:
        return 'bg-slate-700 text-slate-200'
    }
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="font-extrabold text-sm text-white">Response Action Queue</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
            Phase 5 Intelligence
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {actionQueue.length} ACTIONS
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Deterministic decision-support recommendations: connects current risk, verified evidence, safe routes, and modelled response units.
      </p>

      {/* Action Cards Queue */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {actionQueue.map((item, idx) => {
          const isSelected = selectedActionId === item.id
          const isRationaleOpen = activeRationaleId === item.id
          const dec = item.decision

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition text-xs space-y-2.5 ${
                isSelected
                  ? 'bg-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-950/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top row: Priority, Incident ID, Action Tag, and ETA */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold font-mono text-slate-500">#{idx + 1}</span>
                  <span
                    className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md border uppercase ${getPriorityStyle(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {item.incidentId}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide ${getActionBadge(
                      item.action
                    )}`}
                  >
                    {item.action}
                  </span>
                </div>

                {item.etaMinutes && (
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 shrink-0">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>ETA {item.etaMinutes}m</span>
                  </div>
                )}
              </div>

              {/* Title & Summary */}
              <div>
                <h4 className="font-bold text-white text-xs leading-snug">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.summary}</p>
              </div>

              {/* Context metadata: Assigned Unit, Avoided Route, Shelter, Resources */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                {dec?.responseUnitId && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <Truck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">Unit: <strong className="text-white">{dec.responseUnitId}</strong></span>
                  </div>
                )}
                {dec?.route?.avoidedSegment && (
                  <div className="flex items-center gap-1 text-rose-300">
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">Avoid: <strong className="text-rose-400">{dec.route.avoidedSegment}</strong></span>
                  </div>
                )}
                {dec?.shelterId && (
                  <div className="flex items-center gap-1 text-purple-300">
                    <Home className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">Shelter: <strong className="text-white">{dec.shelterId}</strong></span>
                  </div>
                )}
                {dec?.resources && dec.resources.length > 0 && (
                  <div className="flex items-center gap-1 text-amber-300">
                    <Package className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{dec.resources[0]}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setActiveRationaleId(isRationaleOpen ? null : item.id)}
                  className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
                >
                  <Info className="w-3 h-3" />
                  <span>{isRationaleOpen ? 'Hide Rationale' : 'Decision Rationale'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectAction && onSelectAction(item)}
                  className={`text-[11px] font-bold py-1 px-3 rounded-lg flex items-center gap-1 transition ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <span>{isSelected ? 'Active Selection' : 'View on Map'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Rationale Drawer */}
              {isRationaleOpen && dec && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 animate-fadeIn">
                  <div className="font-bold text-slate-200 flex items-center justify-between text-[10px] uppercase tracking-wider">
                    <span>Explainable Decision Rationale</span>
                    <span className="text-emerald-400 font-mono">Confidence: {Math.round((dec.confidence || 0.9) * 100)}%</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    {dec.rationale.map((reason, rIdx) => (
                      <li key={rIdx} className="leading-relaxed">
                        <span className="text-slate-300">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-cyan-950/20 rounded-2xl border border-cyan-500/20 text-[10px] text-cyan-300 italic">
        "Decision-Support Output: Recommendations are computed deterministically. Always verified by Incident Commander."
      </div>
    </div>
  )
}
