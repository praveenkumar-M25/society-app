import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'events')

export function subscribeEvents(callback, onError) {
  const q = query(ref, orderBy('date', 'asc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function createEvent({ title, date, time, location, description, createdBy }) {
  return addDoc(ref, {
    title,
    date,
    time,
    location,
    description,
    createdBy,
    rsvps: [],
    createdAt: serverTimestamp(),
  })
}

export function rsvpEvent(id, flatNumber) {
  return updateDoc(doc(db, 'events', id), { rsvps: arrayUnion(flatNumber) })
}