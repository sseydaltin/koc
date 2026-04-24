import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useApp } from '../../context/AppContext'
import { generateTranslationPair, evaluateTranslation } from '../../lib/gemini'

const TOPICS = ['daily life', 'travel', 'work', 'food', 'weather', 'shopping', 'health', 'family']

const SCORE_COLOR = score =>
  score >= 8 ? 'text-success-500' : score >= 5 ? 'text-yellow-500' : 'text-danger-500'

export default function TranslationScreen() {
  const { state } = useApp()
  const [direction, setDirection] = useState('tr-en') // tr-en | en-tr
  const [topic, setTopic] = useState('daily life')
  const [phase, setPhase] = useState('idle') // idle | loading | answer | feedback | done
  const [pair, setPair] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [error, setError] = useState('')

  async function startNew() {
    setPhase('loading')
    setError('')
    setPair(null)
    setUserAnswer('')
    setFeedback(null)
    try {
      const result = await generateTranslationPair(topic)
      setPair(result)
      setPhase('answer')
    } catch (e) {
      setError('Failed to generate sentence. Check your API key.')
      setPhase('idle')
    }
  }

  async function handleSubmit() {
    if (!userAnswer.trim() || !pair) return
    setPhase('loading')
    try {
      const sourceLang = direction === 'tr-en' ? 'Turkish' : 'English'
      const targetLang = direction === 'tr-en' ? 'English' : 'Turkish'
      const originalSentence = direction === 'tr-en' ? pair.turkish : pair.english
      const expectedTranslation = direction === 'tr-en' ? pair.english : pair.turkish

      const result = await evaluateTranslation(sourceLang, targetLang, originalSentence, expectedTranslation, userAnswer.trim())
      setFeedback(result)
      // Save to Firestore
      await addDoc(collection(db, 'users', state.user.uid, 'translation_sessions'), {
        original_en: pair.english,
        original_tr: pair.turkish,
        user_answer: userAnswer.trim(),
        direction,
        ai_feedback: result,
        level: 'A2',
        topic,
        created_at: serverTimestamp(),
      })
      setSessionCount(c => c + 1)
      setPhase('feedback')
    } catch (e) {
      setError('Evaluation failed. Try again.')
      setPhase('answer')
    }
  }

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">✍️ Translation Practice</h1>
      <p className="text-sm font-medium text-slate-400 mb-6">Dual-way translation · AI-powered feedback</p>

      {/* Settings */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="label">Direction</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setDirection('tr-en'); if (phase !== 'loading') setPhase('idle'); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm
                ${direction === 'tr-en' ? 'bg-primary-600 text-white ring-2 ring-primary-500 ring-offset-1' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              🇹🇷 Turkish → 🇬🇧 English
            </button>
            <button
              onClick={() => { setDirection('en-tr'); if (phase !== 'loading') setPhase('idle'); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 shadow-sm
                ${direction === 'en-tr' ? 'bg-primary-600 text-white ring-2 ring-primary-500 ring-offset-1' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              🇬🇧 English → 🇹🇷 Turkish
            </button>
          </div>
        </div>
        
        <div>
          <label className="label">Topic</label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors
                  ${topic === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {phase === 'idle' && (
        <div className="card text-center py-10 shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-sm text-gray-500 mb-5 font-medium">
            Generate a sentence and translate it to {direction === 'tr-en' ? 'English' : 'Turkish'}
          </p>
          <button onClick={startNew} className="btn-primary px-8 py-3 text-sm font-bold">Start Practice</button>
        </div>
      )}

      {phase === 'loading' && (
        <div className="card flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">AI is thinking...</p>
          </div>
        </div>
      )}

      {phase === 'answer' && pair && (
        <div className="space-y-4">
          <div className="card bg-white shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Translate this to {direction === 'tr-en' ? 'English' : 'Turkish'}:
            </p>
            <p className="text-xl font-bold text-gray-900 leading-snug">
              {direction === 'tr-en' ? pair.turkish : pair.english}
            </p>
          </div>
          <div>
            <label className="label">Your {direction === 'tr-en' ? 'English' : 'Turkish'} Translation</label>
            <textarea
              className="input resize-none h-28 text-base shadow-inner focus:ring-2 focus:ring-primary-500"
              placeholder="Write your translation here..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-danger-500 text-sm font-medium">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="btn-primary w-full py-3.5 text-base font-bold shadow-md"
          >
            Submit Answer
          </button>
        </div>
      )}

      {phase === 'feedback' && feedback && pair && (
        <div className="space-y-4 animate-fade-in">
          {/* Score */}
          <div className="card text-center border-t-4 border-t-primary-500 shadow-sm">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Score</p>
            <p className={`text-6xl font-black tracking-tight ${SCORE_COLOR(feedback.score)}`}>
              {feedback.score}<span className="text-2xl text-gray-300 font-bold">/10</span>
            </p>
            <p className={`text-sm font-bold mt-2 px-3 py-1 rounded-full inline-block ${feedback.is_acceptable ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
              {feedback.is_acceptable ? '✓ Acceptable answer' : '✗ Needs improvement'}
            </p>
          </div>

          {/* Original vs Yours vs Corrected */}
          <div className="card space-y-3 shadow-sm border border-gray-100">
            <Row label={direction === 'tr-en' ? 'Turkish' : 'English'} text={direction === 'tr-en' ? pair.turkish : pair.english} />
            <Row label="Your answer" text={userAnswer} highlight={feedback.is_acceptable ? 'green' : 'red'} />
            <Row label="Best version" text={feedback.corrected} highlight="blue" />
          </div>

          {/* Mistakes */}
          {feedback.mistakes?.length > 0 && (
            <div className="card shadow-sm border border-danger-100 bg-danger-50/30">
              <p className="text-xs font-bold text-danger-700 uppercase tracking-wider mb-3">Mistakes to Fix</p>
              <ul className="space-y-2">
                {feedback.mistakes.map((m, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2.5 items-start font-medium">
                    <span className="text-danger-500 shrink-0 mt-0.5 text-lg leading-none">•</span> 
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          {feedback.explanation && (
            <div className="card bg-success-50/50 border-success-100 shadow-sm">
              <p className="text-sm text-gray-800 italic font-medium">💡 {feedback.explanation}</p>
            </div>
          )}

          {error && <p className="text-danger-500 text-sm font-medium">{error}</p>}
          <button onClick={startNew} className="btn-primary w-full py-4 text-base font-bold shadow-md mt-2">
            Next Sentence →
          </button>
          <p className="text-center text-xs font-medium text-gray-400 mt-4">Sessions today: {sessionCount}</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, text, highlight }) {
  const bg = highlight === 'green' ? 'bg-success-50 text-success-900 border border-success-100'
           : highlight === 'red'   ? 'bg-danger-50 text-danger-900 border border-danger-100'
           : highlight === 'blue'  ? 'bg-blue-50 text-blue-900 border border-blue-100'
           : 'bg-gray-50 text-gray-800 border border-gray-100'
  return (
    <div>
      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-[15px] font-medium rounded-xl px-3.5 py-2.5 shadow-sm ${bg}`}>{text}</p>
    </div>
  )
}
