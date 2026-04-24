import React from 'react'
import CorrectionCard from './CorrectionCard'

export default function ChatBubble({ message }) {
  const isCoach = message.role === 'coach'
  return (
    <div className={`flex flex-col gap-2 ${isCoach ? 'items-start' : 'items-end'} animate-fade-in`}>
      <div
        className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-[14px] leading-relaxed shadow-sm
          ${isCoach
            ? 'bg-white text-slate-800 rounded-tl-lg border border-slate-100'
            : 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-lg shadow-lg shadow-blue-500/20'
          }`}
      >
        {message.content}
      </div>
      {isCoach && message.corrections?.length > 0 && (
        <div className="max-w-[95%] w-full space-y-2 mt-1 px-1">
          {message.corrections.map((c, i) => (
            <CorrectionCard key={i} correction={c} />
          ))}
        </div>
      )}
    </div>
  )
}
