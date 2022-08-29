import { defineStore } from 'pinia'
import firestore from '@/services/firestore'
import log from '@/services/logger'

export declare interface Competition {
  name:string,
  description:string,
  start:string
  end:string
}

const MODULE_ID = 'store/competition'

interface CompetionState {
  list: Array<Competition>
}

export const useCompetitionStore = defineStore('competition', {
  state: (): CompetionState => ({
    list: [],
  }),
  actions: {
    async fetchList():Promise<Competition[]> {
      try { 
        log.info(MODULE_ID, 'fetching competition list')
        const response = await firestore.competitions()
        this.list = response as Competition[]
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
      return this.list
    }
  }
})