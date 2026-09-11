import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'payments')

export const PAY_STATUS = { PENDING: 'Pending', PAID: 'Paid' }

export function subscribePayments(callback, onError) {
  const q = query(ref, orderBy('month', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function createPaymentRecord({ flatNumber, month, amount }) {
  return addDoc(ref, { flatNumber, month, amount, status: PAY_STATUS.PENDING })
}

export function markAsPaid(id) {
  return updateDoc(doc(db, 'payments', id), { status: PAY_STATUS.PAID })
}