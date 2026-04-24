import {
  collection, doc, getDoc, setDoc, updateDoc, addDoc,
  getDocs, query, orderBy, limit, where,
  serverTimestamp, increment, arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodaySession(uid) {
  const key = todayKey()
  const ref = doc(db, 'users', uid, 'coach_sessions', key)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: key, ...snap.data() }
  const session = { messages: [], date: key, message_count: 0, created_at: serverTimestamp() }
  await setDoc(ref, session)
  return { id: key, ...session, messages: [], message_count: 0 }
}

export async function addMessage(uid, sessionId, role, content) {
  const ref = doc(db, 'users', uid, 'coach_sessions', sessionId)
  await updateDoc(ref, {
    messages: arrayUnion({ role, content, ts: Date.now() }),
    message_count: increment(1),
  })
}

export async function getMessageCount(uid) {
  const key = todayKey()
  const ref = doc(db, 'users', uid, 'coach_sessions', key)
  const snap = await getDoc(ref)
  if (!snap.exists()) return 0
  return snap.data().message_count ?? 0
}

export async function saveCorrections(uid, corrections) {
  if (!corrections?.length) return
  const colRef = collection(db, 'users', uid, 'coach_corrections')
  for (const c of corrections) {
    if (!c.original) continue
    const q = query(colRef, where('original', '==', c.original), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, { frequency: increment(1), last_seen: serverTimestamp() })
    } else {
      await addDoc(colRef, {
        original: c.original,
        corrected: c.corrected,
        rule: c.rule ?? '',
        frequency: 1,
        last_seen: serverTimestamp(),
      })
    }
  }
}

export async function getTopCorrections(uid, lim = 5) {
  const q = query(
    collection(db, 'users', uid, 'coach_corrections'),
    orderBy('frequency', 'desc'),
    limit(lim),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
