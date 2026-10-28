import React from 'react'

export function ResourceAllocationPanel({ resources = [], onSelectResource, selectedResourceId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'ASSIGNED':
      case 'EN_ROUTE':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
      case 'ON_SCENE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      case 'MAINTENANCE':
      case 'UNAVAILABLE':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  }

  const availableCount = resources.filter((r) => r.status === 'AVAILABLE').length
  const assignedCount = resources.filter((r) => r.status === 'ASSIGNED' || r.status === 'EN_ROUTE').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Resource Fleet & Capacity Board ({resources.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            {availableCount} Available • {assignedCount} Deployed/Assigned
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          MODELLED CAPACITY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {resources.map((res) => {
          const isSelected = selectedResourceId === res.id
          return (
            <div
              key={res.id}
              onClick={() => onSelectResource && onSelectResource(res)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{res.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({res.id})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {res.type?.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStatusColor(res.status)}`}>
                  {res.status}
                </span>
              </div>

              <div className="mt-2 text-[11px] grid grid-cols-2 gap-2 text-slate-300 font-mono">
                <div>
                  <span className="text-slate-400">CAPACITY:</span>{' '}
                  <span className="font-semibold text-white">
                    {res.availableCapacity} / {res.capacity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">ETA / SPEED:</span>{' '}
                  <span className="text-cyan-300 font-semibold">{res.responseTime}m</span>
                </div>
              </div>

              {res.currentAssignment && (
                <div className="mt-2 text-[11px] text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/40 truncate">
                  🎯 <span className="font-semibold">Assignment:</span> {res.currentAssignment}
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-1">
                {res.capabilities?.map((cap, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
