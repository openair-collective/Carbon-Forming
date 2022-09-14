<template>
  <section class="p-4">
    <div v-if="error">
      <h1 class="title is-1">Uh oh.</h1>
      <div v-if="error">{{ error }}</div>
    </div>
    <div v-else>
      <h1 class="title is-3">Logging you in...</h1>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { auth as authRef } from '@/services/firebase'
import { Team } from '@/types'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { isEmpty } from '@/utils/object'
import log from '@/services/logger'

const MODULE_ID = 'views/AuthCallback'

function getURLParameter(name:string): string | null {
  const url = window.location
  const params = new URLSearchParams(url.search)
  return params.get(name)
}

export default defineComponent({
  data() {
    return {
      code: getURLParameter('code'),
      error: getURLParameter('error'),
      state: getURLParameter('state')
    }
  },
  computed: {
    ...mapState(useUserStore, ['profile', 'oauth', 'isAuthenticated']),
    ...mapStores(useUserStore),
  },
  created() {
    if (this.error) return

    // setup a listener for Firebase Auth changes
    let unsubscribe = authRef.onAuthStateChanged(user => {
      if (user) {
        this.userStore.fetchUser(user.uid, user.photoURL || '')
          .then(result => this.userStore.fetchUserGuild())
          .then(result => {
            const userTeams = this.profile && this.profile.teams
            if (userTeams && !isEmpty(userTeams)) {
              let redirect = this.$route.query.redirect as string || '/'
              this.$router.replace({ path: redirect })
            }
            else {
              this.$router.replace({ name: 'onboarding'})
            }
          })
          .catch(error => {
            unsubscribe()
            log.error(MODULE_ID, error)
            this.error = 'There was an issue with your login <PROMPT FOR LOGIN>'
          })
      }
    })

    // complete the authentication process if code and state exist
    if (this.code && this.state) {
      this.userStore.exchangeToken(this.code, this.state)
    }
    else if(!this.oauth && !this.profile) {
      unsubscribe()
      this.userStore.logout()
        .then(()=> {
          this.$router.replace({name: 'login'})
        })
    }
  }
})

</script>

<style scoped>
</style>