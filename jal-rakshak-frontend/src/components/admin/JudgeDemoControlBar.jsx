import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Gauge,
} from 'lucide-react'

import { DEMO_STAGES } from '../../domain/canonicalState.js'
export { DEMO_STAGES }


export default function JudgeDemoControlBar({
  currentScenario,
  onScenarioChange,
  onStageChange,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [speed, setSpeed] = useState(2) // 1x, 2x, 4x (default 2x for quick judge demo)
  const timerRef = useRef(null)

  const activeStage = DEMO_STAGES[currentStepIndex] || DEMO_STAGES[0]

  // Base duration per step in ms at 1x speed (e.g. 12,000ms per step = 2 minutes total)
  const baseStepDurationMs = 10000

  const handleStepJump = useCallback((index) => {
    const targetIdx = Math.max(0, Math.min(DEMO_STAGES.length - 1, index))
    setCurrentStepIndex(targetIdx)
    const targetStage = DEMO_STAGES[targetIdx]
    if (targetStage) {
      if (onScenarioChange && targetStage.scenario !== currentScenario) {
        onScenarioChange(targetStage.scenario)
      }
      if (onStageChange) {
        onStageChange(targetStage)
      }
    }
  }, [currentScenario, onScenarioChange, onStageChange])

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const intervalTime = Math.max(1500, Math.round(baseStepDurationMs / speed))
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= DEMO_STAGES.length - 1) {
          setIsPlaying(false)
          return prev
        }
        const next = prev + 1
        const stage = DEMO_STAGES[next]
        if (stage) {
          onScenarioChange?.(stage.scenario)
          onStageChange?.(stage)
        }
        return next
      })
    }, intervalTime)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, speed, onScenarioChange, onStageChange])

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (currentStepIndex >= DEMO_STAGES.length - 1) {
        handleStepJump(0)
      }
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)
    handleStepJump(0)
  }

  const handleSkipNext = () => {
    handleStepJump(currentStepIndex + 1)
  }

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 shadow-2xl space-y-3.5">
      {/* Top Bar: Title, Active Time, Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                3-Minute Interactive Judge Demo Mode
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold">
                DETECT → VERIFY → UNDERSTAND → PRIORITIZE → ALLOCATE → ACT → REALLOCATE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic, explainable disaster intelligence loop for Ganjam, Odisha
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-mono font-bold text-slate-400">
            <span className="px-1.5 text-slate-500">Speed:</span>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg transition ${
                  speed === s
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : currentStepIndex === 0 ? 'START DEMO' : 'RESUME'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
            title="Reset to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Skip Step */}
          <button
            onClick={handleSkipNext}
            disabled={currentStepIndex >= DEMO_STAGES.length - 1}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Next Step"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Timeline Steps Scrubber */}
      <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5">
        {DEMO_STAGES.map((stg, idx) => {
          const isActive = idx === currentStepIndex
          const isPast = idx < currentStepIndex
          return (
            <button
              key={stg.step}
              onClick={() => handleStepJump(idx)}
              className={`p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/30 text-white shadow-lg'
                  : isPast
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-cyan-300' : isPast ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {stg.time}
                </span>
                {isPast ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                )}
              </div>
              <div className="text-[10px] font-bold line-clamp-1 mt-1">
                {stg.title}
              </div>
            </button>
          )
        })}
      </div>

      {/* Current Step Operational Explainer Card */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              STAGE {activeStage.step}/10 • {activeStage.time}
            </span>
            <span className="font-bold text-white text-sm">
              {activeStage.title}
            </span>
            <span className="text-[10px] font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/60 font-bold">
              CANONICAL RISK: {activeStage.risk}%
            </span>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60 font-bold">
              RESPONSE PRIORITY: {activeStage.priority}
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {activeStage.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Scenario: {activeStage.scenario}
          </span>
        </div>
      </div>
    </div>
  )
}
