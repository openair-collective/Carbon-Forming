import { defineStore } from 'pinia'
import { Competition, Project } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/competition'

interface State {
  list: Competition[] | undefined
}

export const useCompetitionsStore = defineStore('competitions', {
  state: (): State => ({
    list: undefined
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
    async fetchCompetitionProjects(comp:Competition):Promise<Project[]|undefined> {
      try {
        let response = await firestore.getCompetitionProjects(comp)
        comp.projects = response
        return comp.projects
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchCompetitionProjects > ' + message)
      }
    },
    async saveCompetition(comp:Competition):Promise<Competition|undefined> {
      try {
         const response = await firestore.saveCompetition(comp)
         comp = { ...comp, ...response }
         await this.fetchList()
         return comp
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveCompetition > ' + message)
      }
    },
    async getCompetitions(comp_ids?:string[]):Promise<Competition[]|undefined> {
      try {
        let result = [] as Competition[]
        if (this.list && comp_ids) {
            // see if we already have them cached locally
            this.list.forEach(comp => {
              if (comp.id && comp_ids.indexOf(comp.id) !== -1) {
                result.push(comp)
              }
            })
            // fetch comps we don't have cached
            if (result.length !== comp_ids.length) {
              const comps = result.filter(c => c.id && comp_ids.indexOf(c.id) == -1)
              const filtered = comps.map(c => c.id) as string[]
              if (filtered && filtered.length) {
                const response = await firestore.getCompetitionsById(filtered)
                result = result.concat(response)
              }
            }
        }
        else if (comp_ids) {
          const response = await firestore.getCompetitionsById(comp_ids)
          result = response
          if (!this.list) {
            this.list = response
          }
        }
        else {
          await this.fetchList()
          result = this.list || []
        }
        return result
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getCompetitionsByIds > ' + message)
      }
    }
  }
})