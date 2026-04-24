import React, { useState } from 'react'
import ReviewSession from './ReviewSession'
import AddWord from './AddWord'
import WordList from './WordList'

export default function VocabularyScreen() {
  const [view, setView] = useState('menu')

  if (view === 'review') return <ReviewSession onBack={() => setView('menu')} />
  if (view === 'add')    return <AddWord onBack={() => setView('menu')} />
  if (view === 'list')   return <WordList onBack={() => setView('menu')} />

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">📚 Vocabulary</h1>
      <p className="text-sm font-medium text-slate-400 mb-8">Leitner Spaced Repetition System</p>

      <div className="grid gap-4">
        <ActionCard
          emoji="⏰" title="Review Due Words"
          sub="Practice words that are ready for review"
          color="from-amber-500 to-orange-600"
          onClick={() => setView('review')}
        />
        <ActionCard
          emoji="➕" title="Add New Word"
          sub="Add a word with AI-generated examples"
          color="from-emerald-500 to-teal-600"
          onClick={() => setView('add')}
        />
        <ActionCard
          emoji="📋" title="All Words"
          sub="Browse and filter your vocabulary"
          color="from-violet-500 to-purple-600"
          onClick={() => setView('list')}
        />
      </div>
    </div>
  )
}

function ActionCard({ emoji, title, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card p-0 overflow-hidden flex items-stretch group active:scale-[0.98] transition-all"
    >
      <div className={`w-16 flex items-center justify-center text-2xl bg-gradient-to-br ${color} text-white shadow-inner`}>
        {emoji}
      </div>
      <div className="flex-1 p-4 py-5 text-left">
        <p className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-primary-600 transition-colors">{title}</p>
        <p className="text-xs text-slate-400 font-medium">{sub}</p>
      </div>
      <div className="flex items-center px-4 text-slate-200 group-hover:text-primary-300 transition-colors">
        <span className="text-xl font-light">→</span>
      </div>
    </button>
  )
}
