import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'bookings')

export const FACILITIES = ['Clubhouse', 'Gym', 'Swimming Pool', 'Tennis Court', 'Party Hall']

export function subscribeBookings(callback, onError) {
  const q = query(ref, orderBy('date', 'asc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function createBooking({ facility, date, slot, bookedBy, flatNumber }) {
  return addDoc(ref, {
    facility,
    date,
    slot,
    bookedBy,
    flatNumber,
    createdAt: serverTimestamp(),
  })
}

export function isSlotTaken(bookings, facility, date, slot) {
  return bookings.some(
    (b) => b.facility === facility && b.date === date && b.slot === slot
  )
}
