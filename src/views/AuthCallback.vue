<template>
  <section class="p-4">
    <loading />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { auth as authRef } from '@/services/firebase'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { isEmpty } from '@/utils/object'
import Loading from '@/components/Loading.vue'
import log from '@/services/logger'
import { LogLevel } from '@/enums'

const MODULE_ID = 'views/AuthCallback'
const LOGIN_ERROR = 'An unknown error occurred. Please try again.'
const GUILD_ERROR = 'Sorry, but it looks like you are not part of the OpenAir Discord guild. Click the link below to join.'

function getURLParameter(name:string): string | null {
  const url = window.location
  const params = new URLSearchParams(url.search)
  return params.get(name)
}

export default defineComponent({
  components: { Loading },
  data() {
    return {
      code: getURLParameter('code'),
      error: getURLParameter('error'),
      state: getURLParameter('state')
    }
  },
  computed: {
    ...mapState(useUserStore, ['profile', 'oauth']),
    ...mapStores(useUserStore, useFlashStore)
  },
  async created() {
    if (this.error) {
      this.logout({
        message: LOGIN_ERROR,
        level: LogLevel.error
      })
      return
    }

    // setup a listener for Firebase Auth changes
    let unsubscribe = authRef.onAuthStateChanged(async user => {
      if (user) {
        try {
          await this.userStore.fetchUser(user.uid, user.photoURL || '')
          await this.userStore.fetchUserGuild()
          if (!this.userStore.profile || !this.userStore.guild) {
            unsubscribe()
            this.logout({
              message: !this.userStore.profile ? LOGIN_ERROR : GUILD_ERROR,
              level: LogLevel.error
            })
          }
          else {
            const userTeams = this.profile && this.profile.teams
            if (userTeams && !isEmpty(userTeams)) {
              let redirect = this.$route.query.redirect as string || '/my-teams'
              this.$router.replace({ path: redirect })
            }
            else {
              this.$router.replace({ name: 'onboarding'})
            }
          }
        }
        catch(error) {
          let message = (error instanceof Error) ? error.message : String(error)
          log.error(MODULE_ID, '#created.authRef.onAuthStateChanged > ' + message)
          log.error(MODULE_ID, message)
        }
      }
      else {
        if (this.oauth) {
          // force a logout - something is wrong with our stored credentials
          unsubscribe()
          this.logout()
        }
      }
    })

    // complete the authentication process if code and state exist
    if (this.code && this.state) {
      this.userStore.exchangeToken(this.code, this.state)
        .then(result => {
          if (!this.oauth) {
            this.logout({
              message: LOGIN_ERROR,
              level: LogLevel.error
            })
          }
        })
    }
    else if(!this.oauth && !this.profile) {
      unsubscribe()
      this.logout()
    }
  },
  methods: {
    logout(message?:any):Promise<any> {
      return this.userStore.logout()
        .then(()=> {
          this.$router.replace({ name: 'login' })
            .then(()=> {
              if (message) {
                this.flashStore.$patch(message)
              }
            })
        })
    }
  }
})

</script>

<style scoped>
</style>