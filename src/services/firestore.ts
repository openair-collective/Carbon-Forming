import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/consts"
import { UserProfile, Team, Project, Competition } from "@/types"
import { TeamRole } from "@/enums"
import { 
  getFirestore,
  addDoc,
  getDoc,
  setDoc,
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
import {
  teamConverter,
  projectConverter,
  compConverter
} from '@/services/firestore_converters'

const MODULE_ID = 'services/firestore'
const KEY_USERS = 'users'
const KEY_TEAMS = 'teams'
const KEY_PROJECTS = 'projects'
const KEY_COMPETITIONS = 'competitions'
const KEY_COMP_PROJECTS = 'competition_projects'
const KEY_TEAM_PROJECTS = 'team_projects'
const KEY_AGGREGATES = 'aggregates'
const AGGREGATE_ID_COMPS = 'competitions'

export const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
export const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
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
      collection(db, KEY_TEAMS).withConverter(teamConverter),
      where(`members.${user.id}`, '!=', null),
    )
    const snap = await getDocs(q)
    if (snap.size) {
      result = snap.docs.map(team => team.data() as Team)
    }
    result.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    return result
  }

  async addTeamToUser(team:Team, user:UserProfile, role:TeamRole=TeamRole.default):Promise<void> {
    if (team.id) {
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
    else {
      throw new Error(`${MODULE_ID} #addTeamToUser > Team instance must have an id `)
    }
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
      const ref = doc(db, KEY_TEAMS, team.id).withConverter(teamConverter)
      await setDoc(ref, team, { merge: true })
    }
    else {
      const ref = collection(db, KEY_TEAMS).withConverter(teamConverter)
      const docRef = await addDoc(ref, team)
      team.id = docRef.id
    }
    return result
  }

  async deleteTeam(team:Team):Promise<void> {
    if (team.id) {
      // firestore triggers update/deletion of Team relationships
      const teamsRef = doc(db, KEY_TEAMS, team.id)
      await deleteDoc(teamsRef)
    }
    else {
      throw new Error(`${MODULE_ID} #deleteTeam > Team instance must have an id`)
    }
  }

  async getTeam(team_id:string):Promise<Team> {
    const teamRef = doc(db, KEY_TEAMS, team_id).withConverter(teamConverter)
    const team = await getDoc(teamRef)
    return team.data() as Team
  }

  async getTeams(after?:Team):Promise<Team[]> {
    let result = [] as Team[]
    const teamsRef = collection(db, KEY_TEAMS).withConverter(teamConverter)

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
    const snap = await getDocs(q)
    if (snap.size) {
      result = snap.docs.map(team => team.data() as Team)
    }
    return result
  }

  async saveProject(project:Project):Promise<Project> {
    // avoid recursively saving projects on embedded associations
    if (!project.team) {
      throw new Error(`${MODULE_ID} #saveProject - The Project instance must be associated with a Team`)
    }
    if (!project.competition) {
      throw new Error(`${MODULE_ID} #saveProject - The Project instance must be associated with a Competition`)
    }
    if (project.id) {
      const ref = doc(db, KEY_PROJECTS, project.id).withConverter(projectConverter)
      await setDoc(ref, project, { merge: true })
    }
    else {
      // adding a new instawnce
      const colRef = collection(db, KEY_PROJECTS).withConverter(projectConverter)
      const docRef = await addDoc(colRef, project)
      project.id = docRef.id
      // immediately add to project aggregates
      const batch = writeBatch(db)
      const teamProjectsRef = doc(db, KEY_TEAM_PROJECTS, project.team.id)
      batch.set(teamProjectsRef, {
          [`${project.id}`]: Object.assign({ id: project.id }, project)
        }, 
        { merge: true }
      )
      const compProjectsRef = doc(db, KEY_COMP_PROJECTS, project.competition.id)
      batch.set(compProjectsRef, {
          [`${project.id}`]: Object.assign({ id: project.id }, project)
        }, 
        { merge: true }
      )
      await batch.commit()
    }
    return project
  }

  async deleteProject(project:Project):Promise<void> {
    // firestore triggers update/deletion of project relationships
    if (project.id) {
      const projetRef = doc(db, KEY_PROJECTS, project.id)
      await deleteDoc(projetRef)
    }
    else {
      throw new Error(`${MODULE_ID} #deleteProject > Project instance must have an id`)
    }
  }

  async getProject(project_id:string):Promise<Project> {
    const projectRef = doc(db, KEY_PROJECTS, project_id).withConverter(projectConverter)
    const project = await getDoc(projectRef)
    return project.data() as Project
  }

  async getProjects():Promise<Project[]> {
    let result = [] as Project[]
    const ref = collection(db, KEY_PROJECTS).withConverter(projectConverter)
    const docsSnap = await getDocs(ref)
    if (docsSnap.size) {
      result = docsSnap.docs.map(project => project.data() as Project)
    }
    return result
  }

  async getTeamProjects(team:Team):Promise<Project[]> {
    if (team.id) {
      let result = [] as Project[]
      const ref = doc(db, KEY_TEAM_PROJECTS, team.id)
      const snap = await getDoc(ref)
      const data = snap.data()
      if (data) {
        result = Object.values(data) as Project[]
        result.sort((a,b) => a.name.localeCompare(b.name))
      }
      return result
    }
    else {
      throw new Error(`{MODULE_ID} #getTeamProjects > Team instance must have an id`)
    }
  }

  async getCompetitionProjects(comp:Competition):Promise<Project[]> {
    if (comp.id) {
      let result = [] as Project[]
      const ref = doc(db, KEY_COMP_PROJECTS, comp.id)
      const snap = await getDoc(ref)
      const data = snap.data()
      if (data) {
        result = Object.values(data) as Project[]
      }
      return result
    }
    else {
      throw new Error(`{MODULE_ID} #getCompetitionProjects > Competition instance must have an id`)
    }
  }

  async saveCompetition(comp:Competition):Promise<Competition> {
    if (comp.id) {
      const ref = doc(db, KEY_COMPETITIONS, comp.id).withConverter(compConverter)
      await setDoc(ref, comp, { merge: true })
    }
    else {
      const colRef = collection(db, KEY_COMPETITIONS).withConverter(compConverter)
      let docRef = await addDoc(colRef, comp)
      comp.id = docRef.id
    }
    return comp
  }

  async deleteCompetition(comp:Competition):Promise<void> {
    // firestore triggers update/deletion of competition relationships
    if (comp.id) {
      const compRef = doc(db, KEY_COMPETITIONS, comp.id)
      await deleteDoc(compRef)
    }
    else {
      throw new Error(`{MODULE_ID} #deleteCompetition > Competition instance must have an id`)
    }
  }

  async getCompetition(comp_id:string):Promise<Competition> {
    const compRef = doc(db, KEY_COMPETITIONS, comp_id).withConverter(compConverter)
    const comp = await getDoc(compRef)
    return comp.data() as Competition
  }

  async getCompetitionList():Promise<Competition[]> {
    let result = [] as Competition[]
    const compsRef = doc(db, KEY_AGGREGATES, AGGREGATE_ID_COMPS)
    const snap = await getDoc(compsRef)
    if (snap.exists()) {
      let list = snap.data() as { [key:string]: Competition}
      let keys = Object.keys(list)
      result = keys.map(k => {
        return { ...{id: k}, ...list[k] } as Competition
      })
    }
    return result
  }

  async getCompetitions(after?:Competition):Promise<Competition[]> {
    let result = [] as Competition[]
    const competitionsRef = collection(db, KEY_COMPETITIONS).withConverter(compConverter)
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
    const snap = await getDocs(q)
    if (snap.size) {
      result = snap.docs.map(comp => comp.data() as Competition)
    }
    return result
  }
}

const firestore = new FirestoreService()
export default firestore