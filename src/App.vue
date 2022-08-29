<template>
  <nav-bar v-if="currentUser" />
  <article class="article">
    <router-view />
  </article>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { auth as authRef } from '@/services/firebase'
import log from './services/logger'

const MODULE_ID = 'app'

export default defineComponent({
  name: "app",
  components: {
    NavBar
  },
  computed: {
    ...mapStores(useUserStore),
    ...mapState(useUserStore, ['currentUser'])
  },
  mounted() {
    authRef.onAuthStateChanged( user => {
      if (user) {
        log.info(MODULE_ID, 'user is authenticated')
      }
      else {
        log.info(MODULE_ID, 'user is not authenticated')
        this.userStore.logout()
        this.$router.push({'name': 'login'})
      }
    })
  }
})
</script>

<style scoped>
.article {
  padding: 2em;
}
</style>
