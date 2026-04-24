import React, { useState } from 'react'

export default function FlipCard({ word, onCorrect, onWrong }) {
  const [flipped, setFlipped] = useState(false)
  const [phase, setPhase] = useState('question') // question | answer | example

  function handleFlip() {
    if (!flipped) { setFlipped(true); setPhase('answer') }
    else if (phase === 'answer') setPhase('example')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Card */}
      <div
        className="flex-1 card flex flex-col items-center justify-center cursor-pointer select-none min-h-52 text-center gap-3 active:opacity-90 transition-opacity"
        onClick={handleFlip}
      >
        {phase === 'question' && (
          <>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Box {word.box} · Tap to reveal</span>
            <h2 className="text-4xl font-bold text-gray-900">{word.word}</h2>
            {word.topic && (
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{word.topic}</span>
            )}
          </>
        )}

        {phase === 'answer' && (
          <>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Meaning · Tap for example</span>
            <h2 className="text-3xl font-bold text-gray-900">{word.word}</h2>
            <p className="text-xl text-primary-600 font-semibold">{word.meaning_tr}</p>
          </>
        )}

        {phase === 'example' && (
          <>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Example Sentence</span>
            <h2 className="text-2xl font-bold text-gray-900">{word.word}</h2>
            <p className="text-base text-gray-600 italic">"{word.example}"</p>
            {word.context_sentence && (
              <p className="text-sm text-gray-400 italic">"{word.context_sentence}"</p>
            )}
          </>
        )}
      </div>

      {/* Action buttons — only after flip */}
      {flipped && (
        <div className="flex gap-3 mt-4">
          <button onClick={onWrong} className="btn-danger flex-1 py-4 text-base">
            ✗ Wrong
          </button>
          <button onClick={onCorrect} className="btn-success flex-1 py-4 text-base">
            ✓ Correct
          </button>
        </div>
      )}

      {!flipped && (
        <p className="text-center text-xs text-gray-400 mt-4">Tap the card to see the meaning</p>
      )}
    </div>
  )
}
