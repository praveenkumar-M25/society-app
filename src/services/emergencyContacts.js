import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'emergencyContacts')

export function subscribeContacts(callback, onError) {
  const q = query(ref, orderBy('name', 'asc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function addContact({ name, role, phone }) {
  return addDoc(ref, { name, role, phone })
}

export function removeContact(id) {
  return deleteDoc(doc(db, 'emergencyContacts', id))
}