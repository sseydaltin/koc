import React, { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}>
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-sm text-center relative z-10">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] border border-white/20 flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">
          🎓
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">AI English Coach</h1>
        <p className="text-blue-200/70 text-sm font-medium mb-12">A2 Level · Kişisel İngilizce Antrenmanı</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4.5 px-6 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-2xl hover:shadow-white/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {error && (
          <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-10 font-medium">Free tier · Firebase + Groq · Personal use only</p>
      </div>
    </div>
  )
}
