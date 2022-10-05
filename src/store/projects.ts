import { defineStore } from 'pinia'
import { Project } from '@/types'
import firestore from '@/services/firestore'
import storage from '@/services/storage'
import log from '@/services/logger'

const MODULE_ID = 'store/projects'

interface State {
  projects: { [key:Project['id']]: Project }
}

export const useProjectsStore = defineStore('projects', {
  state: (): State => ({
    projects: {}
  }),
  actions: {
    async saveProject(project:Project, design_doc?:File):Promise<Project|undefined> {
      try {
        const response = await firestore.saveProject(project)
        project = { ...project, ...response }
        if (design_doc) {
          await this.saveProjectDesignDoc(project, design_doc)
        }
        return project
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveProject > ' + message)
      }
    },
    async deleteProject(project:Project):Promise<void> {
      try {
        await firestore.deleteProject(project)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#deleteProject > ' + message)
      }
    },
    async saveProjectDesignDoc(project:Project, doc:File):Promise<Project|undefined> {
      try {
        const response = await storage.saveFile(doc, project.id)
        project.design_doc = response
        return await this.saveProject(project)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveProjectDesignDoc > ' + message)
      }
    },
    async removeProjectDesignDoc(project:Project):Promise<Project|undefined> {
      try {
        if (project.design_doc) {
          const avatar_response = await storage.removeFile(project.design_doc)
          project.design_doc = null
          return await this.saveProject(project)
        }
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#removeTeamAvatar > ' + message)
      }
    }
  }
})