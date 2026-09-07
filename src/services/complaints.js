import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'complaints')

export const STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
}

export function subscribeComplaints(callback, onError) {
  const q = query(ref, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function raiseComplaint({ title, description, category, raisedBy, flatNumber }) {
  return addDoc(ref, {
    title,
    description,
    category,
    raisedBy,
    flatNumber,
    status: STATUS.OPEN,
    createdAt: serverTimestamp(),
  })
}

export function updateComplaintStatus(id, status) {
  return updateDoc(doc(db, 'complaints', id), { status })
}
