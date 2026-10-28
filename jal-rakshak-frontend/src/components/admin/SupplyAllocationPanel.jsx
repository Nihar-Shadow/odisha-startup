import React from 'react'

export function SupplyAllocationPanel({ supplies = [] }) {
  const getSupplyIcon = (type) => {
    switch (type) {
      case 'DRINKING_WATER':
        return '💧'
      case 'MEDICAL_KIT':
        return '🩺'
      case 'LIFE_JACKET':
        return '🦺'
      case 'FOOD':
        return '🍞'
      case 'EMERGENCY_POWER':
        return '⚡'
      default:
        return '📦'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Critical Supply Logistics & Quotas
          </h4>
          <p className="text-[11px] text-slate-400">Demand estimation: 2L water/person/day, 1 kit/50 vulnerable</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          MODELLED OPERATIONAL ASSUMPTION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {supplies.map((sup) => (
          <div key={sup.id} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{getSupplyIcon(sup.type)}</span>
                <div>
                  <h5 className="font-bold text-slate-200">{sup.type?.replace(/_/g, ' ')}</h5>
                  <p className="text-[10px] text-slate-400 font-mono">Dest: {sup.destination}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                P-{sup.priority}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">REQUIRED:</span>{' '}
                <span className="text-white font-semibold">
                  {sup.requiredQuantity?.toLocaleString()} {sup.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400">ALLOCATED:</span>{' '}
                <span className="text-emerald-400 font-semibold">
                  {sup.allocatedQuantity?.toLocaleString()} {sup.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 font-mono">
              <span>Status: <strong className="text-emerald-400">{sup.status}</strong></span>
              <span>Coverage: <strong className="text-cyan-400">{Math.round((sup.allocatedQuantity / (sup.requiredQuantity || 1)) * 100)}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
