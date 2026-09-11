import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'visitors')

export const VISITOR_STATUS = { EXPECTED: 'Expected', CHECKED_IN: 'Checked In', CHECKED_OUT: 'Checked Out' }

export function subscribeVisitors(callback, onError) {
  const q = query(ref, orderBy('expectedDate', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function logVisitor({ visitorName, purpose, expectedDate, flatNumber, requestedBy }) {
  return addDoc(ref, {
    visitorName,
    purpose,
    expectedDate,
    flatNumber,
    requestedBy,
    status: VISITOR_STATUS.EXPECTED,
  })
}

export function updateVisitorStatus(id, status) {
  return updateDoc(doc(db, 'visitors', id), { status })
}