import { defineStore } from 'pinia'
import { Team, Project } from '@/types'
import firestore from '@/services/firestore'
import storage from '@/services/storage'
import { useProjectsStore } from '@/store/projects'
import log from '@/services/logger'

const MODULE_ID = 'store/teams'

interface State {
  list: Team[] | null
}

export const useTeamsStore = defineStore('teams', {
  state: (): State => ({
    list: null
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
        await this.fetchList()
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
        if (!team.projects) {
          await this.fetchTeamProjects(team)
        }
        return team.projects.find(p => p.id === project_id)
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
        let idx = team.projects.indexOf(project)
        team.projects = team.projects.splice(idx, 0)
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
          team.avatar = undefined
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