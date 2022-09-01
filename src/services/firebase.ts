import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/const"
import { 
  getAuth,
  Auth, 
  signInWithCustomToken, 
  connectAuthEmulator,
  signOut
} from 'firebase/auth'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)

export const auth:Auth = getAuth()
export const URI_FIREBASE_AUTH = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_URI

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
}

class FirebaseService {

  async loginWithCustomToken(access_token:string):Promise<any> {
    return await signInWithCustomToken(auth, access_token)
  }

  logout():Promise<void> {
    return signOut(auth)
  }

}

const firebase = new FirebaseService()
export default firebase