<template>
  <main>
    <section class="p-4">
      <div v-if="error">
        <h1 class="title is-1">Uh oh.</h1>
        <div v-if="error">{{ error }}</div>
      </div>
      <div v-else>
        <h1 class="title is-3">Logging you in...</h1>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { auth as authRef } from '@/services/firebase'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'

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
    ...mapState(useUserStore, ['profile', 'oauth']),
    ...mapStores(useUserStore),
  },
  mounted() {
    let unsubscribe = authRef.onAuthStateChanged(user => {
      if (user) {
        this.userStore.fetchUser(user.uid, user.photoURL || '')
          .then(result => {
            this.$router.push({ name: 'root'})
          })
          .catch(error => {
            this.error = 'There was an issue with your login <PROMPT FOR LOGIN>'
          })
      }
    })
    if (this.code && this.state) {
      this.userStore.exchangeToken(this.code, this.state)
    }
    else if (this.oauth && this.profile) {
      unsubscribe()
      this.$router.push({ name: 'root'})
    }
    else if (!this.oauth && !this.profile) {
      unsubscribe()
      this.$router.push({ name: 'login' })
    }
  }
})

</script>

<style scoped>
</style>