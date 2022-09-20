import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/consts"
import { UserProfile, Team, Project, Competition } from "@/types"
import { TeamRole } from "@/enums"
import { 
  getFirestore,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  doc,
  query,
  runTransaction,
  where,
  writeBatch,
  connectFirestoreEmulator,
  deleteField,
  deleteDoc,
  Timestamp,
  DocumentSnapshot,
  DocumentReference,
} from "firebase/firestore"
import { parse } from "path"

const MODULE_ID = 'services/firestore'
const KEY_USERS = 'users'
const KEY_TEAMS = 'teams'
const KEY_PROJECTS = 'projects'
const KEY_COMPETITIONS = 'competitions'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

function timestampToDate(timestamp:Timestamp):Date|undefined {
  return timestamp ? timestamp.toDate() : undefined
}

function parseCompetition(comp:DocumentSnapshot):Competition {
  let data = comp.data() || {} 
  let obj = Object.assign({ id: comp.id }, data) as Competition
  obj.start_date = timestampToDate(data.start_date)
  obj.end_date = timestampToDate(data.end_date)
  return obj
}

class FirestoreService {

  async getUserProfile(id:string):Promise<UserProfile> {
    const ref = doc(db, KEY_USERS, id)
    const docSnap = await getDoc(ref)
    return Object.assign(docSnap.data() as UserProfile, { id })
  }

  async saveUserProfile(user:UserProfile):Promise<UserProfile> {
    let result = user
    if (user.id) {
      const clone = Object.assign({}, user) as UserProfile
      const blacklist:string[] = ['avatar', 'id']
      blacklist.forEach((prop) => {
        delete clone[prop as keyof UserProfile]
      })
      let ref = doc(db, KEY_USERS, user.id)
      await setDoc(ref, clone as object, { merge: true })
    }
    else {
      const docRef = await addDoc(collection(db, KEY_USERS), user)
      result = Object.assign(user, { id: docRef.id }) as UserProfile
    }
    return result
  }

  async getUserTeams(user:UserProfile):Promise<Team[]> {
    let result = [] as Team[]
    const q = query(collection(db, KEY_TEAMS), where(`members.${user.id}`, '==', true))
    const snap = await getDocs(q)
    if (snap.size) {
      result = snap.docs.map(team => {
        return Object.assign({ id: team.id }, team.data()) as Team
      })
    }
    return result
  }

  async addTeamToUser(team:Team, user:UserProfile, role?:TeamRole):Promise<void> {
    const batch = writeBatch(db)
    // save team ref to user.teams
    const userRef = doc(db, KEY_USERS, user.id)
    batch.set(userRef, { teams: {
        [`${team.id}`]: role || TeamRole.default
      }
    }, { merge: true })
    // save user to team to  team.members
    const teamRef = doc(db, KEY_TEAMS, team.id)
    batch.set(teamRef, { members: {
        [`${user.id}`]: true
      }
    }, { merge: true })
    await batch.commit()
  }

