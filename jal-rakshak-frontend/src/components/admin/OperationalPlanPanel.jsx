import React, { useState } from 'react'
import { MissionQueuePanel } from './MissionQueuePanel'
import { ResourceAllocationPanel } from './ResourceAllocationPanel'
import { EvacuationPlanPanel } from './EvacuationPlanPanel'
import { SupplyAllocationPanel } from './SupplyAllocationPanel'
import { OperationalTimeline } from './OperationalTimeline'

export function OperationalPlanPanel({
  operationalPlan,
  operationalTimeline,
  currentScenario = 'CRITICAL_OPERATION',
  onScenarioChange,
  onSelectMission,
  selectedMissionId,
}) {
  const [activeTab, setActiveTab] = useState('missions') // 'missions' | 'evacuation' | 'resources' | 'supplies' | 'preposition' | 'timeline'

  if (!operationalPlan) {
    return (
      <div className="p-4 text-center text-sm text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800">
        Loading operational response plan...
      </div>
    )
  }

  const {
    priorityMissions = [],
    evacuationPlans = [],
    shelterAllocations = [],
    supplyAllocations = [],
    prePositioning = [],
    blockedActions = [],
    unresolvedNeeds = [],
    assumptions = [],
  } = operationalPlan

  const activeEvacPlan = evacuationPlans[0]
  const immediateCount = priorityMissions.filter(
    (m) => m.priorityClass === 'IMMEDIATE' || m.priority >= 90
  ).length

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-4 shadow-xl">
      {/* Top Banner & Scenario Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              Phase 9 — Operational Planning & Resource Allocation
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              OPTIMIZED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Capacity-constrained mission sequencing, multi-shelter evacuation & deterministic fleet allocation
          </p>
        </div>

        {/* Demo Scenarios */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1">SCENARIO:</span>
          {[
            { id: 'MONITORING', label: '1. Monitoring' },
            { id: 'GROUND_EVIDENCE', label: '2. Ground Evid' },
            { id: 'SATELLITE_CONFIRMED', label: '3. Satellite' },
            { id: 'CYCLONE_APPROACHING', label: '4. Cyclone' },
            { id: 'CRITICAL_OPERATION', label: '5. Critical Plan' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => onScenarioChange && onScenarioChange(sc.id)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors border ${
                currentScenario === sc.id
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Operational Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] text-slate-400">PRIORITY MISSIONS</span>
          <p className="text-base font-bold text-white">
            {priorityMissions.length}{' '}
            <span className="text-xs text-red-400 font-semibold">({immediateCount} Immediate)</span>
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] text-slate-400">EVACUATION ALLOCATED</span>
          <p className="text-base font-bold text-emerald-400">
            {activeEvacPlan?.allocatedCapacity?.toLocaleString() || '2,600'}{' '}
            <span className="text-xs text-slate-400">/ {activeEvacPlan?.requiredCapacity?.toLocaleString() || '2,600'}</span>
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] text-slate-400">SHELTER RECEPTION</span>
          <p className="text-base font-bold text-cyan-400">
            {shelterAllocations.length} Safe Facilities
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] text-slate-400">UNRESOLVED NEEDS</span>
          <p className={`text-base font-bold ${unresolvedNeeds.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {unresolvedNeeds.length} Constrained
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-1 overflow-x-auto text-xs font-mono">
        {[
          { id: 'missions', label: `Missions (${priorityMissions.length})`, icon: '🎯' },
          { id: 'evacuation', label: 'Evacuation Plan', icon: '👥' },
          { id: 'resources', label: 'Fleet Allocation', icon: '🚤' },
          { id: 'supplies', label: 'Supplies Logistics', icon: '📦' },
          { id: 'preposition', label: `Pre-Positioning (${prePositioning.length})`, icon: '⚓' },
          { id: 'timeline', label: 'Response Timeline', icon: '⏱️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-t font-semibold transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'missions' && (
          <MissionQueuePanel
            missions={priorityMissions}
            onSelectMission={onSelectMission}
            selectedMissionId={selectedMissionId}
          />
        )}

        {activeTab === 'evacuation' && (
          <EvacuationPlanPanel
            evacuationPlan={activeEvacPlan}
            shelterAllocations={shelterAllocations}
          />
        )}

        {activeTab === 'resources' && (
          <ResourceAllocationPanel
            resources={operationalPlan.resourceAllocations.flatMap((a) => a.selectedResources || [])}
          />
        )}

        {activeTab === 'supplies' && (
          <SupplyAllocationPanel supplies={supplyAllocations} />
        )}

        {activeTab === 'preposition' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Resource Pre-Positioning Advisory
                </h4>
                <p className="text-[11px] text-slate-400">Stage critical units ahead of storm surge peak</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                MODELLED PRE-POSITIONING
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {prePositioning.map((pos) => (
                <div key={pos.id} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{pos.resourceName}</span>
                      <span className="text-[10px] font-mono text-cyan-300">({pos.resourceId})</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {pos.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-400">Staging Area:</span>{' '}
                    <strong className="text-slate-100">{pos.stagingArea}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">{pos.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <OperationalTimeline timeline={operationalTimeline} />
        )}
      </div>

      {/* Model Honesty Disclaimers Footer */}
      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <span className="text-cyan-400 text-sm mt-0.5">ℹ️</span>
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-300">
            MODELLED OPERATIONAL PLAN • DECISION-SUPPORT RECOMMENDATION
          </p>
          <p>
            Resource assignments and evacuation sequences are deterministic optimization recommendations based on simulated disaster intelligence. Not an official state evacuation directive.
          </p>
        </div>
      </div>
    </div>
  )
}
