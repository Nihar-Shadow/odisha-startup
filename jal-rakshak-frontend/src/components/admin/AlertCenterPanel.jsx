import React, { useState } from 'react'
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Navigation,
  Home,
  Hospital,
  LifeBuoy,
  FileCheck2,
  Filter,
} from 'lucide-react'

export default function AlertCenterPanel({ scenario = 'CRITICAL_OPERATION' }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  const alerts = [
    {
      id: 'ALT-01',
      category: 'CRITICAL',
      title: 'SOS-003 Requires Immediate Water Rescue',
      details: 'Priority 98 • Assigned Unit: RU-02 (Aska Boat Unit) • 16 trapped individuals in low-lying floodplain sector.',
      timestamp: 'T+140 min',
      urgency: 'CRITICAL',
      icon: ShieldAlert,
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'ALT-02',
      category: 'ROUTE',
      title: 'SH-36 Classified BLOCKED',
      details: 'State Highway 36 flooded (depth > 1.8m). Safe detour via inland Hinjilicut bypass (+1.5 km, +14 min travel time).',
      timestamp: 'T+120 min',
      urgency: 'WARNING',
      icon: Navigation,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'ALT-03',
      category: 'SHELTER',
      title: 'Shelter SH-04 Rejected Due to Storm Surge Risk',
      details: 'Coastal surge exposure risk at 92%. Evacuees diverted to safe elevated Shelter SH-02 (+28m elevation).',
      timestamp: 'T+80 min',
      urgency: 'WARNING',
      icon: Home,
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      id: 'ALT-04',
      category: 'INFRASTRUCTURE',
      title: 'Aska Hospital Access Risk: 88 (CRITICAL)',
      details: 'Approach road waterlogged. RU-03 ambulance and mobile trauma team pre-staged along alternate corridor.',
      timestamp: 'T+80 min',
      urgency: 'CRITICAL',
      icon: Hospital,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'ALT-05',
      category: 'RESOURCE',
      title: 'RU-02 Preempted for Life-Safety Rescue',
      details: 'RU-02 reassigned from low-priority supply delivery (P-62) to life-safety water rescue (P-98). Supply delivery delayed.',
      timestamp: 'T+140 min',
      urgency: 'INFO',
      icon: LifeBuoy,
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'ALT-06',
      category: 'EVIDENCE',
      title: 'Satellite SAR Extent Corroborates Citizen Reports',
      details: 'Copernicus Sentinel-1 SAR confirms 57 km² inundation with 82% spatial overlap against verified ground photos.',
      timestamp: 'T+40 min',
      urgency: 'INFO',
      icon: FileCheck2,
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
  ]

  const categories = ['ALL', 'CRITICAL', 'ROUTE', 'SHELTER', 'INFRASTRUCTURE', 'RESOURCE', 'EVIDENCE']

  const filteredAlerts = selectedFilter === 'ALL'
    ? alerts
    : alerts.filter((a) => a.category === selectedFilter)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Operational Alert & Communication Center
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
            {filteredAlerts.length} Active Alerts
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
          DECISION-SUPPORT ALERTS • NOT OFFICIAL BROADCAST
        </span>
      </div>

      {/* Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono font-bold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 ${
              selectedFilter === cat
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts Stream */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredAlerts.map((alert) => {
          const Icon = alert.icon

          return (
            <div
              key={alert.id}
              className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3 text-xs hover:border-slate-700 transition"
            >
              <div className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${alert.badgeClass}`}>
                      {alert.category}
                    </span>
                    <strong className="text-white font-bold text-xs">{alert.title}</strong>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{alert.details}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
