import { defineStore } from 'pinia'
import { Team, Project } from '@/types'
import firestore from '@/services/firestore'
import storage from '@/services/storage'
import { useProjectsStore } from '@/store/projects'
import log from '@/services/logger'
import { PAGING_SIZE } from '@/consts'

const MODULE_ID = 'store/teams'

interface State {
  list: Team[] | undefined
}

export const useTeamsStore = defineStore('teams', {
  state: (): State => ({
    list: undefined
  }),
  actions: {
    async fetch(after?:Team):Promise<Team[]|undefined> {
      try {
        let list_patch = this.list?.slice() || [] as Team[]
        let result = [] as Team[]
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
          result = await firestore.getTeams(after)
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
    async getTeamById(team_id:string):Promise<Team|undefined> {
      try {
        let team = this.list && this.list.find(t => t.id === team_id)
        if (!team) {
          let response = await firestore.getTeam(team_id)
          team = response
          let list_patch = this.list?.slice() || [] as Team[]
          list_patch.push(team)
          this.list = list_patch
        }
        return team
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
    },
    async saveTeam(team:Team, avatar?:File):Promise<Team|undefined> {
      try {
        let insert = !team.id
        const response = await firestore.saveTeam(team) as Team
        team = { ...team, ...response }
        if (avatar) {
          await this.saveTeamAvatar(team, avatar)
        }
        if (insert) {
          let list_patch = this.list?.slice() || []
          const team_before = list_patch.find(t => {
            return team.name > t.name
          })
          if (team_before) {
            let idx = list_patch.indexOf(team_before)
            list_patch.splice(idx, 0, team)
          }
          else {
            list_patch.push(team)
          }
          this.list = list_patch
        }
        return team
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveTeam > ' + message)
      }
    },
    async deleteTeam(team:Team):Promise<void> {
      try {
        await firestore.deleteTeam(team)
        this.list = this.list?.filter(t => t.id !== team.id)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#deleteTeam > ' + message)
      }
    },
    async fetchTeamProjects(team:Team):Promise<Project[]|undefined> {
      try {
        let response = await firestore.getTeamProjects(team)
        team.projects = response
        return team.projects
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchTeamProjects > ' + message)
      }
    },
    async getTeamProjectById(team:Team, project_id:string):Promise<Project|undefined> {
      try {
        if (!team.projects || !team.projects.length) {
          await this.fetchTeamProjects(team)
        }
        return team.projects ? team.projects.find(p => p.id === project_id) : undefined
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getTeamProjectById > ' + message)
      }
    },
    async saveTeamProject(team:Team, project:Project, design_doc?:File):Promise<Project|undefined> {
      try {
        project.team = team
        let response = await useProjectsStore().saveProject(project, design_doc)
        project = {...project, ...response}
        team.projects = team.projects || [project]
        let idx  = team.projects.indexOf(project)
        if (!idx) {
          team.projects.push(project)
        }
        return project
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveTeamProject > ' + message)
      }
    },
    async deleteTeamProject(team:Team, project:Project):Promise<void> {
      try {
        await firestore.deleteProject(project)
        if (team.projects) {
          let idx = team.projects.indexOf(project)
          if (idx !== -1) {
            team.projects = team.projects.splice(idx, 1)
          }
        }
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#deleteTeamProject > ' + message)
      }
    },
    async saveTeamAvatar(team:Team, avatar:File):Promise<Team|undefined> {
      try {
        const response = await storage.saveFile(avatar, team.id)
        team.avatar = response
        return await this.saveTeam(team)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveTeamAvatar > ' + message)
      }
    },
    async removeTeamAvatar(team:Team):Promise<Team|undefined> {
      try {
        if (team.avatar) {
          const avatar_response = await storage.removeFile(team.avatar)
          team.avatar = null
          return await this.saveTeam(team)
        }
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#removeTeamAvatar > ' + message)
      }
    }
  }
})