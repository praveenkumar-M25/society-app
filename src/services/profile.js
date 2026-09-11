import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function updateProfile(uid, { name, flatNumber }) {
  return updateDoc(doc(db, 'users', uid), { name, flatNumber })
}