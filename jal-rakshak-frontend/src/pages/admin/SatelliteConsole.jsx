import React, { useState, useMemo, useCallback } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import SatelliteEvidencePanel from '../../components/admin/SatelliteEvidencePanel'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import { evaluateSatelliteFusion } from '../../services/intelligence/satellite/satelliteFusionEngine'
import { GANJAM_DEMO_RESPONSE_UNITS, normalizeShelter } from '../../services/adapters'
import { Satellite, Layers, Eye, RefreshCw, Radio, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react'

export default function SatelliteConsole() {
  const { shelters, reports } = useFloodData()
  const [satelliteScenario, setSatelliteScenario] = useState('SATELLITE_CONFIRMS')
  const [isVerifying, setIsVerifying] = useState(false)

  const normalizedShelters = useMemo(() => {
    return shelters.map((s) => normalizeShelter(s))
  }, [shelters])

  const satelliteFusion = useMemo(() => {
    return evaluateSatelliteFusion({
      scenario: satelliteScenario,
      groundEvidenceItems: reports || [],
      shelters: normalizedShelters,
      responseUnits: GANJAM_DEMO_RESPONSE_UNITS,
    })
  }, [satelliteScenario, reports, normalizedShelters])

  const handleVerify = useCallback(() => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
    }, 600)
  }, [])

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/25 flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5" />
              EARTH OBSERVATION & REMOTE SENSING CONSOLE
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SENTINEL-1 SAR DUAL-POL ACTIVE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Satellite Radar & Multi-Modal Flood Inundation Fusion
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Cloud-penetrating Synthetic Aperture Radar (SAR) backscatter analysis combined with optical multispectral indices to objectively delineate Ganjam flood extents and corroborate citizen ground reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Fusing Radar Data...' : 'Sync SAR Overpass'}</span>
          </button>
        </div>
      </div>

      {/* Main Satellite Evidence Panel */}
      <SatelliteEvidencePanel
        satelliteFusion={satelliteFusion}
        satelliteScenario={satelliteScenario}
        onScenarioChange={setSatelliteScenario}
        onVerify={handleVerify}
        isVerifying={isVerifying}
      />

      {/* Dedicated GIS Radar Delineation Map */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-extrabold text-sm text-white">
              Ganjam Basin SAR Water Extent Overlay
            </h3>
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              POLARIZATION: VV + VH (COHERENCE FUSED)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span>SAR Inundation Delineation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Verified Ground Flood</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Safe Evacuation Shelters</span>
            </span>
          </div>
        </div>

        <div className="w-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800">
          <FloodRiskMap
            height="500px"
            zoom={12}
            showControls={true}
            satelliteObservation={satelliteFusion.observation}
            responseUnits={GANJAM_DEMO_RESPONSE_UNITS}
          />
        </div>
      </div>
    </div>
  )
}
