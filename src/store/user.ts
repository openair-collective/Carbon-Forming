import { defineStore } from 'pinia'
import auth from '@/services/auth'
import discord from '@/services/discord'
import firebase from '@/services/firebase'
import log from '@/services/logger'

export declare interface User {
  firebase_access_token:string
  discord_access_token:string
  discord_id:string
  avatar:string
  guild?:Guild
}

export declare interface Guild {
  id:string,
  roles:Array<string>
  user: {
    username: string
  }
}

const MODULE_ID = 'store/user'
const KEY_OAUTH_USER = 'user'
let localUser = localStorage.getItem(KEY_OAUTH_USER)

interface UserState {
  currentUser: User | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: localUser ? JSON.parse(localUser) as User : null,
  }),
  actions: {
    login() {
      return auth.login()
    },
    logout():Promise<any> {
      return auth.logout()
        .then(() => firebase.logout)
        .then(() => {
          localStorage.removeItem(KEY_OAUTH_USER)
          this.currentUser = null
        })
    },
    async exchangeToken(code:string, status:string):Promise<User|null> {
      try { 
        const response = await auth.exchangeToken(code, status)
        localStorage.setItem(KEY_OAUTH_USER, JSON.stringify(response))
        this.currentUser = response as User
        firebase.login(this.currentUser.firebase_access_token)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#exchangeToken > ' + message)
      }
      return this.currentUser
    },
    async fetchUserGuild():Promise<Guild|null> {
      let result = null
      if (this.currentUser) {
        try {
          const response = await discord.userGuildMember(this.currentUser.discord_access_token)
          this.currentUser.guild = response as Guild
          localStorage.setItem(KEY_OAUTH_USER, JSON.stringify(this.currentUser))
          result = this.currentUser.guild
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#fetchUserGuild > ' + message)
        }
      }
      else {
        throw new Error('User must be logged in')
      }
      return result
    }
  }
})