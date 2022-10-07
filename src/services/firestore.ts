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
  where,
  writeBatch,
  connectFirestoreEmulator,
  deleteField,
  deleteDoc,
  startAfter,
  orderBy,
  limit
} from "firebase/firestore" 
import { PAGING_SIZE } from "@/consts"

const MODULE_ID = 'services/firestore'
const KEY_USERS = 'users'
const KEY_TEAMS = 'teams'
const KEY_PROJECTS = 'projects'
const KEY_COMPETITIONS = 'competitions'
const KEY_COMP_PROJECTS = 'competition_projects'
const KEY_TEAM_PROJECTS = 'team_projects'

export const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
export const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

const TEAM_PARAMS_BLACKLIST = [ 'id', 'projects']

function team_params(team:Team):Team {
  const clone:Team = { ...team, ...{}}
  TEAM_PARAMS_BLACKLIST.forEach(key => delete clone[key as keyof Team])
  return clone
}

const PROJECT_PARAMS_BLACKLIST = [ 'id']

function project_params(project:Project):Project {
  const clone = { ...project, ...{}}
  PROJECT_PARAMS_BLACKLIST.forEach(key => delete clone[key as keyof Project])
  return clone
}

const COMP_PARAMS_BLACKLIST = [ 'id', 'projects']

function comp_params(comp:Competition):Competition {
  const clone = { ...comp, ...{}}
  COMP_PARAMS_BLACKLIST.forEach(key => delete clone[key as keyof Competition])
  return clone
}

const USER_PROFILE_PARAMS_BLACKLIST = [ 'id', 'avatar']

function user_profile_params(profile:UserProfile):UserProfile {
  const clone = { ...profile, ...{}}
  USER_PROFILE_PARAMS_BLACKLIST.forEach(key => delete clone[key as keyof UserProfile])
  return clone
}

class FirestoreService {

  async getUserProfile(id:string):Promise<UserProfile> {
    const ref = doc(db, KEY_USERS, id)
    const docSnap = await getDoc(ref)
    let data = docSnap.data() || {}
    return Object.assign(data, { id }) as UserProfile
  }

  async saveUserProfile(user:UserProfile):Promise<UserProfile> {
    let result = user
    const clone = user_profile_params(user)
    if (user.id) {
      let ref = doc(db, KEY_USERS, user.id)
      await setDoc(ref, clone, { merge: true })
    }
    else {
      const docRef = await addDoc(collection(db, KEY_USERS), clone)
      result = Object.assign(user, { id: docRef.id }) as UserProfile
    }
    return result
  }

  async getUserTeams(user:UserProfile):Promise<Team[]> {
    let result = [] as Team[]
    const q = query(
      collection(db, KEY_TEAMS), 
      where(`members.${user.id}`, '!=', null)
    )
    const snap = await getDocs(q)
    if (snap.size) {
      result = snap.docs.map(team => {
        return Object.assign({ id: team.id }, team.data()) as Team
      })
    }
    return result
  }

  async addTeamToUser(team:Team, user:UserProfile, role:TeamRole=TeamRole.default):Promise<void> {
    const batch = writeBatch(db)
    // save team ref to user.teams
    const userRef = doc(db, KEY_USERS, user.id)
    batch.set(userRef, { teams: {
        [`${team.id}`]: role
      }
    }, { merge: true })
    // save user to team to  team.members
    const teamRef = doc(db, KEY_TEAMS, team.id)
    batch.set(teamRef, { members: {
        [`${user.id}`]: role
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
    const clone = team_params(team)
    if (team.id) {
      const ref = doc(db, KEY_TEAMS, team.id)
      await setDoc(ref, clone, { merge: true })
    }
    else {
      const docRef = await addDoc(collection(db, KEY_TEAMS), clone)
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
    let data = team.data() || {}
    return Object.assign(data, { id: team.id }) as Team
  }

  async getTeams(after?:Team):Promise<Team[]> {
    let result = [] as Team[]
    const teamsRef = collection(db, KEY_TEAMS)

    let q
    if (after) {
      q = query(teamsRef, 
        orderBy("name"),
        startAfter(after.name),
        limit(PAGING_SIZE)
      )
    }
    else {
      q = query(teamsRef,
        orderBy("name"),
        limit(PAGING_SIZE)
      )
    }
    const docsSnap = await getDocs(q)
    if (docsSnap.size) {
      result = docsSnap.docs.map(team => {
        return Object.assign({ id: team.id }, team.data()) as Team
      })
    }
    return result
  }

  async saveProject(project:Project):Promise<Project> {
    let result = project
    const clone = project_params(project)
    // avoid recursively saving projects on parents
    if (clone.team) {
      delete clone.team.projects
    }
    if (clone.competition) {
      delete clone.competition.projects
    }
    if (project.id) {
      const ref = doc(db, KEY_PROJECTS, project.id)
      await updateDoc(ref, clone as object)
    }
    else {
      const docRef = await addDoc(collection(db, KEY_PROJECTS), clone)
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
    const projectRef = doc(db, KEY_PROJECTS, project_id)
    const project = await getDoc(projectRef)
    let data = project.data() || {}
    return Object.assign(data, { id: project.id }) as Project
  }

  async getProjects():Promise<Project[]> {
    let result = [] as Project[]
    const ref = collection(db, KEY_PROJECTS)
    const docsSnap = await getDocs(ref)
    if (docsSnap.size) {
      result = docsSnap.docs.map(project => Object.assign({ id: project.id }, project.data()) as Project)
    }
    return result
  }

  async getTeamProjects(team:Team):Promise<Project[]> {
    let result = [] as Project[]
    const ref = doc(db, KEY_TEAM_PROJECTS, team.id)
    const snap = await getDoc(ref)
    const data = snap.data()
    if (data) {
      result = Object.values(data) as Project[]
    }
    return result
  }

  async getCompetitionProjects(comp:Competition):Promise<Project[]> {
    let result = [] as Project[]
    const ref = doc(db, KEY_COMP_PROJECTS, comp.id)
    const snap = await getDoc(ref)
    const data = snap.data()
    if (data) {
      result = Object.values(data) as Project[]
    }
    return result
  }

  async saveCompetition(comp:Competition):Promise<Competition> {
    let result = comp
    const clone = comp_params(comp)
    if (comp.id) {
      const ref = doc(db, KEY_COMPETITIONS, comp.id)
      await setDoc(ref, clone, { merge: true })
    }
    else {
      let docRef = await addDoc(collection(db, KEY_COMPETITIONS), clone)
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
    return Object.assign({ id: comp.id }, comp.data()) as Competition
  }

  async getCompetitions(after?:Competition):Promise<Competition[]> {
    let result = [] as Competition[]
    const competitionsRef = collection(db, KEY_COMPETITIONS)
    let q
    if (after) {
      q = query(competitionsRef,
        orderBy("end_date"),
        orderBy("name"),
        startAfter(after.end_date, after.name),
        limit(PAGING_SIZE)
      )
    }
    else {
      q = query(competitionsRef,
        orderBy("end_date"),
        orderBy("name"),
        limit(PAGING_SIZE)
      )
    }
    const docsSnap = await getDocs(q)
    if (docsSnap.size) {
      result = docsSnap.docs.map(comp => {
        return Object.assign({ id: comp.id }, comp.data()) as Competition
      })
    }
    return result
  }
}

const firestore = new FirestoreService()
export default firestore