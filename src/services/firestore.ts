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
  query,
  runTransaction,
  where,
  writeBatch,
  connectFirestoreEmulator,
  deleteField,
} from "firebase/firestore"

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

class FirestoreService {

  async userProfile(uid:string):Promise<UserProfile> {
    const ref = doc(db, KEY_USERS, uid)
    const docSnap = await getDoc(ref)
    return Object.assign(docSnap.data() as UserProfile, {id: uid})
  }

  async saveUserProfile(user:UserProfile):Promise<void> {
    const clone = Object.assign({}, user)
    const blacklist:string[] = ['avatar', 'id']
    blacklist.forEach((prop) => {
      delete clone[prop as keyof UserProfile]
    })
    const ref = doc(db, KEY_USERS, user.id)
    await setDoc(ref, clone, { merge: true })
  }

  async userTeams(uid:string):Promise<Team[]> {
    const q = query(collection(db, KEY_TEAMS), where(`members.${uid}`, '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(team => Object.assign({ id: team.id }, team.data()) as Team)
  }

  async addTeamToUser(team_id:string, uid:string, role?:string):Promise<void> {
    const batch = writeBatch(db)
    // save team to user as team
    const userRef = doc(db, KEY_USERS, uid)
    batch.set(userRef, { teams: {
        [`${team_id}`]: role || 'default'
      }
    })
    // save user to team as a member
    const teamRef = doc(db, KEY_TEAMS, team_id)
    batch.set(teamRef, {
      members: {
        [`${uid}`]: true
      }
    }, { merge: true })
    await batch.commit()
  }

  async removeTeamFromUser(team_id:string, uid:string) {
    const batch = writeBatch(db)
    const userRef = doc(db, KEY_USERS, uid)
    batch.update(userRef, { teams: 
      {
        [`${team_id}`]: deleteField()
      }
    })
    const q = query(collection(db, KEY_TEAMS), where(`members.${uid}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.update(doc.ref, { members: 
        {
          [`${uid}`]: deleteField()
        }
      })
    })

    return await batch.commit()
  }

  async saveTeam(team:Team):Promise<Team> {
    let result = team
    var docRef
    if (team.id) {
      const ref = doc(db, KEY_TEAMS, team.id)
      const clone = Object.assign({}, team)
      delete clone['id' as keyof Team]
      docRef = await setDoc(ref, clone, { merge: true })
    }
    else {
      docRef = await addDoc(collection(db, KEY_TEAMS), team)
      result = Object.assign(team, { id: docRef.id }) as Team
    }
    return result
  }

  async deleteTeam(team_id:string):Promise<void> {

    const batch = writeBatch(db)

    // delete Team doc
    batch.delete(doc(db, KEY_TEAMS, team_id))

    // delete Team from User docs user/{user_id}/teams/{team_id}
    const usersQuery = query(collection(db, KEY_USERS), where(`teams.${team_id}`, '==', true))
    const usersSnap = await getDocs(usersQuery)
    usersSnap.forEach(doc => {
      batch.update(doc.ref, { teams: 
        {
          [`${team_id}`] : deleteField() 
        }
      })
    })
    // delete Projects that belong to the Team
    const projectsQuery = query(collection(db, KEY_PROJECTS), where(`${team_id}`, '==', true))
    const projectsSnap = await getDocs(projectsQuery)
    const projectIDs:string[] = []
    projectsSnap.forEach(doc => {
      projectIDs.push(doc.id)
      batch.delete(doc.ref)
    })
    // create update object for deleted projects
    const projectsUpdate = projectIDs.reduce((prev, value) => { 
      return {...prev, [value]: deleteField() }
    }, {})
    // delete Project references from Competitions
    const compsRef = query(collection(db, KEY_COMPETITIONS))
    const compsSnap = await getDocs(compsRef)
    compsSnap.forEach(doc => {
      batch.update(doc.ref, { projects: projectsUpdate })
    })

    return await batch.commit() 
  }

  async team(team_id:string):Promise<Team> {
    const teamRef = doc(db, KEY_TEAMS, team_id)
    const team = await getDoc(teamRef)
    return Object.assign({ id: team.id }, team.data()) as Team
  }

  async teams():Promise<Team[]> {
    let result = [] as Array<any>
    const teamsRef = collection(db, KEY_TEAMS)
    const docsSnap = await getDocs(teamsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(team => Object.assign({ id: team.id }, team.data()))
    }
    return result
  }

  async saveProject(project:Project):Promise<Project> {
    let result = project
    var docRef
    if (project.id) {
      const ref = doc(db, KEY_PROJECTS, project.id)
      const clone = Object.assign({}, project)
      delete clone['id' as keyof Project]
      docRef = await setDoc(ref, clone, { merge: true })
    }
    else {
      docRef = await addDoc(collection(db, KEY_TEAMS), project)
      result = Object.assign(project, { id: docRef.id }) as Project
    }
    return result
  }

  async deleteProject(project_id:string):Promise<void> {
    const batch = writeBatch(db)

    const projectRef = doc(db, KEY_PROJECTS, project_id)
    const projectDoc = await getDoc(projectRef)
    const projectData = projectDoc.data()
    // delete the Projecgt
    batch.delete(projectRef)

    // delete Project from Team 
    if (projectData && 'team_id' in projectData) {
      const teamRef = doc(db, KEY_TEAMS,projectData.team_id)
      batch.update(teamRef, { projects: 
        {
          [`${project_id}`] : deleteField()
        }
      })
    }

    // delete Project from all Competitions
    const compsQuery = query(collection(db, KEY_COMPETITIONS), where(`projects.${project_id}`, '==', true))
    const compsSnap = await getDocs(compsQuery)
    compsSnap.forEach(doc => {
      batch.update(doc.ref, { projects: 
        {
          [`${project_id}`]: deleteField() 
        }
      })
    })

    return await batch.commit() 
  }

  async project(project_id:string):Promise<Project> {
    const teamRef = doc(db, KEY_PROJECTS, project_id)
    const team = await getDoc(teamRef)
    return Object.assign({ id: team.id }, team.data()) as Project
  }

  async projects():Promise<Project[]> {
    let result = [] as Array<Project>
    const ref = collection(db, KEY_PROJECTS)
    const docsSnap = await getDocs(ref)
    if (docsSnap.size) {
      result = docsSnap.docs.map(comp => Object.assign({ id: comp.id }, comp.data()) as Project)
    }
    return result
  }

  async teamProjects(team_id:string):Promise<Project[]> {
    const q = query(collection(db, KEY_PROJECTS), where(`${team_id}`, '==', team_id))
    const snap = await getDocs(q)
    return snap.docs.map(project => Object.assign({ id: project.id }, project.data()) as Project)
  }

  async competitionProjects(comp_id:string):Promise<Project[]> {
    const q = query(collection(db, KEY_PROJECTS), where(`competitions.${comp_id}`, '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(project => Object.assign({ id: project.id }, project.data()) as Project)
  }

  async addProjectToCompetition(project_id:string, comp_id:string):Promise<void> {
    const batch = writeBatch(db)
    const projectRef = doc(db, KEY_PROJECTS, project_id)
    batch.set(projectRef, { competitions: 
      {
        [`${comp_id}`]: true
      }
    })
    const compRef = doc(db, KEY_PROJECTS, comp_id)
    batch.set(compRef, { projects: 
      {
        [`${project_id}`]: true
      }
    }, { merge: true })
    await batch.commit()
  }

  async removeProjectFromCompetitions(project_id:string, comp_id:string):Promise<void> {
    const batch = writeBatch(db)
    const projectRef = doc(db, KEY_PROJECTS, project_id)
    batch.update(projectRef, { competitions: 
      {
        [`${comp_id}`]: deleteField() 
      }
    })
    const q = query(collection(db, KEY_COMPETITIONS), where(`projects.${project_id}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.update(doc.ref, { projects: 
        {
          [`${project_id}`] : deleteField()
        }
      })
    })

    return await batch.commit()
  }

  async saveCompetition(comp:Competition):Promise<Competition> {
    let result = comp
    var docRef
    if (comp.id) {
      const ref = doc(db, KEY_COMPETITIONS, comp.id)
      const clone = Object.assign({}, comp)
      delete clone['id' as keyof Competition]
      docRef = await setDoc(ref, comp, { merge: true })
    }
    else {
      docRef = await addDoc(collection(db, KEY_COMPETITIONS), comp)
      result = Object.assign(comp, { id: docRef.id }) as Competition
    }
    return result
  }

  async deleteCompetition(comp_id:string):Promise<void> {
    const batch = writeBatch(db)

    // delete Comp doc
    batch.delete(doc(db, KEY_COMPETITIONS, comp_id))

    // delete Comps from Project docs project/{project_id}/competitions/{comp_id}
    const q = query(collection(db, KEY_PROJECTS), where(`competitions.${comp_id}`, '==', true))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      batch.update(doc.ref, { competitions: 
        {
          [`${comp_id}`]: deleteField()
        }
      })
    })

    return await batch.commit() 
  }

  async competition(comp_id:string):Promise<Competition> {
    const teamRef = doc(db, KEY_COMPETITIONS, comp_id)
    const team = await getDoc(teamRef)
    return Object.assign({ id: team.id }, team.data()) as Competition
  }

  async competitions():Promise<Competition[]> {
    let result = [] as Array<Competition>
    const competitionsRef = collection(db, KEY_COMPETITIONS)
    const docsSnap = await getDocs(competitionsRef)
    if (docsSnap.size) {
      result = docsSnap.docs.map(comp => Object.assign({ id: comp.id }, comp.data()) as Competition)
    }
    return result
  }
}

const firestore = new FirestoreService()
export default firestore