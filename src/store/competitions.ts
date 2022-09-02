import { defineStore } from 'pinia'
import { Competition } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/competition'

interface CompetionState {
  list: Array<Competition> | null
}

export const useCompetitionsStore = defineStore('competitions', {
  state: (): CompetionState => ({
    list: null,
  }),
  actions: {
    async fetchList():Promise<Competition[]|null> {
      try { 
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