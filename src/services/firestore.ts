import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/const"
import { getFirestore, getDocs, collection, connectFirestoreEmulator } from "firebase/firestore"

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

const competitionsRef = collection(db, 'competitions')

class FirestoreService {

  userTeam(uid:string) {
  }

  teamCompetitions(tid:string) {
  }

  async competitions():Promise<Object[]> {
    console.info('#competitions')
    let result = [] as Array<Object>
    const docsSnap = await getDocs(competitionsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(doc => doc.data())
    }
    return result
  }

}

const firestore = new FirestoreService()
export default firestore