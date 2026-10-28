import React from 'react'

export function MissionQueuePanel({ missions = [], onSelectMission, selectedMissionId }) {
  const getPriorityBadge = (pClass, pScore) => {
    switch (pClass) {
      case 'IMMEDIATE':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'URGENT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'PLANNED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED':
      case 'ACTIVE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'RESOURCE_CONSTRAINED':
      case 'DELAYED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse'
      case 'BLOCKED':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Operational Mission Queue ({missions.length})
          </h4>
          <p className="text-[11px] text-slate-400">Capacity-aware sequenced dispatch missions</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          MODELLED MISSION SEQUENCE
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {missions.map((mission, idx) => {
          const isSelected = selectedMissionId === mission.missionId || selectedMissionId === mission.id
          return (
            <div
              key={mission.missionId || mission.id || idx}
              onClick={() => onSelectMission && onSelectMission(mission)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-slate-100">
                    {mission.missionType?.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${getPriorityBadge(mission.priorityClass || (mission.priority >= 90 ? 'IMMEDIATE' : 'URGENT'), mission.priority)}`}>
                    {mission.priorityClass || (mission.priority >= 90 ? 'IMMEDIATE' : 'URGENT')} • P-{mission.priority}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${getStatusBadge(mission.status)}`}>
                  {mission.status?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-300">
                <p className="font-sans line-clamp-2">{mission.rationale}</p>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/60 font-mono">
                <div>
                  <span className="text-slate-400">ASSIGNED RESOURCE:</span>
                  <p className="text-cyan-300 font-semibold truncate">
                    {mission.selectedResources && mission.selectedResources.length > 0
                      ? mission.selectedResources.map((r) => r.name || r.id).join(' + ')
                      : 'None (Resource Constrained)'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">ETA / DURATION:</span>
                  <p className="text-slate-200">
                    {mission.estimatedETA ? `${mission.estimatedETA} min ETA` : 'Pending'}
                  </p>
                </div>
              </div>

              {mission.constraints && mission.constraints.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                  ⚠️ <span className="font-semibold">Constraint:</span> {mission.constraints[0]}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
