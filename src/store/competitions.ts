import { defineStore } from 'pinia'
import { Competition, Project } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/competition'

interface State {
  list: Array<Competition>
}

export const useCompetitionsStore = defineStore('competitions', {
  state: (): State => ({
    list: [] as Competition[],
  }),
  actions: {
    async fetchList():Promise<void> {
      try {
        const response = await firestore.getCompetitions()
        this.list = response as Competition[]
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
    },
    async saveCompetition(comp:Competition):Promise<void> {
      try {
        await firestore.saveCompetition(comp)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveCompetition > ' + message)
      }
    },
    async getCompetitionProjects(comp:Competition):Promise<Project[]|undefined> {
      try {
        const response = await firestore.getCompetitionProjects(comp)
        return response
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getCompetitionProjects > ' + message)
      }
    }
  }
})