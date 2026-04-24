import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useApp } from '../../context/AppContext'
import { enrichWord } from '../../lib/gemini'
import { getNextReview } from '../../lib/srs'

const TOPICS = ['daily', 'work', 'travel', 'food', 'technology', 'health', 'education', 'other']

export default function AddWord({ onBack }) {
  const { state } = useApp()
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [topic, setTopic] = useState('daily')
  const [enriched, setEnriched] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleEnrich() {
    if (!word.trim()) return
    setAiLoading(true)
    setError('')
    try {
      const result = await enrichWord(word.trim())
      setEnriched(result)
    } catch (e) {
      setError('AI enrichment failed. You can still save manually.')
    }
    setAiLoading(false)
  }

  async function handleSave() {
    if (!word.trim() || !meaning.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'users', state.user.uid, 'vocabulary'), {
        word: word.trim().toLowerCase(),
        meaning_tr: meaning.trim(),
        example: enriched?.example ?? '',
        context_sentence: enriched?.context ?? '',
        collocations: enriched?.collocations ?? [],
        tip: enriched?.tip ?? '',
        topic,
        box: 1,
        next_review: getNextReview(1),
        times_correct: 0,
        times_wrong: 0,
        created_at: serverTimestamp(),
      })
      setSaved(true)
      // Reset form
      setWord(''); setMeaning(''); setEnriched(null); setSaved(false)
    } catch (e) {
      setError('Failed to save word.')
    }
    setSaving(false)
  }

  return (
    <div className="px-4 py-6">
      <button onClick={onBack} className="text-sm text-primary-600 font-medium flex items-center gap-1 mb-6">
        ← Back
      </button>
      <h2 className="text-xl font-bold mb-5">➕ Add New Word</h2>

      <div className="space-y-4">
        <div>
          <label className="label">English Word</label>
          <input
            className="input"
            placeholder="e.g. ambitious"
            value={word}
            onChange={e => { setWord(e.target.value); setEnriched(null) }}
          />
        </div>

        <div>
          <label className="label">Turkish Meaning</label>
          <input
            className="input"
            placeholder="e.g. hırslı, çok istekli"
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Topic</label>
          <select className="input bg-white" value={topic} onChange={e => setTopic(e.target.value)}>
            {TOPICS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        {word.trim() && !enriched && (
          <button onClick={handleEnrich} disabled={aiLoading} className="btn-secondary w-full">
            {aiLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Asking AI...
              </span>
            ) : '✨ Enrich with AI Examples'}
          </button>
        )}

        {enriched && (
          <div className="card bg-blue-50 border-blue-100 space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Enrichment</p>
            <p className="text-sm"><span className="font-medium">Example:</span> {enriched.example}</p>
            <p className="text-sm"><span className="font-medium">Context:</span> {enriched.context}</p>
            {enriched.tip && (
              <p className="text-sm"><span className="font-medium">Tip:</span> {enriched.tip}</p>
            )}
            {enriched.collocations?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {enriched.collocations.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{c}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-danger-500 text-sm">{error}</p>}
        {saved && <p className="text-success-500 text-sm font-medium">✓ Word saved to Box 1!</p>}

        <button
          onClick={handleSave}
          disabled={!word.trim() || !meaning.trim() || saving}
          className="btn-primary w-full py-4"
        >
          {saving ? 'Saving...' : 'Save Word'}
        </button>
      </div>
    </div>
  )
}
