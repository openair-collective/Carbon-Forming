import { initializeApp } from "firebase/app";
import { getAuth, Auth, signInWithCustomToken, connectAuthEmulator } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)

export const auth:Auth = getAuth()
export const URI_FIREBASE_AUTH = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_URI

if (URI_FIREBASE_AUTH) {
  connectAuthEmulator(auth, URI_FIREBASE_AUTH)
}

class FirebaseService {

  async login(access_token:string):Promise<any> {
    return await signInWithCustomToken(auth, access_token)
  }

  logout() {
    return auth.signOut()
  }

}

const firebase = new FirebaseService()
export default firebase