import { defineStore } from 'pinia'
import { Team, Project } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'
import { looseIndexOf } from '@vue/shared'

const MODULE_ID = 'store/teams'

interface State {
  list: Team[] | undefined,
  projects:{ [key:string] : Project[] }
}

export const useTeamsStore = defineStore('teams', {
  state: (): State => ({
    list: undefined,
    projects: {}
  }),
  getters: {
    getTeamById: (state) => {
      return (teamId:string) => state.list?.find((team:Team) => team.id === teamId)
    },
    getTeamsByMemberId: (state) => {
      return (memberId:string) => state.list?.filter((team:Team) => team.members[memberId])
    }
  },
  actions: {
    async fetchList():Promise<void> {
      try { 
        const response = await firestore.getTeams()
        this.list = response as Team[]
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchList > ' + message)
      }
    },
    async saveTeam(team:Team):Promise<Team|undefined> {
      try {
        const result = await firestore.saveTeam(team) as Team
        team = { ...team, ...result }
        if (!this.list) {
          this.list = [team]
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
          this.projects[team.id] = [project]
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
    }
  }
})