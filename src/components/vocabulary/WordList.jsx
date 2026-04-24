import React, { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useApp } from '../../context/AppContext'

const BOX_COLORS = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-green-100 text-green-700',
  5: 'bg-blue-100 text-blue-700',
}

export default function WordList({ onBack }) {
  const { state } = useApp()
  const [words, setWords] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'users', state.user.uid, 'vocabulary'))
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setWords(all.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0)))
      setLoading(false)
    }
    load()
  }, [state.user])

  const topics = ['all', ...new Set(words.map(w => w.topic).filter(Boolean))]
  const filtered = filter === 'all' ? words : words.filter(w => w.topic === filter)

  async function handleDelete(id) {
    if (!confirm('Delete this word?')) return
    await deleteDoc(doc(db, 'users', state.user.uid, 'vocabulary', id))
    setWords(words.filter(w => w.id !== id))
  }

  return (
    <div className="px-4 py-6">
      <button onClick={onBack} className="text-sm text-primary-600 font-medium flex items-center gap-1 mb-4">
        ← Back
      </button>
      <h2 className="text-xl font-bold mb-4">📋 Word List</h2>

      {/* Topic filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {topics.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${filter === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t === 'all' ? `All (${words.length})` : t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No words yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(word => (
            <div key={word.id} className="card flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{word.word}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${BOX_COLORS[word.box] ?? BOX_COLORS[1]}`}>
                    B{word.box}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{word.meaning_tr}</p>
              </div>
              <button
                onClick={() => handleDelete(word.id)}
                className="text-gray-300 active:text-danger-500 transition-colors p-1 shrink-0"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
