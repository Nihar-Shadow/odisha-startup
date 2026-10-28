import React, { useState } from 'react'
import {
  FileCheck2,
  Image as ImageIcon,
  Flame,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Home,
  Check,
  X,
  Layers,
} from 'lucide-react'
import { EvidenceType, EvidenceVerificationStatus, SeverityLevel } from '../../domain/contracts'

export default function CitizenEvidencePanel({
  evidenceList = [],
  evidenceScenario = 'BASELINE',
  onScenarioChange,
  verifiedCount = 5,
  activeCount = 8,
  highSeverityCount = 2,
  criticalSosCount = 1,
  evidenceRiskContribution = 0,
  blockedRoads = [],
  impactedShelters = [],
  onSelectEvidence = null,
}) {
  const [filterType, setFilterType] = useState('ALL')
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredEvidence = evidenceList.filter((item) => {
    if (filterType === 'ALL') return true
    if (filterType === 'VERIFIED') return item.verificationStatus === EvidenceVerificationStatus.VERIFIED
    if (filterType === 'SOS') return item.type === EvidenceType.SOS
    if (filterType === 'IMAGE') return item.type === EvidenceType.IMAGE || Boolean(item.imageUrl)
    if (filterType === 'ROADS') return item.type === EvidenceType.ROAD_BLOCKAGE || Boolean(item.affectedRoad)
    return true
  })

  const getTypeBadge = (type) => {
    switch (type) {
      case EvidenceType.IMAGE:
        return { label: 'IMAGE', icon: ImageIcon, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
      case EvidenceType.SOS:
        return { label: 'SOS BEACON', icon: Flame, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
      case EvidenceType.ROAD_BLOCKAGE:
        return { label: 'ROAD BLOCKAGE', icon: AlertOctagon, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
      case EvidenceType.SHELTER_REPORT:
        return { label: 'SHELTER REPORT', icon: Home, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
      case EvidenceType.FLOOD_REPORT:
      default:
        return { label: 'FLOOD REPORT', icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' }
    }
  }

  const getSeverityPill = (severity) => {
    switch (severity) {
      case SeverityLevel.CRITICAL:
        return 'text-red-400 bg-red-500/20 border-red-500/40'
      case SeverityLevel.HIGH:
        return 'text-orange-400 bg-orange-500/20 border-orange-500/40'
      case SeverityLevel.MODERATE:
      case SeverityLevel.MEDIUM:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40'
      case SeverityLevel.LOW:
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
    }
  }

  const getStatusPill = (status) => {
    switch (status) {
      case EvidenceVerificationStatus.VERIFIED:
        return {
          label: 'VERIFIED',
          classes: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
          icon: CheckCircle2,
        }
      case EvidenceVerificationStatus.PROCESSING:
        return {
          label: 'PROCESSING',
          classes: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
          icon: Clock,
        }
      case EvidenceVerificationStatus.REJECTED:
        return {
          label: 'REJECTED',
          classes: 'text-slate-400 bg-slate-800 border-slate-700',
          icon: X,
        }
      case EvidenceVerificationStatus.UNVERIFIED:
      default:
        return {
          label: 'UNVERIFIED',
          classes: 'text-slate-400 bg-slate-800/80 border-slate-700',
          icon: Clock,
        }
    }
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Panel Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white tracking-wide uppercase">
                Citizen Intelligence + Ground Evidence
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                PHASE 4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multimodal field evidence triage • AI-assisted verification • Localized risk fusion
            </p>
          </div>
        </div>

        {evidenceRiskContribution > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/40 text-right shrink-0">
            <div className="text-[10px] uppercase font-bold text-red-400">Ground Evidence Delta</div>
            <div className="text-sm font-black text-white font-mono">+{evidenceRiskContribution}% Risk</div>
          </div>
        )}
      </div>

      {/* Deterministic Judge / Developer Scenario Controls */}
      <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ground Evidence Demo Scenarios</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Current: <strong className="text-cyan-400">{evidenceScenario}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onScenarioChange?.('BASELINE')}
            className={`py-2 px-3 rounded-xl border text-xs text-left transition ${
              evidenceScenario === 'BASELINE'
                ? 'bg-slate-800 text-white border-slate-600 shadow-md font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold">1. BASELINE</div>
            <div className="text-[10px] text-slate-400 mt-0.5">0 Verified reports (Risk: 60)</div>
          </button>

          <button
            type="button"
            onClick={() => onScenarioChange?.('GROUND_EVIDENCE')}
            className={`py-2 px-3 rounded-xl border text-xs text-left transition ${
              evidenceScenario === 'GROUND_EVIDENCE'
                ? 'bg-orange-950/70 text-orange-200 border-orange-500/60 shadow-md font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold text-orange-400">2. GROUND EVIDENCE</div>
            <div className="text-[10px] text-slate-400 mt-0.5">2 Verified + Image (+14 Risk &rarr; 74)</div>
          </button>

          <button
            type="button"
            onClick={() => onScenarioChange?.('CRITICAL_INCIDENT')}
            className={`py-2 px-3 rounded-xl border text-xs text-left transition ${
              evidenceScenario === 'CRITICAL_INCIDENT'
                ? 'bg-red-950/80 text-red-200 border-red-500/70 shadow-md font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold text-red-400">3. CRITICAL INCIDENT</div>
            <div className="text-[10px] text-slate-400 mt-0.5">SOS + Road Blocked (+22 Risk &rarr; 82)</div>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Reports</div>
            <strong className="text-white text-xs">{activeCount} Reports</strong>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Ground Truth</div>
            <strong className="text-emerald-400 text-xs">{verifiedCount} Verified</strong>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">High Severity</div>
            <strong className="text-orange-400 text-xs">{highSeverityCount} High</strong>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Critical SOS</div>
            <strong className="text-rose-400 text-xs">{criticalSosCount} SOS Beacon</strong>
          </div>
        </div>
      </div>

      {/* Operational Impact Banners (Roads & Shelters) */}
      {(blockedRoads.length > 0 || impactedShelters.length > 0) && (
        <div className="space-y-1.5">
          {blockedRoads.map((road, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/50 flex items-center justify-between text-xs text-amber-200"
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>ROAD STATUS:</strong> {road.roadName} — <span className="font-mono uppercase font-black">{road.status}</span> (Source: Citizen Evidence)
                </span>
              </div>
              <span className="text-[10px] font-mono bg-amber-900/60 px-2 py-0.5 rounded text-amber-300 border border-amber-700/60">
                Confidence {Math.round(road.confidence * 100)}%
              </span>
            </div>
          ))}

          {impactedShelters.map((sh, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-600/50 flex items-center justify-between text-xs text-purple-200"
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>SHELTER AT RISK:</strong> {sh.shelterName} ({sh.shelterId}) — Perimeter flooded
                </span>
              </div>
              <span className="text-[10px] font-mono bg-purple-900/60 px-2 py-0.5 rounded text-purple-300 border border-purple-700/60">
                Confidence {Math.round(sh.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Feed Filters */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Latest Ground Evidence Feed ({filteredEvidence.length})</span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {['ALL', 'VERIFIED', 'IMAGE', 'SOS', 'ROADS'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition ${
                filterType === tab
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ground Evidence List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredEvidence.map((item) => {
          const typeBadge = getTypeBadge(item.type)
          const TypeIcon = typeBadge.icon
          const statusBadge = getStatusPill(item.verificationStatus)
          const StatusIcon = statusBadge.icon
          const isSelected = selectedItem?.id === item.id

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(isSelected ? null : item)
                if (onSelectEvidence) onSelectEvidence(item)
              }}
              className={`p-3 rounded-2xl border transition cursor-pointer text-xs space-y-2 ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${typeBadge.color}`}>
                    <TypeIcon className="w-3 h-3" />
                    <span>{typeBadge.label}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getSeverityPill(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${statusBadge.classes}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    <span>{statusBadge.label}</span>
                  </span>

                  {item.riskContribution > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-red-500/20 text-red-300 border border-red-500/30">
                      +{item.riskContribution} Risk
                    </span>
                  )}
                </div>
              </div>

              {/* Description & Location */}
              <div>
                <p className="text-slate-200 font-medium leading-relaxed">
                  "{item.description}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{item.location?.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Confidence: <strong className="text-slate-300">{Math.round(item.confidence * 100)}%</strong>
                  </span>
                </div>
              </div>

              {/* Expandable Evidence Details */}
              {isSelected && (
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-300 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-500 block">EVIDENCE ID:</span>
                      <span className="text-white font-bold">{item.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">SOURCE:</span>
                      <span className="text-cyan-400 font-bold">{item.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">COORDINATES:</span>
                      <span className="text-slate-300">
                        {item.location?.lat.toFixed(4)}°N, {item.location?.lng.toFixed(4)}°E
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">NEAREST ZONE:</span>
                      <span className="text-amber-400">{item.metadata?.nearestZoneId || 'ZONE-GANJAM-01'}</span>
                    </div>
                  </div>

                  {item.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-36">
                      <img
                        src={item.imageUrl}
                        alt="Citizen Ground Evidence"
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-cyan-300 border border-slate-700">
                        AI-Assisted Visual Triage
                      </div>
                    </div>
                  )}

                  {item.affectedRoad && (
                    <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-600/40 text-amber-200">
                      <strong>Reported Road Impact:</strong> {item.affectedRoad.roadName} — Status: <strong className="text-amber-400">{item.affectedRoad.status}</strong>
                    </div>
                  )}

                  {item.affectedShelter && (
                    <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-600/40 text-purple-200">
                      <strong>Shelter Impact:</strong> {item.affectedShelter.shelterName} ({item.affectedShelter.shelterId}) — Status: <strong className="text-purple-400">{item.affectedShelter.status}</strong>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 italic">
                    Note: Ground truth evaluation uses transparent configured decision-support weights. Not an authoritative government declaration.
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
