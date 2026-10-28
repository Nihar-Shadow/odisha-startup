import React from 'react'
import { Building2, Hospital, Home, AlertOctagon, Zap, AlertTriangle } from 'lucide-react'

export default function InfrastructureRiskPanel({
  criticalInfrastructure = [],
  infrastructureImpacts = [],
}) {
  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <h3 className="font-extrabold text-sm text-white">CRITICAL INFRASTRUCTURE RISK</h3>
        </div>
        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
          MODELLED INFRASTRUCTURE
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Infrastructure status and access dependencies across Ganjam district:
      </p>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {criticalInfrastructure.map((item) => {
          const impact = infrastructureImpacts.find((imp) => imp.infrastructureId === item.id) || {
            impactScore: 45,
            impactLevel: 'MODERATE',
            accessRisk: 'LOW',
            recommendedAction: 'Monitor status',
          }

          const isCritical = impact.impactLevel === 'CRITICAL'
          const isHigh = impact.impactLevel === 'HIGH'

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                isCritical
                  ? 'bg-red-950/30 border-red-500/40'
                  : isHigh
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{item.name}</span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                    isCritical
                      ? 'bg-red-500/30 text-red-300'
                      : isHigh
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {impact.impactLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Access: <strong className={impact.accessRisk === 'CRITICAL' ? 'text-red-400' : 'text-slate-300'}>{impact.accessRisk}</strong></span>
                <span>Road: <strong className={item.serviceDependency?.roadAccess === 'BLOCKED' ? 'text-red-400' : 'text-slate-300'}>{item.serviceDependency?.roadAccess || 'OPEN'}</strong></span>
                <span className="text-slate-500">PROVENANCE: DEMO</span>
              </div>

              <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                {impact.recommendedAction}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
