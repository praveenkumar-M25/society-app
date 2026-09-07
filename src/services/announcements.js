import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'announcements')

export function subscribeAnnouncements(callback, onError) {
  const q = query(ref, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function postAnnouncement({ title, body, authorName }) {
  return addDoc(ref, {
    title,
    body,
    authorName,
    createdAt: serverTimestamp(),
  })
}
