import { defineStore } from 'pinia'
import {OAuth, Team, User, Guild  } from '@/types'
import auth from '@/services/auth'
import discord from '@/services/discord'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'store/user'
const KEY_OAUTH = 'oauth'
let localOAuth = localStorage.getItem(KEY_OAUTH)

interface UserState {
  oauth: OAuth | null,
  currentUser: User | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    oauth: localOAuth ? JSON.parse(localOAuth) as OAuth : null,
    currentUser: null
  }),
  actions: {
    login() {
      return auth.login()
    },
    async logout():Promise<void> {
      localStorage.removeItem(KEY_OAUTH)
      this.oauth = null
      this.currentUser = null
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
        const response = await firestore.user(uid)
        response.id = uid
        response.avatar = photoUrl
        this.currentUser = response
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#fetchUser > ' + message)
      }
    },
    async fetchUserGuild():Promise<void> {
      if (this.oauth && this.oauth.discord_access_token && this.currentUser) {
        try {
          const response = await discord.userGuildMember(this.oauth.discord_access_token)
          this.currentUser.guild = response as Guild
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#fetchUserGuild > ' + message)
        }
      }
      else {
        throw new Error(`${MODULE_ID} #fetchUserGuild > User must be authenticated and fetched`)
      }
    }
  }
})