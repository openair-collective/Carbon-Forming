import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/const"
import {  
  getDownloadURL, 
  getStorage,
  connectStorageEmulator,
  deleteObject,
  ref,
  uploadBytes,
} from "firebase/storage"
import { Team, Project } from '@/types'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
const storage = getStorage()

if (import.meta.env.DEV) {
  connectStorageEmulator(storage, "localhost", 9199)
}

class FirebaseService {

  async saveTeamFile(team:Team, file:File, filename?:string):Promise<string> {
    const storageRef = ref(storage, `teams/${team.id}/${filename || file.name}`)
    return uploadBytes(storageRef, file)
            .then(result => getDownloadURL(storageRef))
  }

  async removeTeamFileWithName(team:Team, filename:string):Promise<void> {
    const storageRef = ref(storage, `teams/${team.id}/${filename}`)
    return deleteObject(storageRef)
  }

  async saveProjectFile(project:Project, file:File, filename?:string):Promise<string> {
    const storageRef = ref(storage, `projects/${project.id}/${filename || file.name}`)
    return uploadBytes(storageRef, file)
            .then(result => getDownloadURL(storageRef))
  }

  async removeProjectFileWithName(project:Project, filename:string):Promise<void> {
    const storageRef = ref(storage, `projects/${project.id}/${filename}`)
    return deleteObject(storageRef)
  }
}

const firebase = new FirebaseService()
export default firebase