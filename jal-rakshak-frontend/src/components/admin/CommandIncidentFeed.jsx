import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Flame,
  Radio,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { SourceCategory, SeverityLevel } from '../../domain/contracts'

const SOURCE_BADGES = {
  [SourceCategory.CITIZEN]: {
    label: 'CITIZEN',
    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  [SourceCategory.SOS]: {
    label: 'SOS DISTRESS',
    bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  [SourceCategory.WEATHER]: {
    label: 'WEATHER ANOMALY',
    bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  [SourceCategory.SATELLITE]: {
    label: 'SATELLITE SAR',
    bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  [SourceCategory.MODEL]: {
    label: 'AI MODEL',
    bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  [SourceCategory.DEMO]: {
    label: 'DEMO FEED',
    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
}

const SEVERITY_BADGES = {
  [SeverityLevel.CRITICAL]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [SeverityLevel.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [SeverityLevel.MEDIUM]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  [SeverityLevel.MODERATE]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [SeverityLevel.LOW]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export default function CommandIncidentFeed({
  incidents = [],
  onSelectIncident,
  maxItems = 8,
}) {
  const [filterSource, setFilterSource] = useState('ALL')

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSource === 'ALL') return true
    return inc.source === filterSource
  })

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-extrabold text-sm text-white">Live Ganjam Incident Feed</h3>
            <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
              {filteredIncidents.length} Ground Events
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[10px]">
            {['ALL', SourceCategory.CITIZEN, SourceCategory.SOS].map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setFilterSource(src)}
                className={`px-2 py-0.5 rounded-md border font-semibold transition cursor-pointer ${
                  filterSource === src
                    ? 'bg-brand-600 text-white border-brand-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Verified citizen reports, active SOS beacons, and early warning events across Ganjam blocks.
        </p>

        {/* Incident Items */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredIncidents.slice(0, maxItems).map((inc) => {
            const badge = SOURCE_BADGES[inc.source] || SOURCE_BADGES[SourceCategory.CITIZEN]
            const sevBadge = SEVERITY_BADGES[inc.severity] || SEVERITY_BADGES[SeverityLevel.MEDIUM]

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident?.(inc)}
                className="p-3 bg-slate-950/70 hover:bg-slate-800/80 rounded-2xl border border-slate-800/80 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-[11px] text-white">
                      {inc.id}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${sevBadge}`}>
                      {inc.severity}
                    </span>
                    {inc.verified && (
                      <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(inc.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{inc.locationName}</span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {inc.description}
                </p>

                {inc.trappedPeople > 0 && (
                  <div className="mt-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded inline-flex items-center gap-1 border border-rose-500/20">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>{inc.trappedPeople} People Stranded • Rescue Required</span>
                  </div>
                )}
              </div>
            )
          })}

          {filteredIncidents.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-xs">
              No incidents matching the active filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
