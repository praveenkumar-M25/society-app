import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const ref = collection(db, 'polls')

export function subscribePolls(callback, onError) {
  const q = query(ref, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function createPoll({ question, options, createdBy }) {
  return addDoc(ref, {
    question,
    options: options.map((text, i) => ({ id: String(i), text, votes: 0 })),
    voterFlats: [],
    createdBy,
    createdAt: serverTimestamp(),
  })
}

// Uses a transaction so two residents voting at the same instant can't
// both slip past the "already voted" check (avoids a race condition).
export async function castVote(pollId, optionId, flatNumber) {
  const pollRef = doc(db, 'polls', pollId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(pollRef)
    if (!snap.exists()) throw new Error('Poll not found')
    const poll = snap.data()

    if (poll.voterFlats?.includes(flatNumber)) {
      throw new Error('ALREADY_VOTED')
    }

    const updatedOptions = poll.options.map((opt) =>
      opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
    )

    transaction.update(pollRef, {
      options: updatedOptions,
      voterFlats: arrayUnion(flatNumber),
    })
  })
}