import React from 'react'

export function EvacuationPlanPanel({ evacuationPlan, shelterAllocations = [] }) {
  if (!evacuationPlan) {
    return (
      <div className="p-4 text-center text-sm text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800">
        Loading operational evacuation plan...
      </div>
    )
  }

  const {
    sourcePopulation = 7200,
    vulnerablePopulation = 2600,
    requiredCapacity = 2600,
    allocatedCapacity = 2600,
    remainingPopulation = 0,
    route = 'Safe Detour via SH-36 Bypass (+1.5 km)',
    batches = [],
    status = 'IN_PROGRESS',
  } = evacuationPlan

  return (
    <div className="space-y-4">
      {/* Top Header Summary */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Aska Floodplain Evacuation Board
          </h4>
          <p className="text-[11px] text-slate-400">Multi-shelter capacity-balanced routing</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          MODELLED EVACUATION PLAN
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">VULNERABLE TARGET</span>
          <p className="text-lg font-bold text-amber-400">{vulnerablePopulation.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">ALLOCATED SLOTS</span>
          <p className="text-lg font-bold text-emerald-400">{allocatedCapacity.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">UNALLOCATED</span>
          <p className={`text-lg font-bold ${remainingPopulation === 0 ? 'text-slate-300' : 'text-rose-400'}`}>
            {remainingPopulation.toLocaleString()}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">STATUS</span>
          <p className="text-xs font-bold text-cyan-400 mt-1 uppercase font-mono">{status}</p>
        </div>
      </div>

      {/* Safe Corridor */}
      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">🛣️</span>
          <div>
            <span className="font-semibold text-white">Active Transit Corridor:</span> {route}
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
          SAFE DETOUR
        </span>
      </div>

      {/* Shelter Allocations Breakdown */}
      <div>
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>🏫</span> Safe Reception Shelters Allocation
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {shelterAllocations.map((sh) => (
            <div key={sh.shelterId} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{sh.shelterId}</span>
                <span className="text-[10px] font-mono text-emerald-400">+{sh.elevationMeters}m Elev</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{sh.shelterName}</p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[11px]">Allocated:</span>
                <span className="text-emerald-400 font-bold">{sh.allocatedCount} evacuees</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evacuation Batches — Grouped into Vulnerable Priority vs General Exposure */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>👥</span> Modelled Evacuation Batches
          </h5>
          <span className="text-[10px] font-mono text-slate-400">
            Total Exposed: 7,200 (2,600 Vulnerable + 4,600 General)
          </span>
        </div>

        <div className="space-y-3">
          {/* Vulnerable Priority Group */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold px-1">
              <span>🔴 Priority Group A: Vulnerable Population (2,600)</span>
              <span>Batches 1 & 2</span>
            </div>
            {batches.filter((b) => b.batchNumber <= 2 || b.category === 'VULNERABLE_PRIORITY').map((batch) => (
              <div
                key={batch.batchNumber}
                className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400">Batch {batch.batchNumber}:</span>
                    <span className="font-semibold text-slate-200">{batch.targetGroup}</span>
                    <span className="text-[10px] text-rose-300 font-mono font-bold">({batch.count.toLocaleString()} pax)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{batch.recommendedTransport}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/50 text-rose-200 border border-rose-700/60 font-bold">
                  Priority {batch.priority}
                </span>
              </div>
            ))}
          </div>

          {/* General Exposure Group */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-1 pt-1">
              <span>🔵 Priority Group B: General Exposed Population (4,600)</span>
              <span>Batches 3 & 4</span>
            </div>
            {batches.filter((b) => b.batchNumber > 2 || b.category === 'GENERAL_EXPOSURE').map((batch) => (
              <div
                key={batch.batchNumber}
                className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">Batch {batch.batchNumber}:</span>
                    <span className="font-semibold text-slate-200">{batch.targetGroup}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({batch.count.toLocaleString()} pax)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{batch.recommendedTransport}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Priority {batch.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
