import React from 'react'
import { ShieldAlert, Users, LifeBuoy, AlertTriangle } from 'lucide-react'

export default function ZonePriorityPanel({ zonePriorities = [] }) {
  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="font-extrabold text-sm text-white">ZONE RESPONSE PRIORITY</h3>
        </div>
        <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
          DETERMINISTIC PRIORITY SCORE
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Prioritizing response where vulnerable populations and compromised lifelines require earliest action:
      </p>

      <div className="space-y-3">
        {zonePriorities.map((zone, idx) => {
          const isCritical = zone.priorityClass === 'CRITICAL'
          const isHigh = zone.priorityClass === 'HIGH'

          return (
            <div
              key={zone.zoneId}
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isCritical
                  ? 'bg-red-950/30 border-red-500/40'
                  : isHigh
                  ? 'bg-orange-950/20 border-orange-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">0{idx + 1}</span>
                  <span className="font-bold text-white text-xs">
                    {zone.zoneId === 'ZONE-GANJAM-02'
                      ? 'Aska Floodplain'
                      : zone.zoneId === 'ZONE-GANJAM-01'
                      ? 'Gopalpur Lowlands'
                      : 'Purushottampur Lowlands'}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCritical
                        ? 'bg-red-500/30 text-red-300'
                        : isHigh
                        ? 'bg-orange-500/30 text-orange-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {zone.priorityClass}
                  </span>
                </div>

                <span
                  className={`text-sm font-black font-mono ${
                    isCritical ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-slate-300'
                  }`}
                >
                  Priority {zone.priorityScore}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 flex items-center gap-2 font-mono">
                <span>{zone.vulnerablePopulation?.toLocaleString('en-IN')} vulnerable</span>
                <span>•</span>
                <span>{zone.exposedPopulation?.toLocaleString('en-IN')} exposed</span>
                {zone.infrastructureAtRisk > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300">{zone.infrastructureAtRisk} critical assets at risk</span>
                  </>
                )}
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-200">
                <span className="font-bold text-cyan-400 uppercase text-[9px] block">ACTION:</span>
                {zone.recommendedAction}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
