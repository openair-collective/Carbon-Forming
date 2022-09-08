import { defineStore } from 'pinia'
import { Team, Project } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/teams'

interface State {
  list: Array<Team> | null
}

export const useTeamsStore = defineStore('teams', {
  state: (): State => ({
    list: null
  }),
  actions: {
    async fetchList():Promise<void> {
      try { 
        const response = await firestore.teams()
        this.list = response as Team[]
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
    },
    async getTeamProjects(team:Team):Promise<Project[]|undefined> {
      try {
        const response = await firestore.competitionProjects(team.id)
        return response
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getTeamProjects > ' + message)
      }
    }
  }
})