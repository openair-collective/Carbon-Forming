import { defineStore } from 'pinia'
import { Competition } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/competition'

interface CompetionState {
  list: Array<Competition>
}

export const useCompetitionsStore = defineStore('competitions', {
  state: (): CompetionState => ({
    list: [] as Competition[],
  }),
  actions: {
    async fetchList():Promise<void> {
      try {
        const response = await firestore.competitions()
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
    }
  }
})