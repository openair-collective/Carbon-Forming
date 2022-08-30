import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/const"
import { User, Team, Competition } from "@/types"
import { 
  getFirestore,
  addDoc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  doc,
  connectFirestoreEmulator
} from "firebase/firestore"

const MODULE_ID = 'services/firestore'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

class FirestoreService {

  async saveUser(user:User):Promise<any> {
    if (user.id) {

    }
    else {
      throw new Error('User must already exist')
    }
  }

  async saveTeam(team:Team):Promise<Team> {
    let result = team
    var docRef
    if (team.id) {
      const ref = doc(db, 'teams', team.id)
      docRef = await setDoc(ref, team, {merge: true})
    }
    else {
      docRef = await addDoc(collection(db, "teams"), team)
      result = Object.assign(team, { id: docRef.id }) as Team
    }
    return result
  }

  async saveProject(project:object):Promise<void> {

  }

  async saveCompetition(comp:Competition):Promise<void> {

  }

  async user(uid:string):Promise<User> {
    try {
      const ref = doc(db, 'users', uid)
      const docSnap = await getDoc(ref)
      return Object.assign(docSnap.data() as User, {id: uid})
    }
    catch(error) {
      let message = (error instanceof Error) ? error.message : String(error)
      throw new Error(`${MODULE_ID} #user > ${message}`)
    }
  }

  async teamProjects(team_id:string):Promise<any[]> {
    let result = [] as Array<any>
    return result
  }

  async teams():Promise<Team[]> {
    let result = [] as Array<any>
    const teamsRef = collection(db, 'teams')
    const docsSnap = await getDocs(teamsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(team => Object.assign({ id: team.id }, team.data()))
    }
    return result
  }

  async competitions():Promise<Competition[]> {
    let result = [] as Array<any>
    const competitionsRef = collection(db, 'competitions')
    const docsSnap = await getDocs(competitionsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(comp => Object.assign({ id: comp.id }, comp.data()))
    }
    return result
  }

}

const firestore = new FirestoreService()
export default firestore