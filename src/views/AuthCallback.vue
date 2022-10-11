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
    if (this.error) return

    // setup a listener for Firebase Auth changes
    let unsubscribe = authRef.onAuthStateChanged(async user => {
      if (user) {
        try {
          await this.userStore.fetchUser(user.uid, user.photoURL || '')
          await this.userStore.fetchUserGuild()
          const userTeams = this.profile && this.profile.teams
          if (userTeams && !isEmpty(userTeams)) {
            let redirect = this.$route.query.redirect as string || '/my-teams'
            this.$router.replace({ path: redirect })
          }
          else {
            this.$router.replace({ name: 'onboarding'})
          }
        }
        catch(error) {
          unsubscribe()
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
            this.$router.replace({ name: 'login'})
              .then(() => {
                this.flashStore.$patch({
                  message: LOGIN_ERROR,
                  level: LogLevel.error
                })
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
    logout() {
      this.userStore.logout()
        .then(()=> {
          this.$router.replace({ name: 'login' })
        })
    }
  }
})

</script>

<style scoped>
</style>