  async removeTeamFromUser(team:Team, user:UserProfile) {
    const batch = writeBatch(db)
    const userRef = doc(db, KEY_USERS, user.id)
    batch.update(userRef, { teams: 
      {
        [`${team.id}`]: deleteField()
      }
    })
    const q = query(collection(db, KEY_TEAMS), where(`members.${user.id}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.update(doc.ref, { members: 
        {
          [`${user.id}`]: deleteField()
        }
      })
    })

    return await batch.commit()
  }

  async saveTeam(team:Team):Promise<Team> {
    let result = team
    if (team.id) {
      const ref = doc(db, KEY_TEAMS, team.id)
      const clone = Object.assign({}, team)
      delete clone['id' as keyof Team]
      await setDoc(ref, clone as object, { merge: true })
    }
    else {
      const docRef = await addDoc(collection(db, KEY_TEAMS), team)
      result = Object.assign(team, { id: docRef.id }) as Team
    }
    return result
  }

  async deleteTeam(team:Team):Promise<void> {
    // firestore triggers update/deletion of Team relationships
    const teamsRef = doc(db, KEY_TEAMS, team.id)
    await deleteDoc(teamsRef)
  }

  async getTeam(team_id:string):Promise<Team> {
    const teamRef = doc(db, KEY_TEAMS, team_id)
    const team = await getDoc(teamRef)
    return Object.assign({ id: team.id }, team.data()) as Team
  }

  async getTeams():Promise<Team[]> {
    let result = [] as Team[]
    const teamsRef = collection(db, KEY_TEAMS)
    const docsSnap = await getDocs(teamsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(team => {
        return Object.assign({ id: team.id }, team.data()) as Team
      })
    }
    return result
  }

  async saveProject(project:Project):Promise<Project> {
    let result = project
    if (project.id) {
      const ref = doc(db, KEY_PROJECTS, project.id)
      const clone = Object.assign({}, project) as Project
      delete clone['id' as keyof Project]
      await updateDoc(ref, clone as object)
    }
    else {
      const docRef = await addDoc(collection(db, KEY_PROJECTS), project)
      result = Object.assign({ id: docRef.id }, project) as Project
    }
    return result
  }

  async deleteProject(project:Project):Promise<void> {
    // firestore triggers update/deletion of project relationships
    const projetRef = doc(db, KEY_PROJECTS, project.id)
    await deleteDoc(projetRef)
  }

  async getProject(project_id:string):Promise<Project> {
    const teamRef = doc(db, KEY_PROJECTS, project_id)
    const team = await getDoc(teamRef)
    return Object.assign({ id: team.id }, team.data()) as Project
  }

  async getProjects():Promise<Project[]> {
    let result = [] as Array<Project>
    const ref = collection(db, KEY_PROJECTS)
    const docsSnap = await getDocs(ref)
    if (docsSnap.size) {
      result = docsSnap.docs.map(comp => Object.assign({ id: comp.id }, comp.data()) as Project)
    }
    return result
  }

  async getTeamProjects(team:Team):Promise<Project[]> {
    const ref = collection(db, KEY_PROJECTS)
    const q = query(ref, where("team_id", "==", team.id))
    const snap = await getDocs(q)
    return snap.docs.map(project => Object.assign({ id: project.id }, project.data()) as Project)
  }

  async getCompetitionProjects(comp:Competition):Promise<Project[]> {
    const q = query(collection(db, KEY_PROJECTS), where(`competitions.${comp.id}`, '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(project => Object.assign({ id: project.id }, project.data()) as Project)
  }

  async addProjectToCompetition(project:Project, comp:Competition):Promise<void> {
    const batch = writeBatch(db)
    const projectRef = doc(db, KEY_PROJECTS, project.id)
    batch.set(projectRef, { competitions: 
      {
        [`${comp.id}`]: true
      }
    })
    const compRef = doc(db, KEY_PROJECTS, comp.id)
    batch.set(compRef, { projects: 
      {
        [`${project.id}`]: true
      }
    }, { merge: true })
    await batch.commit()
  }

  async removeProjectFromCompetitions(project:Project, comp:Competition):Promise<void> {
    const batch = writeBatch(db)
    const projectRef = doc(db, KEY_PROJECTS, project.id)
    batch.update(projectRef, { competitions: 
      {
        [`${comp.id}`]: deleteField() 
      }
    })
    const q = query(collection(db, KEY_COMPETITIONS), where(`projects.${project.id}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.update(doc.ref, { projects: 
        {
          [`${project.id}`] : deleteField()
        }
      })
    })

    return await batch.commit()
  }

  async saveCompetition(comp:Competition):Promise<Competition> {
    let result = comp
    if (comp.id) {
      const ref = doc(db, KEY_COMPETITIONS, comp.id)
      const clone = Object.assign({}, comp)
      delete clone['id' as keyof Competition]
      await setDoc(ref, comp, { merge: true })
    }
    else {
      let docRef = await addDoc(collection(db, KEY_COMPETITIONS), comp)
      result = Object.assign({ id: docRef.id }, comp) as Competition
    }
    return result
  }

  async deleteCompetition(comp:Competition):Promise<void> {
    // firestore triggers update/deletion of competition relationships
    const compRef = doc(db, KEY_COMPETITIONS, comp.id)
    await deleteDoc(compRef)
  }

  async getCompetition(comp_id:string):Promise<Competition> {
    const compRef = doc(db, KEY_COMPETITIONS, comp_id)
    const comp = await getDoc(compRef)
    return parseCompetition(comp)
  }

  async getCompetitions():Promise<Competition[]> {
    let result = [] as Array<Competition>
    const competitionsRef = collection(db, KEY_COMPETITIONS)
    const docsSnap = await getDocs(competitionsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(comp => parseCompetition(comp) )
    }
    return result
  }
}

const firestore = new FirestoreService()
export default firestore