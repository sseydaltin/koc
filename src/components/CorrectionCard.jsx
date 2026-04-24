import React from 'react'

export default function CorrectionCard({ correction }) {
  return (
    <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 rounded-2xl px-4 py-3 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="line-through text-slate-400 font-medium">{correction.original}</span>
        <span className="text-slate-300">→</span>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">{correction.corrected}</span>
      </div>
      {correction.rule && (
        <p className="text-amber-700/80 text-[11px] italic mt-2 font-medium leading-relaxed">{correction.rule}</p>
      )}
    </div>
  )
}
