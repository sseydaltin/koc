import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import videosData from '../../data/videos.json'

export default function VideoClubScreen() {
  const { dispatch } = useApp()
  const [selectedVideo, setSelectedVideo] = useState(null)

  const handleChat = () => {
    dispatch({ type: 'START_VIDEO_CHAT', payload: selectedVideo })
  }

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">📺 Video Club</h1>
      <p className="text-sm font-medium text-slate-400 mb-8">Watch and discuss with your coach</p>

      {selectedVideo ? (
        <div className="space-y-6 animate-fade-in">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="group flex items-center gap-2 text-primary-600 font-bold text-sm mb-4"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Collection
          </button>
          
          <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-blue-500/20 bg-black relative pt-[56.25%] border-4 border-white">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="card shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                Level {selectedVideo.level}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3 leading-tight">{selectedVideo.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Watch this video carefully. When you are ready, click the button below to start a conversation about it with your AI coach.
            </p>
            
            <button 
              onClick={handleChat} 
              className="btn-primary w-full py-4 text-base shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              <span className="text-xl">💬</span>
              Discuss with Coach
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {videosData.map((video, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedVideo(video)}
              className="card p-0 overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-200/40 group"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                <img 
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                  onError={(e) => e.target.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt="thumbnail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl border border-white/50 shadow-lg group-hover:scale-110 transition-transform">
                    ▶
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {video.level}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base leading-tight mb-2 group-hover:text-primary-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                  {video.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
