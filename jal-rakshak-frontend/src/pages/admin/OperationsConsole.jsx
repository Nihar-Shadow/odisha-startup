import React, { useState, useMemo, useCallback } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import { OperationalPlanPanel } from '../../components/admin/OperationalPlanPanel'
import ResponseActionQueue from '../../components/admin/ResponseActionQueue'
import ResponseUnitsPanel from '../../components/admin/ResponseUnitsPanel'
import WhatRespondersShouldDoPanel from '../../components/admin/WhatRespondersShouldDoPanel'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import { generateOperationalPlan, getOperationalTimeline } from '../../services/intelligence/allocation/resourceAllocationEngine'
import { evaluateDispatchDecisions, GANJAM_DEMO_RESPONSE_UNITS, normalizeShelter } from '../../services/adapters'
import { LifeBuoy, Navigation, Clock, ShieldCheck, Truck, Users, Radio, CheckCircle2 } from 'lucide-react'

export default function OperationsConsole() {
  const { shelters, reports } = useFloodData()
  const [operationalScenario, setOperationalScenario] = useState('CRITICAL_OPERATION')
  const [selectedMissionId, setSelectedMissionId] = useState('MIS-CRIT-01')
  const [selectedActionId, setSelectedActionId] = useState('ACT-01')
  const [selectedUnitId, setSelectedUnitId] = useState('RU-02')

  const normalizedShelters = useMemo(() => {
    return shelters.map((s) => normalizeShelter(s))
  }, [shelters])

  const operationalPlan = useMemo(() => {
    return generateOperationalPlan(operationalScenario)
  }, [operationalScenario])

  const operationalTimeline = useMemo(() => {
    return getOperationalTimeline(operationalScenario)
  }, [operationalScenario])

  const dispatchIntelligence = useMemo(() => {
    return evaluateDispatchDecisions({
      scenario: 'CRITICAL_INCIDENT',
      riskState: { score: 84, severity: 'CRITICAL' },
      shelters: normalizedShelters,
      responseUnits: GANJAM_DEMO_RESPONSE_UNITS,
    })
  }, [normalizedShelters])

  const handleSelectAction = useCallback((action) => {
    setSelectedActionId(action.id)
    if (action.decision?.responseUnitId) {
      setSelectedUnitId(action.decision.responseUnitId)
    }
  }, [])

  const handleSelectUnit = useCallback((unit) => {
    setSelectedUnitId(unit.id)
  }, [])

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5" />
              TACTICAL OPERATIONS & RESOURCE DISPATCH CONSOLE
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              FLEET & SHELTER LOGISTICS ONLINE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Tactical Fleet Dispatch, Mission Queue & Evacuation Logistics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Coordinating ODRAF, NDRF, and Fire Services rescue squads with route clearance detours, supply allocation matrices, and multi-shelter capacity load balancing.
          </p>
        </div>

        {/* Quick Fleet Metrics */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Active Missions</div>
            <div className="text-sm font-bold text-amber-400">
              {operationalPlan?.missions?.length || 5} Queued
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Units Deployed</div>
            <div className="text-sm font-bold text-emerald-400">
              {dispatchIntelligence.responseUnits?.length || 4} Squads
            </div>
          </div>
        </div>
      </div>

      {/* Directives Section */}
      <WhatRespondersShouldDoPanel
        scenario={operationalScenario}
        onSelectAction={handleSelectAction}
      />

      {/* Tactical Dispatch & Fleet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <ResponseActionQueue
            actionQueue={dispatchIntelligence.actionQueue}
            selectedActionId={selectedActionId}
            onSelectAction={handleSelectAction}
          />
        </div>

        <div className="lg:col-span-5">
          <ResponseUnitsPanel
            responseUnits={dispatchIntelligence.responseUnits}
            selectedUnitId={selectedUnitId}
            onSelectUnit={handleSelectUnit}
          />
        </div>
      </div>

      {/* Tactical Route & Fleet GIS Map */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">
              Tactical Fleet Positions & Safe Detour Routing Map
            </h3>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              ACTIVE DETOUR: VIA NH-59 (+1.5 KM SAFE)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>ODRAF/NDRF Squad</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              <span>Calculated Safe Detour</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span>Flooded Cutoff Road</span>
            </span>
          </div>
        </div>

        <div className="w-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800">
          <FloodRiskMap
            height="500px"
            zoom={12}
            showControls={true}
            responseUnits={dispatchIntelligence.responseUnits}
            dispatchRoute={dispatchIntelligence.routeEvaluation}
          />
        </div>
      </div>

      {/* Resource Allocation & Evacuation Plan Panel */}
      <OperationalPlanPanel
        operationalPlan={operationalPlan}
        operationalTimeline={operationalTimeline}
        currentScenario={operationalScenario}
        onScenarioChange={setOperationalScenario}
        onSelectMission={(m) => setSelectedMissionId(m.id || m.missionId)}
        selectedMissionId={selectedMissionId}
      />
    </div>
  )
}
