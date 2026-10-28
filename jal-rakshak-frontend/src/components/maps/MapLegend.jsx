import React, { useState } from 'react'
import { Shield, Home, AlertTriangle, Flame, LifeBuoy, ChevronDown, ChevronUp, Image as ImageIcon, AlertOctagon, Droplets } from 'lucide-react'

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(false) // Default collapsed to keep map clean

  return (
    <div className="bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-slate-700/80 text-white text-xs space-y-2 max-w-xs transition-all duration-300">
      {/* Header with quick collapse toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full font-bold text-white flex items-center justify-between hover:text-cyan-400 transition"
      >
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIS Intelligence Legend</span>
        </span>
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-2 pt-1 border-t border-slate-800 animate-fadeIn">
          {/* Severity Color Swatches */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Inundation Risk Zones
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/70 border border-red-400"></span>
                <span className="text-slate-300">Critical (&gt;1.5m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500/60 border border-orange-400"></span>
                <span className="text-slate-300">High (0.8-1.5m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/50 border border-amber-400"></span>
                <span className="text-slate-300">Medium (0.3-0.8m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400"></span>
                <span className="text-slate-300">Safe High Ground</span>
              </div>
            </div>
          </div>

          {/* Phase 4 Ground Evidence Legend */}
          <div className="border-t border-slate-800 pt-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Phase 4 Ground Evidence
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ImageIcon className="w-2 h-2" />
                </span>
                <span className="truncate">Image Evidence</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-3.5 h-3.5 rounded bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-2 h-2" />
                </span>
                <span className="truncate">Road Blocked</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                  <Droplets className="w-2 h-2" />
                </span>
                <span className="truncate">Ground Flood Report</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-2 h-2" />
                </span>
                <span className="truncate">SOS Beacon</span>
              </div>
            </div>
          </div>

          {/* Markers Legend */}
          <div className="border-t border-slate-800 pt-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Operational Entities
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Home className="w-2 h-2" />
                </span>
                <span className="truncate">Relief Shelter</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <LifeBuoy className="w-2 h-2" />
                </span>
                <span className="truncate">Rescue Boat Unit</span>
              </div>
            </div>
          </div>

          {/* Phase 7 Cyclone Legend */}
          <div className="border-t border-slate-800 pt-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
              Phase 7 Cyclone Intelligence
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-4 h-1 rounded bg-orange-500 shrink-0" />
                <span className="truncate">Historical Track</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-4 h-1 border-t-2 border-dashed border-red-500 shrink-0" />
                <span className="truncate">Forecast Track</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3.5 h-2.5 rounded border border-orange-400/80 bg-orange-500/20 shrink-0" />
                <span className="truncate">Uncertainty Cone</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-xs">🌀</span>
                <span className="truncate">Cyclone Center</span>
              </div>
            </div>
          </div>

          {/* Phase 8 Infrastructure & Priority Zones Legend */}
          <div className="border-t border-slate-800 pt-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
              Phase 8 Critical Infrastructure & Priority
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-xs">🏥</span>
                <span className="truncate">Hospital Lifeline</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-xs">🌉</span>
                <span className="truncate">River Bridge</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-xs">⚡</span>
                <span className="truncate">Power Substation</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-xs">💧</span>
                <span className="truncate">Water Treatment</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="truncate">CRITICAL Priority Evacuation Zone</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

