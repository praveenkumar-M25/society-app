import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export async function fetchMembers() {
  const q = query(collection(db, 'users'), orderBy('flatNumber', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
