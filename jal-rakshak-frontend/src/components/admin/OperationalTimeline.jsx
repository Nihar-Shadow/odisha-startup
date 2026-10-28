import React from 'react'

export function OperationalTimeline({ timeline }) {
  const stages = timeline?.stages || []

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500 text-black border-emerald-400'
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-cyan-500 text-black border-cyan-400 animate-pulse'
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Operational Mission Response Timeline
          </h4>
          <p className="text-[11px] text-slate-400">Deterministic sequence of coordinated dispatch milestones</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          MODELLED RESPONSE TIMELINE
        </span>
      </div>

      <div className="relative pl-6 space-y-4 max-h-[360px] overflow-y-auto pr-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {stages.map((stage) => (
          <div key={stage.step} className="relative group">
            {/* Circle Node */}
            <div
              className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${getStatusColor(
                stage.status
              )}`}
            />

            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-cyan-400">{stage.timeOffset}</span>
                <span className="text-xs font-bold text-slate-100">{stage.event}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {stage.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-sans">{stage.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
