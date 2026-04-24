import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import BottomNav from './components/BottomNav'
import HomeScreen from './components/HomeScreen'
import VocabularyScreen from './components/vocabulary/VocabularyScreen'
import TranslationScreen from './components/translation/TranslationScreen'
import VideoClubScreen from './components/video/VideoClubScreen'
import CoachChat from './screens/CoachChat'

function AppContent() {
  const { state } = useApp()

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!state.user) return <LoginScreen />

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      <main className="pb-20">
        {state.activeTab === 'home'        && <HomeScreen />}
        {state.activeTab === 'coach'       && <CoachChat />}
        {state.activeTab === 'vocabulary'  && <VocabularyScreen />}
        {state.activeTab === 'translation' && <TranslationScreen />}
        {state.activeTab === 'video'       && <VideoClubScreen />}
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
