import React from 'react'
import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'home',        label: 'Home',      icon: '🏠' },
  { id: 'coach',       label: 'Coach',     icon: '💬' },
  { id: 'video',       label: 'Videos',    icon: '📺' },
  { id: 'vocabulary',  label: 'Vocab',     icon: '📚' },
  { id: 'translation', label: 'Translate', icon: '✍️' },
]

export default function BottomNav() {
  const { state, dispatch } = useApp()
  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
      <div className="flex justify-around items-center px-2 py-1.5">
        {TABS.map(tab => {
          const isActive = state.activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all duration-300 relative
                ${isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {isActive && (
                <div className="absolute inset-x-1 inset-y-1 bg-primary-50 rounded-2xl animate-fade-in" />
              )}
              <span className={`text-[22px] z-10 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-bold z-10 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
