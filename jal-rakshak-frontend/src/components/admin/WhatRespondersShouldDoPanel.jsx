import React, { useState } from 'react'
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Hospital,
  Home,
  Navigation,
  Droplets,
  Users,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export default function WhatRespondersShouldDoPanel({
  scenario = 'CRITICAL_OPERATION',
  onSelectAction,
}) {
  const [expandedId, setExpandedId] = useState('ACT-01')

  const topDirectives = [
    {
      id: 'ACT-01',
      rank: 1,
      priority: 98,
      urgency: 'IMMEDIATE',
      title: 'EVACUATE 2,600 VULNERABLE RESIDENTS',
      destination: 'SH-02 (1,060) • SH-03 (900) • SH-05 (640)',
      resources: 'RU-02 (Boat), RU-03 (Ambulance), Rescue Squads',
      summary: 'Multi-shelter balanced transfer of Batch 1 (530 mobility-limited) and Batch 2 (2,070 elderly/children).',
      whyBreakdown: [
        { factor: 'Vulnerable Population Exposure', points: '+26', reason: '2,600 identified in low-lying floodplain zone.' },
        { factor: 'Critical Demographics', points: '+18', reason: '530 mobility-limited and 1,150 elderly need specialized low-floor transport.' },
        { factor: 'Flood Peak Inundation', points: '+17', reason: 'Water depth exceeds 1.8m in Aska low-lying sector.' },
        { factor: 'Arterial Road Blockage', points: '+12', reason: 'SH-36 cut off; requires swift transfer before secondary roads submerge.' },
        { factor: 'Active Life-Safety SOS', points: '+8', reason: 'SOS-003 stranded family with newborn requires boat extraction.' },
      ],
      icon: Users,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'ACT-02',
      rank: 2,
      priority: 91,
      urgency: 'URGENT',
      title: 'PROTECT ASKA HOSPITAL ACCESS CORRIDOR',
      destination: 'Aska Sub-Divisional Hospital High-Ground Perimeter',
      resources: 'RU-03 (EMS) + MKCG Mobile Trauma Team',
      summary: 'Secure alternate amphibian corridor as SH-36 approach road reaches 1.8m inundation.',
      whyBreakdown: [
        { factor: 'Critical Healthcare Lifeline', points: '+24', reason: 'Only regional surgical & maternal facility for 180,000 catchment.' },
        { factor: 'Access Risk Escalation', points: '+20', reason: 'Access risk calculated at 88/100 due to flooded approach.' },
        { factor: 'Patient Evacuation Readiness', points: '+15', reason: '12 high-dependency ICU patients require emergency generator & oxygen.' },
        { factor: 'Corridor Redundancy', points: '+12', reason: 'Direct corridor blocked; alternate NH bypass secured with +1.5 km detour.' },
      ],
      icon: Hospital,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
    {
      id: 'ACT-03',
      rank: 3,
      priority: 89,
      urgency: 'URGENT',
      title: 'ENFORCE CLOSURE OF SURGE SHELTER SH-04',
      destination: 'Redirect Evacuees to Chhatrapur SH-02 (+28m Elevation)',
      resources: 'Traffic Police & ODRAF Staging Liaison',
      summary: 'Coastal surge corridor risk reaches 92%; structural compromise prevents safe occupancy.',
      whyBreakdown: [
        { factor: 'Storm Surge Vulnerability', points: '+28', reason: 'Cyclone track model indicates 72% probability of coastal inundation.' },
        { factor: 'Structure Elevation Deficit', points: '+22', reason: 'Elevation only 4m above mean sea level vs 28m at inland SH-02.' },
        { factor: 'Approach Road Submersion', points: '+16', reason: 'Connecting coastal highway has 4 reported washouts.' },
      ],
      icon: Home,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'ACT-04',
      rank: 4,
      priority: 85,
      urgency: 'HIGH',
      title: 'ACTIVATE SAFE INLAND DETOUR AROUND SH-36',
      destination: 'Hinjilicut - Aska Inland Detour Bypass',
      resources: 'RU-05 (Fire/Clearance) & Highway Patrol',
      summary: 'Divert all relief and ambulance traffic away from blocked SH-36 (+1.5 km, +14 min travel time).',
      whyBreakdown: [
        { factor: 'Demonstrated Road Failure', points: '+25', reason: 'Ground photo E-003 and citizen telemetry confirm impassable depth.' },
        { factor: 'Zero-Risk Alternative', points: '+20', reason: 'Bypass maintains elevation above 18m with zero flood reports.' },
        { factor: 'Transit Reliability', points: '+14', reason: 'Guarantees continuous heavy supply convoys.' },
      ],
      icon: Navigation,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
    {
      id: 'ACT-05',
      rank: 5,
      priority: 82,
      urgency: 'HIGH',
      title: 'PRE-POSITION WATER & MEDICAL KITS AT SH-02',
      destination: 'Chhatrapur Relief Shelter SH-02 Logistics Depot',
      resources: 'RES-TANK-01 (5,000L Water) + Cargo Truck RU-04',
      summary: 'Ensure 2L/person/day potable supply and 52 trauma kits before arrival of Batch 1 evacuees.',
      whyBreakdown: [
        { factor: 'Humanitarian Reserve Standard', points: '+22', reason: 'Modelled operational consumption quota of 2 Liters/person/day.' },
        { factor: 'High Reception Density', points: '+18', reason: 'SH-02 is primary shelter receiving 1,060 residents.' },
        { factor: 'Advance Cutoff Mitigation', points: '+16', reason: 'Pre-positioning avoids hazardous transport once cyclone makes landfall.' },
      ],
      icon: Droplets,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  ]

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              WHAT SHOULD RESPONDERS DO NOW?
            </h3>
            <p className="text-xs text-slate-400">
              Top 5 prioritized, explainable operational directives derived from multi-hazard priority logic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            DETERMINISTIC DECISION-SUPPORT
          </span>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            SCENARIO: {scenario}
          </span>
        </div>
      </div>

      {/* Directives List */}
      <div className="space-y-3">
        {topDirectives.map((item) => {
          const isExpanded = expandedId === item.id
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-950/90 border-cyan-500/50 shadow-lg ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Directive Header Row */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-black text-xs text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                        {item.urgency} (P-{item.priority})
                      </span>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold hidden md:inline">
                    {isExpanded ? 'Hide WHY?' : 'Explain WHY?'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expandable "WHY?" Explanation Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3 text-xs bg-slate-900/40 rounded-b-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold block">Assigned / Pre-positioned Resources:</span>
                      <strong className="text-cyan-300 font-mono block">{item.resources}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold block">Target Destination / Corridor:</span>
                      <strong className="text-emerald-300 font-mono block">{item.destination}</strong>
                    </div>
                  </div>

                  {/* Mathematical Why Score Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <span>🔍</span> WHY THIS ORDER & PRIORITY? (Mathematical Score Decomposition)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Total: {item.priority}/100</span>
                    </div>

                    <div className="space-y-1">
                      {item.whyBreakdown.map((wb, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <strong className="text-slate-200">{wb.factor}:</strong>
                            <span className="text-slate-400">{wb.reason}</span>
                          </div>
                          <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                            {wb.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
