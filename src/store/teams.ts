import { defineStore } from 'pinia'
import { Team } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/teams'

interface TeamState {
  list: Array<Team> | null
}

export const useTeamsStore = defineStore('teams', {
  state: (): TeamState => ({
    list: null,
  }),
  actions: {
    async fetchList():Promise<Team[]|null> {
      try { 
        const response = await firestore.teams()
        this.list = response as Team[]
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
      return this.list
    }
  }
})