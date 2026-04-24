import React, { useEffect, useRef, useState } from 'react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useApp } from '../context/AppContext'
import { chatWithCoach } from '../lib/gemini'
import { getTodaySession, addMessage, saveCorrections } from '../lib/coachService'
import ChatBubble from '../components/ChatBubble'

const DAILY_LIMIT = 20

export default function CoachChat() {
  const { state, dispatch } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [msgCount, setMsgCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const [recentWords, setRecentWords] = useState([])
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!state.user?.uid) return
    let cancelled = false
    async function init() {
      const [session, vocabSnap] = await Promise.all([
        getTodaySession(state.user.uid),
        getDocs(query(
          collection(db, 'users', state.user.uid, 'vocabulary'),
          orderBy('created_at', 'desc'),
          limit(10),
        )),
      ])
      if (cancelled) return

      setSessionId(session.id)
      setMsgCount(session.message_count ?? 0)
      setRecentWords(vocabSnap.docs.map(d => d.data().word))

      const loadedMessages = (session.messages ?? []).map(m => ({
        role: m.role,
        content: m.content,
        corrections: m.corrections ?? [],
      }))

      if (loadedMessages.length === 0 && (session.message_count ?? 0) < DAILY_LIMIT) {
        const words = vocabSnap.docs.map(d => d.data().word)
        setReady(false)
        const result = await sendCoachMessage(
          state.user.uid,
          session.id,
          [],
          "Hi!",
          words,
          0,
          setMessages,
          setMsgCount,
          setTyping,
          setError,
        )
        if (cancelled) return
        if (result) setReady(true)
        else setReady(true)
      } else {
        setMessages(loadedMessages)
        setReady(true)
      }
    }
    init()
    return () => { cancelled = true }
  }, [state.user?.uid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (ready && state.currentVideo && !typing && msgCount < DAILY_LIMIT) {
      const video = state.currentVideo
      dispatch({ type: 'CLEAR_VIDEO_CHAT' })

      const uiMessage = `I just watched a video called "${video.title}". Can we discuss it?`
      const aiPrompt = `I just watched a video titled "${video.title}". The summary of the video is: "${video.summary}". Please ask me 1 or 2 simple A2-level questions about this video to test my listening comprehension.`

      const userMsg = { role: 'user', content: uiMessage, corrections: [] }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setMsgCount(c => c + 1)
      
      addMessage(state.user.uid, sessionId, 'user', uiMessage).then(() => {
        sendCoachMessage(
          state.user.uid,
          sessionId,
          updatedMessages,
          aiPrompt,
          recentWords,
          msgCount + 1,
          setMessages,
          setMsgCount,
          setTyping,
          setError,
        )
      })
    }
  }, [ready, state.currentVideo, typing, msgCount, messages, sessionId, state.user?.uid])

  async function handleSend() {
    const text = input.trim()
    if (!text || typing || msgCount >= DAILY_LIMIT) return
    setInput('')

    const userMsg = { role: 'user', content: text, corrections: [] }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setMsgCount(c => c + 1)
    await addMessage(state.user.uid, sessionId, 'user', text)

    await sendCoachMessage(
      state.user.uid,
      sessionId,
      updatedMessages,
      text,
      recentWords,
      msgCount + 1,
      setMessages,
      setMsgCount,
      setTyping,
      setError,
    )
  }

  const remaining = DAILY_LIMIT - msgCount
  const limitReached = msgCount >= DAILY_LIMIT

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Starting coach session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">
            👨‍🏫
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">Coach Chat</p>
            <p className="text-[11px] text-slate-400 font-medium">AI English Practice</p>
          </div>
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
          remaining <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'
        }`}>
          {remaining}/{DAILY_LIMIT}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4"
        style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {typing && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-lg px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center animate-fade-in">
            <p className="text-xs text-red-400 bg-red-50 rounded-full inline-block px-4 py-1.5 font-medium">{error}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-4 bg-white/80 backdrop-blur-xl border-t border-slate-100">
        {limitReached ? (
          <div className="card text-center py-4">
            <p className="text-sm text-slate-500 font-medium">That's our chat for today! See you tomorrow 👋</p>
          </div>
        ) : (
          <div className="flex gap-3 items-end">
            <input
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white placeholder:text-slate-400 transition-all"
              placeholder="Write in English..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={typing}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || typing}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 active:scale-90 transition-all disabled:opacity-30 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

async function sendCoachMessage(
  uid, sessionId, currentMessages, userText, words, currentCount,
  setMessages, setMsgCount, setTyping, setError,
) {
  setTyping(true)
  setError('')
  try {
    const history = currentMessages.map(m => ({ role: m.role, content: m.content }))
    const result = await chatWithCoach(history, userText, words)
    const coachMsg = {
      role: 'coach',
      content: result.reply,
      corrections: result.corrections ?? [],
    }
    setMessages(prev => [...prev, coachMsg])
    setMsgCount(c => c + 1)
    await addMessage(uid, sessionId, 'coach', result.reply)
    await saveCorrections(uid, result.corrections)
    return result
  } catch (e) {
    console.error("CoachChat Error:", e)
    setError(
      e.message?.includes('API key not configured')
        ? 'Gemini API key not configured.'
        : `Error: ${e.message}`
    )
    return null
  } finally {
    setTyping(false)
  }
}
