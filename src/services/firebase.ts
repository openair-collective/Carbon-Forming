import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/const"
import { getAuth, onAuthStateChanged, Auth, signInWithCustomToken, connectAuthEmulator } from 'firebase/auth'
import log from '@/services/logger'

const MODULE_ID = 'services/firebase'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)

export const auth:Auth = getAuth()
export const URI_FIREBASE_AUTH = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_URI

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
}

onAuthStateChanged(auth, user => {
  if (user) {
    log.info(MODULE_ID, '#onAuthStateChange > user authenticated')
  } else {
    log.info(MODULE_ID, '#onAuthStateChange > user not authenticated')
  }
})

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