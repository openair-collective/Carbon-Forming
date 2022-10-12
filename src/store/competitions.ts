import { defineStore } from 'pinia'
import { Competition, Project } from '@/types'
import firestore from '@/services/firestore'
import { PAGING_SIZE } from '@/consts'
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
    async fetch(after?:Competition):Promise<Competition[]|undefined> {
      try {
        let list_patch = this.list?.slice() || [] as Competition[]
        let result = [] as Competition[]
        let after_idx = after ? list_patch.indexOf(after) : 0
        // looking for range that is after_cursor + PAGE_LENGTH
        if (after_idx !== -1) {
          let start = after_idx + 1
          let end = start + PAGING_SIZE
          let sliced = list_patch.slice(start, end)
          if (sliced && sliced.length) {
            result = sliced
          }
        }
        if (!result.length) {
          result = await firestore.getCompetitions(after)
          list_patch.splice(after_idx + 1, 0, ...result)
          this.list = list_patch
        }
        return result
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetch > ' + message)
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
    async getCompetitionProjectById(comp:Competition, project_id:string):Promise<Project|undefined> {
      try {
        if (!comp.projects || !comp.projects.length) {
          await this.fetchCompetitionProjects(comp)
        }
        return comp.projects ? comp.projects.find(p => p.id === project_id) : undefined
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getCompetitionProjectById > ' + message)
      }
    },
    async saveCompetition(comp:Competition):Promise<Competition|undefined> {
      try {
        const insert = !comp.id
        const response = await firestore.saveCompetition(comp)
        comp = { ...comp, ...response }
        if (insert) {
          if (!this.list) {
            await this.fetch()
          }
          let list_patch = this.list?.slice() || []
          const comp_before = list_patch.find(c => {
            const isBeforeName = comp.name > c.name
            let isBeforeStart = false
            if (comp.start_date && c.start_date) {
              isBeforeStart = comp.start_date.seconds < c.start_date.seconds
            }
            return isBeforeName && isBeforeStart
          })
          if (comp_before) {
            let idx = list_patch.indexOf(comp_before)
            list_patch.splice(idx, 0, comp)
          }
          else {
            list_patch.push(comp)
          }
          this.list = list_patch
        }
        return comp
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveCompetition > ' + message)
      }
    },
    async getCompetitionById(comp_id:string):Promise<Competition|undefined> {
      try {
        let result = this.list ? this.list.find(c => c.id === comp_id) : null
        if(!result) {
          result = await firestore.getCompetition(comp_id)
        }
        return result
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getCompetitionById > ' + message)
      }
    }
  }
})