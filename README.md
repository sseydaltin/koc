# 🎓 AI English Coach

A personal AI-powered English learning app built with React, Groq AI, and Firebase. Designed as a mobile-first PWA that converts to an Android APK via Capacitor.

![AI English Coach](https://img.shields.io/badge/Level-A2-blue) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Capacitor](https://img.shields.io/badge/Capacitor-6-119EFF?logo=capacitor) ![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **AI Coach Chat** | Daily conversation practice with an AI English coach. The coach corrects your grammar in real-time and adapts to your level. |
| 📚 **Vocabulary** | Leitner spaced repetition system — add words, review due cards, browse your word bank. |
| ✍️ **Translation Practice** | Bi-directional (TR→EN / EN→TR) translation exercises with AI-powered feedback and scoring. |
| 🎬 **Video Club** | 21 real educational videos (TED Talks, etc.) with detailed summaries. Watch a video, then discuss it with your AI coach. |
| 🏠 **Smart Dashboard** | Personalized daily greeting, streak tracking, vocab stats, and quick-action cards. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS 3
- **AI Backend:** Groq API (Llama 3.3 70B Versatile)
- **Database:** Firebase Firestore
- **Mobile:** Capacitor 6 (Android APK)
- **Design:** Glassmorphism, dark gradients, Inter font, micro-animations

---

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Android Studio](https://developer.android.com/studio) (for APK build only)
- A [Groq API key](https://console.groq.com/) (free tier available)
- A [Firebase project](https://console.firebase.google.com/) with Firestore enabled

### 1. Clone the repository

```bash
git clone https://github.com/sseydaltin/koc.git
cd koc
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GROQ_API_KEY=your_groq_api_key
```

### 4. Run in development mode

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Building the Android APK

### 1. Build the web assets

```bash
npm run build
```

### 2. Sync with Android project

```bash
npx cap sync android
```

### 3. Open in Android Studio

```bash
npx cap open android
```

### 4. Generate APK

In Android Studio:
1. Wait for **Gradle Sync** to complete
2. Go to **Build → Assemble Project**
3. Find the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Transfer to your phone and install

---

## 📁 Project Structure

```
koc/
├── src/
│   ├── components/          # UI components
│   │   ├── HomeScreen.jsx       # Dashboard with stats & actions
│   │   ├── LoginScreen.jsx      # Login screen (currently bypassed)
│   │   ├── BottomNav.jsx        # Floating bottom navigation
│   │   ├── ChatBubble.jsx       # Chat message bubble
│   │   ├── CorrectionCard.jsx   # Grammar correction display
│   │   ├── vocabulary/          # Vocabulary module
│   │   ├── translation/         # Translation practice module
│   │   └── video/               # Video Club module
│   ├── screens/
│   │   └── CoachChat.jsx        # AI coach conversation screen
│   ├── context/
│   │   └── AppContext.jsx       # Global state management
│   ├── lib/
│   │   ├── firebase.js          # Firebase configuration
│   │   └── gemini.js            # Groq AI API integration
│   ├── data/
│   │   └── videos.json          # Video library (21 educational videos)
│   ├── App.jsx                  # Main app with routing
│   └── index.css                # Global styles & design system
├── android/                 # Capacitor Android project
├── capacitor.config.json    # Capacitor configuration
├── tailwind.config.js       # Tailwind theme & colors
├── vite.config.js           # Vite build configuration
└── package.json
```

---

## 🔧 Configuration

### Changing the user

Edit `src/context/AppContext.jsx`:

```js
const initialState = {
  user: { uid: 'your-uid', email: 'your@email.com' },
  // ...
}
```

### Adding more videos

Edit `src/data/videos.json` — add entries with:

```json
{
  "id": "youtube_video_id",
  "title": "Video Title",
  "level": "B1",
  "summary": "Detailed summary for the AI coach to reference..."
}
```

---

## 📝 License

This project is for personal use only.

---

## 👤 Author

**Şeyda Altın** — [sseydaltin@gmail.com](mailto:sseydaltin@gmail.com)
