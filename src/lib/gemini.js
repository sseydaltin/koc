const API_KEYS = (import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean)
let currentKeyIndex = 0

function safeParseJSON(text) {
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    const start = cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : cleaned.indexOf('[')
    const end = cleaned.lastIndexOf('}') !== -1 ? cleaned.lastIndexOf('}') + 1 : cleaned.lastIndexOf(']') + 1
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end))
    }
    throw new Error('AI response is not valid JSON')
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

let lastCallTime = 0
const MIN_INTERVAL = 1000

async function callGemini(prompt, { maxRetries = 2 } = {}) {
  if (API_KEYS.length === 0) throw new Error('API key not configured')

  const wait = MIN_INTERVAL - (Date.now() - lastCallTime)
  if (wait > 0) await sleep(wait)
  lastCallTime = Date.now()

  let lastError
  let keysTried = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS[currentKeyIndex]}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 512,
          response_format: { type: 'json_object' }
        }),
      })
      if (!res.ok) {
        const err = new Error(`Groq error: ${res.status}`)
        err.status = res.status
        throw err
      }
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content ?? ''
      return safeParseJSON(text)
    } catch (e) {
      lastError = e

      if ([400, 401, 403, 429].includes(e.status) && keysTried < API_KEYS.length - 1) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
        keysTried++
        console.warn(`API key limit reached. Switching to key index: ${currentKeyIndex}`)
        attempt--
        continue
      }

      if (attempt >= maxRetries) break
      await sleep(2000 * Math.pow(2, attempt))
    }
  }
  throw lastError
}

export async function enrichWord(word) {
  const prompt = `You are an English teacher for an A2 level Turkish student.

For the word: "${word}"

Return ONLY a JSON object (no markdown, no backticks):
{
  "example": "a simple example sentence using this word",
  "context": "a second example in a different context",
  "collocations": ["common word pair 1", "common word pair 2"],
  "tip": "a short memory tip connecting English to Turkish if possible"
}

Keep sentences under 10 words. Use only A1-A2 vocabulary.`
  return callGemini(prompt)
}

export async function generateTranslationPair(topic) {
  const prompt = `You are an expert English teacher for a Turkish student.

Generate 1 highly natural, high-quality sentence pair for translation practice.
Topic: ${topic}

Return ONLY a JSON object (no markdown, no backticks):
{
  "english": "the original English sentence",
  "turkish": "accurate and natural Turkish translation"
}

Rules:
- Make the sentence sound like real, everyday spoken English (use phrasal verbs, idioms, or natural conversational flow).
- Avoid robotic, boring, or textbook-like sentences. Focus on modern, practical usage.
- Sentence length should be around 8 to 15 words.
- Ensure the Turkish translation is EXACTLY how a native Turkish speaker would naturally say it in daily life (never do word-for-word robotic translations).
- Topic: ${topic}`
  return callGemini(prompt)
}

export async function evaluateTranslation(sourceLang, targetLang, originalSentence, expectedTranslation, userAnswer) {
  const prompt = `You are an expert language teacher for a Turkish student learning English.

The student was asked to translate this ${sourceLang} sentence to ${targetLang}:
Original ${sourceLang}: "${originalSentence}"
Expected ${targetLang}: "${expectedTranslation}"
Student's answer: "${userAnswer}"

Return ONLY a JSON object (no markdown, no backticks):
{
  "score": <0-10>,
  "is_acceptable": <true/false>,
  "corrected": "the best natural version",
  "mistakes": ["mistake 1 explained simply", "mistake 2..."],
  "explanation": "brief encouraging feedback in simple English, max 2 sentences"
}

Be encouraging but honest. Accept alternative correct translations.`
  return callGemini(prompt)
}

export async function getDailyGreeting(userStats) {
  const prompt = `You are an English coach and a close friend of a Turkish A2-level student.

Your personality:
- Warm, casual, encouraging — like a supportive buddy
- Use simple English (A2 level) but push them gently
- Mix in Turkish when explaining tricky grammar
- Keep messages short (2-4 sentences max)

Here is the student's current status:
${JSON.stringify(userStats, null, 2)}

Based on this, do THREE things:
1. Greet them naturally (reference their streak, progress, or something specific)
2. Tell them what to focus on today (review words? do a quiz? practice translations?)
3. End with a motivating one-liner

Return ONLY a JSON object (no markdown, no backticks):
{
  "greeting": "your greeting message",
  "today_plan": "what they should do today, be specific",
  "motivation": "a short motivating sentence",
  "suggested_action": "review"
}

The suggested_action must be one of: "review", "quiz", "translate"

Examples of good tone:
- "Hey! 5 days in a row, nice! 💪"
- "You've got 12 words waiting for review — let's knock those out first!"
- "Your quiz scores are getting better, keep going!"`
  return callGemini(prompt, { maxRetries: 0 })
}

export async function chatWithCoach(chatHistory, userMessage, recentWords) {
  const historyText = chatHistory
    .slice(-10)
    .map(m => `${m.role === 'coach' ? 'Coach' : 'Student'}: ${m.content}`)
    .join('\n')

  const prompt = `You are an English coach and close friend of a Turkish A2-level student.

Conversation rules:
- Speak simple English (A2 level)
- If the student makes a grammar or vocabulary mistake, correct it INLINE like this:
  (btw, "I goed" → "I went" — past tense of 'go' is irregular! 😊)
- Don't stop the conversation flow for corrections — correct and continue
- Ask follow-up questions to keep the conversation going
- If the student writes in Turkish, respond in English and gently encourage them to try in English
- Keep your messages short (2-5 sentences)
- Use the student's vocabulary list to occasionally introduce words they're learning

Student's recent vocabulary (for context):
${recentWords.length > 0 ? recentWords.join(', ') : 'none yet'}

Conversation so far:
${historyText || '(new conversation)'}

Student's latest message:
${userMessage}

Return ONLY a JSON object (no markdown, no backticks):
{
  "reply": "your conversational reply with inline corrections if needed",
  "corrections": [
    {
      "original": "what the student said wrong",
      "corrected": "the correct version",
      "rule": "brief grammar rule in Turkish"
    }
  ],
  "new_words_used": ["any new vocabulary you introduced"]
}`

  return callGemini(prompt)
}
