import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'marketplace')

export const LISTING_TYPES = ['Sell', 'Buy', 'Rent']

export function subscribeListings(callback, onError) {
  const q = query(ref, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function createListing({ type, title, price, description, contact, postedBy, flatNumber }) {
  return addDoc(ref, {
    type,
    title,
    price,
    description,
    contact,
    postedBy,
    flatNumber,
    createdAt: serverTimestamp(),
  })
}

export function deleteListing(id) {
  return deleteDoc(doc(db, 'marketplace', id))
}