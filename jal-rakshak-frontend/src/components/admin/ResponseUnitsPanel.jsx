import React, { useState } from 'react'
import {
  Truck,
  LifeBuoy,
  Shield,
  Activity,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

export default function ResponseUnitsPanel({
  responseUnits = [],
  onSelectUnit,
  selectedUnitId,
}) {
  const [expandedUnitId, setExpandedUnitId] = useState(null)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'DISPATCHED':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse'
      case 'EN_ROUTE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'ON_SCENE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700'
    }
  }

  const getCapabilityBadge = (cap) => {
    switch (cap) {
      case 'WATER_RESCUE':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-700/40'
      case 'MEDICAL':
        return 'bg-rose-950/60 text-rose-300 border-rose-700/40'
      case 'EVACUATION':
        return 'bg-orange-950/60 text-orange-300 border-orange-700/40'
      case 'FIRE_RESPONSE':
        return 'bg-red-950/60 text-red-300 border-red-700/40'
      case 'SUPPLIES':
        return 'bg-purple-950/60 text-purple-300 border-purple-700/40'
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-sm text-white">Modelled Response Units</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
            DEMO CAPACITY
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {responseUnits.length} UNITS
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Ganjam tactical response fleet capacity. Capability matching ensures units are dispatched only for eligible incident types.
      </p>

      {/* Response Units List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {responseUnits.map((unit) => {
          const isSelected = selectedUnitId === unit.id
          const isExpanded = expandedUnitId === unit.id

          return (
            <div
              key={unit.id}
              className={`p-3 rounded-2xl border transition text-xs space-y-2 ${
                isSelected
                  ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-950/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <strong className="text-white font-bold">{unit.id}</strong>
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">{unit.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-brand-400" />
                    <span className="truncate">{unit.location?.name || unit.currentLocation}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                      unit.status
                    )}`}
                  >
                    {unit.status}
                  </span>
                  {unit.etaMinutes && (
                    <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      <span>ETA {unit.etaMinutes}m</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Capabilities & Type tags */}
              <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-800/60">
                <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {unit.type}
                </span>
                {unit.capabilities?.map((cap) => (
                  <span
                    key={cap}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getCapabilityBadge(
                      cap
                    )}`}
                  >
                    {cap.replace('_', ' ')}
                  </span>
                ))}
              </div>

              {/* Expanded details */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Capacity: <strong className="text-white">{unit.capacity} persons</strong></span>
                <button
                  type="button"
                  onClick={() => onSelectUnit && onSelectUnit(unit)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Locate Unit</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] text-slate-400 italic">
        "Modelled Response Capacity: Simulated demo response units for disaster orchestration decision-support."
      </div>
    </div>
  )
}
