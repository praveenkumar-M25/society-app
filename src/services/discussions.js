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

const ref = collection(db, 'discussions')

export function subscribeDiscussions(callback, onError) {
  const q = query(ref, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function startDiscussion({ title, message, authorName }) {
  return addDoc(ref, {
    title,
    message,
    authorName,
    replies: [],
    createdAt: serverTimestamp(),
  })
}

export function addReply(id, { authorName, message }) {
  return updateDoc(doc(db, 'discussions', id), {
    replies: arrayUnion({ authorName, message, at: new Date().toISOString() }),
  })
}