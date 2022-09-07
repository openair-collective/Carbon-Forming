import { defineStore } from 'pinia'
import {OAuth, Team, UserProfile, Guild  } from '@/types'
import auth from '@/services/auth'
import discord from '@/services/discord'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/user'
const KEY_OAUTH = 'oauth'
const KEY_GUILD = 'guild'
const localOAuth = localStorage.getItem(KEY_OAUTH)
const localGuild = localStorage.getItem(KEY_GUILD)

interface UserState {
  oauth: OAuth | null
  profile: UserProfile | null
  guild: Guild | null
  teams: Team[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    oauth: localOAuth ? JSON.parse(localOAuth) as OAuth : null,
    profile: null,
    guild: localGuild ? JSON.parse(localGuild) as Guild : null,
    teams: [] as Team[]
  }),
  getters: {
    isAuthenticated: (state):boolean => {
      let result = false
      if(state.oauth && state.profile && state.guild) {
        result = true
      }
      return result
    }
  },
  actions: {
    login() {
      return auth.login()
    },
    async logout():Promise<void> {
      localStorage.removeItem(KEY_OAUTH)
      localStorage.removeItem(KEY_GUILD)
      // need some kind of reset function here
      this.oauth = null
      this.profile = null
      this.guild = null
      this.teams = [] as Team[]
      return await auth.logout()
    },
    async exchangeToken(code:string, status:string):Promise<void> {
      try { 
        const tokens = await auth.exchangeToken(code, status)
        localStorage.setItem(KEY_OAUTH, JSON.stringify(tokens))
        this.oauth = tokens
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#exchangeToken > ' + message)
      }
    },
    async fetchUser(uid:string, photoUrl:string=''):Promise<void> {
      try {
        const response = await firestore.userProfile(uid)
        response.id = uid
        response.avatar = photoUrl
        this.profile = response as UserProfile
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchUser > ' + message)
      }
    },
    async fetchUserGuild():Promise<void> {
      if (this.oauth && this.oauth.discord_access_token) {
        try {
          if (!this.guild) {
            const response = await discord.userGuildMember(this.oauth.discord_access_token)
            localStorage.setItem(KEY_GUILD, JSON.stringify(response))
            this.guild = response as Guild
          }
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#fetchUserGuild > ' + message)
        }
      }
      else {
        throw new Error(`${MODULE_ID} #fetchUserGuild > User must be authenticated and profile fetched`)
      }
    },
    async fetchTeams():Promise<void> {
      if (this.oauth && this.profile) {
        try {
          this.teams = await firestore.userTeams(this.profile.id) as Team[]
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#fetchTeams > ' + message)
        }
      }
      else {
        throw new Error(`${MODULE_ID} #fetchTeams > User must be authenticated and profile fetched`)
      } 
    },
    async addTeam(team_id:string):Promise<void> {
      if (this.oauth && this.profile) {
        try {
          await firestore.addTeamToUser(team_id, this.profile.id)
          this.fetchTeams()
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#addTeam > ' + message)
        }
      }
      else {
        throw new Error(`${MODULE_ID} #addTeam > User must be authenticated and profile fetched`)
      } 
    },
    async removeTeam(team_id:string):Promise<void> {
      if (this.oauth && this.profile) {
        try {
          await firestore.removeTeamFromUser(team_id, this.profile.id)
          this.fetchTeams()
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#removeTeam > ' + message)
        }
      }
      else {
        throw new Error(`${MODULE_ID} #removeTeam > User must be authenticated and profile fetched`)
      } 
    }
  }
})