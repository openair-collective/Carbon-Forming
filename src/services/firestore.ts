import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/const"
import { UserProfile, Team, Project, Competition } from "@/types"
import { 
  getFirestore,
  addDoc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  doc,
  deleteDoc,
  query,
  runTransaction,
  where,
  writeBatch,
  connectFirestoreEmulator,
  deleteField,
  documentId
} from "firebase/firestore"
import { readFile, write } from "fs"

const MODULE_ID = 'services/firestore'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

class FirestoreService {

  async userProfile(uid:string):Promise<UserProfile> {
    try {
      const ref = doc(db, 'users', uid)
      const docSnap = await getDoc(ref)
      return Object.assign(docSnap.data() as UserProfile, {id: uid})
    }
    catch(error) {
      let message = (error instanceof Error) ? error.message : String(error)
      throw new Error(`${MODULE_ID} #user > ${message}`)
    }
  }

  async saveUserProfile(user:UserProfile):Promise<void> {
    const clone = Object.assign({}, user)
    const blacklist:string[] = ['avatar', 'id']
    blacklist.forEach((prop) => {
      delete clone[prop as keyof UserProfile]
    })
    const ref = doc(db, 'users', user.id)
    await setDoc(ref, user, { merge: true })
  }

  async userTeams(uid:string):Promise<Team[]> {
    const q = query(collection(db, 'teams'), where(`members.${uid}`, '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(team => Object.assign({ id: team.id }, team.data()) as Team)
  }

  async addTeamToUser(team_id:string, uid:string, role?:string):Promise<void> {
    const batch = writeBatch(db)
    // save team to user as team
    const userRef = doc(db, 'users', uid)
    batch.set(userRef, { teams: {
        [`${team_id}`]: role || 'default'
      }
    })
    // save user to team as a member
    const teamRef = doc(db, 'teams', team_id)
    batch.set(teamRef, {
      members: {
        [`${uid}`]: true
      }
    }, { merge: true })
    await batch.commit()
  }

  async removeTeamFromUser(team_id:string, uid:string) {
    const batch = writeBatch(db)
    const userRef = doc(db, 'users', uid)
    batch.update(userRef, { [`teams.${team_id}`]: deleteField() })
    const q = query(collection(db, 'teams'), where(`members.${uid}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.delete(doc.ref)
    })

    return await batch.commit()
  }

  async saveTeam(team:Team):Promise<Team> {
    let result = team
    var docRef
    if (team.id) {
      const ref = doc(db, 'teams', team.id)
      const clone = Object.assign({}, team)
      delete clone['id' as keyof Team]
      docRef = await setDoc(ref, team, { merge: true })
    }
    else {
      docRef = await addDoc(collection(db, "teams"), team)
      result = Object.assign(team, { id: docRef.id }) as Team
    }
    return result
  }

  async deleteTeam(team_id:string):Promise<void> {

    const batch = writeBatch(db)

    // delete Team doc
    batch.delete(doc(db, 'teams', team_id))

    // delete Team from UserTeam docs userTeams/{user}/{team_id}
    const q = query(collection(db, 'users'), where(`teams.${team_id}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.delete(doc.ref)
    })

    return await batch.commit() 
  }

  async team(team_id:string):Promise<Team> {
    const teamRef = doc(db, 'teams', team_id)
    const team = await getDoc(teamRef)
    return Object.assign({ id: team.id }, team.data()) as Team
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

  async saveProject(project:Project):Promise<void> {
  }

  async deleteProject(project_id:string):Promise<void>{
  }

  async project(project_id:string):Promise<Project> {
    return {} as Project
  }

  async projects():Promise<Project[]> {
    return [] as Project[]
  }

  async teamProjects(team_id:string):Promise<Project[]> {
    return [] as Project[]
  }

  async competitionProjects():Promise<Project[]> {
    return [] as Project[]
  }


  async addProjectToCompetition(project_id:string, comp_id:string):Promise<void> {
  }

  async saveCompetition(comp:Competition):Promise<void> {
  }

  async deleteCompetition(comp:Competition):Promise<void> {
  }

  async competition():Promise<Competition> {
    return {} as Competition
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