import { getApp, getApps, initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from "@/consts"
import {  
  getDownloadURL, 
  getStorage,
  connectStorageEmulator,
  deleteObject,
  ref,
  uploadBytes,
} from "firebase/storage"
import { Team, Project, FileUpload } from '@/types'

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG)
const storage = getStorage()

if (import.meta.env.DEV) {
  connectStorageEmulator(storage, "localhost", 9199)
}

class FirebaseService {

  async saveFile(file:File, dir:string=''):Promise<FileUpload> {
    const filename = `${Date.now()}.${file.name}`
    const path = `${dir}/${filename}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return { filename, url, path}
  }

  async removeFile(file:FileUpload):Promise<void> {
    const storageRef = ref(storage, file.path || file.filename)
    return deleteObject(storageRef)
  }
}

const firebase = new FirebaseService()
export default firebase