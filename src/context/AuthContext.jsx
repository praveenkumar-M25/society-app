// Provides current user + role (resident/admin) to the whole app.
import { createContext, useContext, useEffect, useState } from 'react'

import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { auth, db } from '../firebase'

const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check Firebase login state
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (!firebaseUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // IMPORTANT:
      // Firebase Authentication user irundhaalum,
      // Firestore society profile irukkanum.
      const profileRef = doc(db, 'users', firebaseUser.uid)
      const profileSnap = await getDoc(profileRef)

      if (!profileSnap.exists()) {
        // Auth account exists, but society registration
        // does not exist.
        await signOut(auth)

        setUser(null)
        setProfile(null)
        setLoading(false)

        return
      }

      // Only accept user when Firestore profile exists
      setUser(firebaseUser)
      setProfile(profileSnap.data())
    } catch (error) {
      console.error('Auth state error:', error)

      await signOut(auth)

      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  })

  return unsubscribe
}, [])

  // --------------------------------------------------
  // NORMAL EMAIL/PASSWORD REGISTRATION
  // --------------------------------------------------

  async function register({
    name,
    flatNumber,
    email,
    password,
    role,
  }) {
    const cleanEmail = email.trim().toLowerCase()

    const cred = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    )

    const newProfile = {
      name: name.trim(),
      flatNumber: flatNumber.trim(),
      email: cleanEmail,
      role: role || 'resident',
      createdAt: serverTimestamp(),
    }

    // Create Firestore profile only during registration
    await setDoc(
      doc(db, 'users', cred.user.uid),
      newProfile
    )

    // Email verification
    await sendEmailVerification(cred.user)

    setProfile(newProfile)

    return cred.user
  }

  // --------------------------------------------------
  // NORMAL EMAIL/PASSWORD LOGIN
  // --------------------------------------------------

  async function login(email, password) {
  try {
    const cleanEmail = email.trim().toLowerCase()

    const cred = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    )

    // Email verification check
    if (!cred.user.emailVerified) {
      await signOut(auth)
      throw new Error('EMAIL_NOT_VERIFIED')
    }

    // IMPORTANT:
    // Check whether this Firebase UID has a
    // registered society profile.
    const profileRef = doc(db, 'users', cred.user.uid)
    const profileSnap = await getDoc(profileRef)

    if (!profileSnap.exists()) {
      // Auth account exists but registration/profile
      // was deleted from Firestore.
      await signOut(auth)

      throw new Error('NOT_REGISTERED')
    }

    // Only now allow login
    setUser(cred.user)
    setProfile(profileSnap.data())

    return cred.user

  } catch (error) {
    console.error('Login error:', error)

    if (error.message === 'NOT_REGISTERED') {
      throw new Error('NOT_REGISTERED')
    }

    if (error.message === 'EMAIL_NOT_VERIFIED') {
      throw new Error('EMAIL_NOT_VERIFIED')
    }

    throw error
  }
}

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------

  async function loginWithGoogle() {
    let cred = null

    try {
      /*
       * Google popup authentication.
       *
       * IMPORTANT:
       * signInWithPopup can create a Firebase Auth identity.
       * Therefore we NEVER create a Firestore user here unless
       * the Gmail already exists in our society users collection.
       */

      cred = await signInWithPopup(auth, googleProvider)

      const googleUser = cred.user
      const googleEmail = googleUser.email?.trim().toLowerCase()

      if (!googleEmail) {
        await signOut(auth)
        throw new Error('INVALID_GOOGLE_ACCOUNT')
      }

      // ------------------------------------------------
      // STEP 1:
      // Check whether this Google UID already has a profile
      // ------------------------------------------------

      const uidRef = doc(db, 'users', googleUser.uid)
      const uidSnap = await getDoc(uidRef)

      if (uidSnap.exists()) {
        const existingProfile = uidSnap.data()

        setUser(googleUser)
        setProfile(existingProfile)

        return googleUser
      }

      // ------------------------------------------------
      // STEP 2:
      // Check registered Gmail in Firestore
      // ------------------------------------------------

      const usersRef = collection(db, 'users')

      const emailQuery = query(
        usersRef,
        where('email', '==', googleEmail)
      )

      const emailSnap = await getDocs(emailQuery)

      // ------------------------------------------------
      // STEP 3:
      // Gmail NOT registered
      // ------------------------------------------------

      if (emailSnap.empty) {
        // IMPORTANT:
        // Not a registered society member — delete the stray Auth
        // account entirely so nothing lingers in Firebase for this
        // Gmail (not just sign them out).
        await deleteUser(googleUser)

        throw new Error('NOT_REGISTERED')
      }

      // ------------------------------------------------
      // STEP 4:
      // Gmail already registered
      // ------------------------------------------------

      const registeredDoc = emailSnap.docs[0]
      const registeredProfile = registeredDoc.data()

      /*
       * Google UID and Email/Password UID can be different.
       *
       * We create a profile for the Google UID ONLY because
       * this Gmail has already been registered in the society.
       *
       * This prevents an unknown Gmail from getting a profile.
       */

      const googleProfile = {
        ...registeredProfile,
        email: googleEmail,
      }

      await setDoc(
        doc(db, 'users', googleUser.uid),
        googleProfile
      )

      setUser(googleUser)
      setProfile(googleProfile)

      return googleUser

    } catch (error) {
      console.error('Google login error:', error)

      // If account is not registered, make sure user is logged out
      if (error.message === 'NOT_REGISTERED') {
        // Auth account already deleted above — nothing more to clean up.
        throw new Error('NOT_REGISTERED')
      }

      if (error.message === 'INVALID_GOOGLE_ACCOUNT') {
        if (auth.currentUser) {
          await signOut(auth)
        }

        throw new Error('INVALID_GOOGLE_ACCOUNT')
      }

      // User closed Google popup
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('GOOGLE_POPUP_CLOSED')
      }

      // Popup blocked
      if (error.code === 'auth/popup-blocked') {
        throw new Error('GOOGLE_POPUP_BLOCKED')
      }

      // Other Google/Firebase errors
      throw error
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function logout() {
    await signOut(auth)

    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// --------------------------------------------------
// CUSTOM HOOK
// --------------------------------------------------

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return ctx
}