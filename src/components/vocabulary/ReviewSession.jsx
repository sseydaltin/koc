import React, { useEffect, useState } from 'react'
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useApp } from '../../context/AppContext'
import { isDueForReview, processAnswer } from '../../lib/srs'
import FlipCard from './FlipCard'

export default function ReviewSession({ onBack }) {
  const { state } = useApp()
  const [words, setWords] = useState([])
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDue() {
      const ref = collection(db, 'users', state.user.uid, 'vocabulary')
      const snap = await getDocs(ref)
      const due = []
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() }
        if (isDueForReview(data.next_review)) due.push(data)
      })
      setWords(due)
      setLoading(false)
    }
    loadDue()
  }, [state.user])

  async function handleAnswer(isCorrect) {
    const word = words[index]
    const { box, next_review } = processAnswer(word.box, isCorrect)
    const wordRef = doc(db, 'users', state.user.uid, 'vocabulary', word.id)
    await updateDoc(wordRef, {
      box,
      next_review,
      times_correct: (word.times_correct ?? 0) + (isCorrect ? 1 : 0),
      times_wrong:   (word.times_wrong  ?? 0) + (isCorrect ? 0 : 1),
    })
    setStats(s => ({ ...s, correct: s.correct + (isCorrect ? 1 : 0), wrong: s.wrong + (isCorrect ? 0 : 1) }))
    if (index + 1 >= words.length) setDone(true)
    else setIndex(i => i + 1)
  }

  if (loading) return <LoadingView />

  if (words.length === 0) return (
    <div className="px-4 py-6">
      <BackButton onClick={onBack} />
      <div className="card text-center mt-6 py-10">
        <p className="text-4xl mb-3">✅</p>
        <h2 className="text-lg font-bold">No words due!</h2>
        <p className="text-sm text-gray-500 mt-1">All caught up. Come back later.</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="px-4 py-6">
      <BackButton onClick={onBack} />
      <div className="card text-center mt-6 py-10">
        <p className="text-4xl mb-3">🎉</p>
        <h2 className="text-lg font-bold">Session Complete!</h2>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success-500">{stats.correct}</p>
            <p className="text-xs text-gray-500">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-500">{stats.wrong}</p>
            <p className="text-xs text-gray-500">Wrong</p>
          </div>
        </div>
        <button onClick={onBack} className="btn-primary mt-6">Back to Vocabulary</button>
      </div>
    </div>
  )

  const current = words[index]
  return (
    <div className="px-4 py-6 flex flex-col h-screen">
      <div className="flex items-center justify-between mb-4">
        <BackButton onClick={onBack} />
        <span className="text-sm font-semibold text-gray-500">{index + 1} / {words.length}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((index) / words.length) * 100}%` }}
        />
      </div>
      <div className="flex-1">
        <FlipCard
          key={current.id}
          word={current}
          onCorrect={() => handleAnswer(true)}
          onWrong={() => handleAnswer(false)}
        />
      </div>
    </div>
  )
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="text-sm text-primary-600 font-medium flex items-center gap-1">
      ← Back
    </button>
  )
}

function LoadingView() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading words...</p>
      </div>
    </div>
  )
}
