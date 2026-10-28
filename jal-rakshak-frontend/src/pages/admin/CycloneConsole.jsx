import React, { useState, useMemo } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import CycloneIntelligencePanel from '../../components/admin/CycloneIntelligencePanel'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import { evaluateCycloneIntelligence } from '../../services/intelligence/cyclone/cycloneRiskEngine'
import { GANJAM_DEMO_RESPONSE_UNITS, normalizeShelter } from '../../services/adapters'
import { Compass, Wind, Waves, Radio, ShieldAlert, AlertTriangle, Clock } from 'lucide-react'

export default function CycloneConsole() {
  const { shelters, reports } = useFloodData()
  const [cycloneScenario, setCycloneScenario] = useState('APPROACHING')

  const normalizedShelters = useMemo(() => {
    return shelters.map((s) => normalizeShelter(s))
  }, [shelters])

  const cycloneIntelligence = useMemo(() => {
    return evaluateCycloneIntelligence({
      scenario: cycloneScenario,
      baseRiskScore: 78,
      weatherSeverity: 'SEVERE',
      floodRiskScore: 74,
      previousIncidents: reports || [],
      shelters: normalizedShelters,
      responseUnits: GANJAM_DEMO_RESPONSE_UNITS,
    })
  }, [cycloneScenario, reports, normalizedShelters])

  return (
    <div className="space-y-6">
      {/* Cyclone Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/25 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              CYCLONE & STORM SURGE METEOROLOGICAL CONSOLE
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              IMD / GDACS RADAR TRACKING
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Cyclonic Track & Multi-Hazard Surge Risk
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time tropical cyclone trajectory forecasting, coastal storm surge hydrodynamic modeling, and compound flood risk analysis for Ganjam district coastal zones and river estuaries.
          </p>
        </div>

        {/* Quick Storm Metrics */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Estimated Landfall</div>
            <div className="text-sm font-bold text-orange-400">
              {cycloneIntelligence.observation?.approachTimeHours ? `~${cycloneIntelligence.observation.approachTimeHours} Hours` : 'Monitoring'}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Surge Probability</div>
            <div className="text-sm font-bold text-red-400">
              {cycloneIntelligence.cycloneRisk?.stormSurgeRisk || 72}%
            </div>
          </div>
        </div>
      </div>

      {/* Full Cyclone Intelligence Panel */}
      <CycloneIntelligencePanel
        cycloneIntelligence={cycloneIntelligence}
        cycloneObservation={cycloneIntelligence.observation}
        cycloneRisk={cycloneIntelligence.cycloneRisk}
        multiHazard={cycloneIntelligence.multiHazard}
        timeline={cycloneIntelligence.timeline}
        currentScenario={cycloneScenario}
        cycloneScenario={cycloneScenario}
        onScenarioChange={setCycloneScenario}
      />

      {/* Coastal GIS Trajectory & Inundation Map */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-orange-400" />
            <h3 className="font-extrabold text-sm text-white">
              Ganjam Coastal Surge & Cone of Uncertainty Map
            </h3>
            <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
              PROXIMITY: {cycloneIntelligence.observation?.distanceToGanjamKm || 182} KM
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500 animate-pulse" />
              <span>Projected Landfall Cone</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
              <span>Coastal Surge Plain</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Multi-Purpose Cyclone Shelters</span>
            </span>
          </div>
        </div>

        <div className="w-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800">
          <FloodRiskMap
            height="500px"
            zoom={11}
            showControls={true}
            cycloneObservation={cycloneIntelligence.observation}
            responseUnits={GANJAM_DEMO_RESPONSE_UNITS}
          />
        </div>
      </div>
    </div>
  )
}
