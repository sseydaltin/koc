import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import { useApp } from '../context/AppContext'
import { getDailyGreeting } from '../lib/gemini'

const ACTION_LABEL = { review: '▶ Start Review', quiz: '▶ Take a Quiz', translate: '▶ Practice Translation' }
const ACTION_TAB   = { review: 'vocabulary', quiz: 'quiz', translate: 'translation' }

export default function HomeScreen() {
  const { state, dispatch } = useApp()
  const [stats, setStats] = useState({ total: 0, dueToday: 0, sessions: 0 })
  const [greeting, setGreeting] = useState(null)
  const [greetingLoading, setGreetingLoading] = useState(true)
  const [greetingError, setGreetingError] = useState('')

  const fallbackGreeting = (dueToday) => ({
    greeting: "Hey! Ready for today's practice? 👋",
    today_plan: dueToday > 0
      ? `You have ${dueToday} word${dueToday === 1 ? '' : 's'} waiting for review.`
      : 'Try a quick translation or quiz to keep your streak going.',
    motivation: 'Small steps every day — keep going!',
    suggested_action: dueToday > 0 ? 'review' : 'translate',
  })

  useEffect(() => {
    if (!state.user?.uid) return
    let cancelled = false
    async function fetchAll() {
      const vocabRef = collection(db, 'users', state.user.uid, 'vocabulary')
      const allSnap = await getDocs(vocabRef)
      if (cancelled) return
      const now = new Date()
      let dueToday = 0
      allSnap.forEach(d => {
        const data = d.data()
        const reviewDate = data.next_review?.toDate ? data.next_review.toDate() : new Date(data.next_review ?? 0)
        if (reviewDate <= now) dueToday++
      })

      const sessRef = collection(db, 'users', state.user.uid, 'translation_sessions')
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const sessSnap = await getDocs(query(sessRef, where('created_at', '>=', todayStart)))
      if (cancelled) return

      const currentStats = { total: allSnap.size, dueToday, sessions: sessSnap.size }
      setStats(currentStats)

      const cacheKey = `coach_greeting_${new Date().toDateString()}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          setGreeting(JSON.parse(cached))
          setGreetingLoading(false)
          return
        } catch {
          sessionStorage.removeItem(cacheKey)
        }
      }

      try {
        const userStatsForCoach = {
          streak: 0,
          words_due_for_review: dueToday,
          total_words: allSnap.size,
          last_quiz_score: null,
          weak_words: [],
          days_since_last_session: 0,
          total_translations_today: sessSnap.size,
          total_quizzes_today: 0,
        }
        const result = await getDailyGreeting(userStatsForCoach)
        if (cancelled) return
        sessionStorage.setItem(cacheKey, JSON.stringify(result))
        setGreeting(result)
      } catch (e) {
        if (cancelled) return
        setGreeting(fallbackGreeting(dueToday))
      } finally {
        if (!cancelled) setGreetingLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [state.user?.uid])

  return (
    <div className="px-6 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-slate-400">Welcome back,</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {state.user?.displayName?.split(' ')[0] ?? 'Learner'} 👋
          </h1>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-lg grayscale hover:grayscale-0 transition-all"
        >
          🚪
        </button>
      </div>

      {/* Coach greeting card */}
      <div className="card mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl shadow-inner">
            👨‍🏫
          </div>
          <div className="flex-1 min-w-0">
            {greetingLoading ? (
              <GreetingSkeleton />
            ) : greeting ? (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-slate-800 leading-snug mb-1">{greeting.greeting}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{greeting.today_plan}</p>
                
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold text-primary-500 italic uppercase tracking-wider">
                    ✨ {greeting.motivation}
                  </p>
                  {greeting.suggested_action && (
                    <button
                      onClick={() => dispatch({ type: 'SET_TAB', payload: ACTION_TAB[greeting.suggested_action] ?? 'vocabulary' })}
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      {ACTION_LABEL[greeting.suggested_action]?.split(' ')[1] ?? 'Let\'s Go'}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          emoji="📚" 
          label="Vocab Bank" 
          value={stats.total} 
          color="bg-amber-50 text-amber-600 border-amber-100" 
        />
        <StatCard 
          emoji="🔥" 
          label="Due Today" 
          value={stats.dueToday} 
          color={stats.dueToday > 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"} 
          accent={stats.dueToday > 0} 
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="label">Your Learning Paths</h2>
        <div className="grid gap-4">
          <QuickAction 
            emoji="💬" 
            title="AI Coach Chat" 
            sub="Daily conversation practice" 
            color="from-blue-500 to-indigo-600"
            onClick={() => dispatch({ type: 'SET_TAB', payload: 'coach' })} 
          />
          <QuickAction 
            emoji="📺" 
            title="Video Club" 
            sub="Learn from real videos" 
            color="from-rose-500 to-pink-600"
            onClick={() => dispatch({ type: 'SET_TAB', payload: 'video' })} 
          />
          <QuickAction 
            emoji="✍️" 
            title="Translate Pro" 
            sub="Dual-way sentence practice" 
            color="from-emerald-500 to-teal-600"
            onClick={() => dispatch({ type: 'SET_TAB', payload: 'translation' })} 
          />
          <QuickAction 
            emoji="📖" 
            title="Flashcards" 
            sub="Review your saved words" 
            color="from-amber-500 to-orange-600"
            onClick={() => dispatch({ type: 'SET_TAB', payload: 'vocabulary' })} 
          />
        </div>
      </div>
    </div>
  )
}

function GreetingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-slate-100 rounded-lg w-4/5" />
      <div className="h-3 bg-slate-50 rounded-lg w-3/5" />
      <div className="h-2 bg-slate-50 rounded-lg w-2/5" />
    </div>
  )
}

function StatCard({ emoji, label, value, color, accent }) {
  return (
    <div className={`rounded-3xl p-5 border transition-all ${color} ${accent ? 'scale-[1.02] shadow-sm' : 'opacity-80'}`}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
    </div>
  )
}

function QuickAction({ emoji, title, sub, color, onClick }) {
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
