import { defineStore } from 'pinia'
import { Team, Project, UserProfile } from '@/types'
import firestore from '@/services/firestore'
import storage from '@/services/storage'
import log from '@/services/logger'

const MODULE_ID = 'store/teams'

interface State {
  list: Team[] | null,
  projects: { [key:string] : Project[] }
}

export const useTeamsStore = defineStore('teams', {
  state: (): State => ({
    list: null,
    projects: {}
  }),
  actions: {
    async fetchList():Promise<void> {
      try { 
        this.list = await firestore.getTeams()
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
    },
    async getTeamById(team_id:string):Promise<Team|undefined> {
      try {
        let team = this.list && this.list.find(t => t.id === team_id)
        if (!team) {
          let response = await firestore.getTeam(team_id)
          this.list = this.list || []
          this.list.push(response)
          team = response
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
        const response = await firestore.saveTeam(team) as Team
        team = { ...team, ...response }
        if (avatar) {
          await this.saveTeamAvatar(team, avatar)
        }
        if (!this.list) {
          await this.fetchList()
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
        return await firestore.deleteTeam(team)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#deleteTeam > ' + message)
      }
    },
    async saveTeamProject(team:Team, project:Project):Promise<Project|undefined> {
      try {
        project.team_id = team.id
        let response = await firestore.saveProject(project)
        project = {...project, ...response}
        if (!this.projects[team.id]) {
          await this.getTeamProjects(team)
        }
        else {
          this.projects[team.id].push(project)
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
        project.team_id = team.id
        let response = await firestore.deleteProject(project)
        if (this.projects[team.id]) {
          this.projects[team.id] = this.projects[team.id].filter(p => p.id !== project.id)
        }
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#deleteTeamProject > ' + message)
      }
    },
    async getTeamProjects(team:Team):Promise<Project[]|undefined> {
      try {
        let result = this.projects[team.id]
        if (!result) {
          let response = await firestore.getTeamProjects(team) as Project[]
          result = this.projects[team.id] = response
        }
        return result
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#getTeamProjects > ' + message)
      }
    },
    async saveTeamAvatar(team:Team, avatar:File):Promise<void> {
      try {
        const filename = 'avatar_' + avatar.name
        const response = await storage.saveTeamFile(team, avatar, filename)
        team.avatar_url = response
        team.avatar_filename = filename
        await this.saveTeam(team)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveTeamAvatar > ' + message)
      }
    },
    async removeTeamAvatar(team:Team):Promise<void> {
      try {
        const avatar_response = await storage.removeTeamFileWithName(team, team.avatar_filename)
        team.avatar_url = ''
        team.avatar_filename = ''
        await this.saveTeam(team)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#removeTeamAvatar > ' + message)
      }
    }
  }
})