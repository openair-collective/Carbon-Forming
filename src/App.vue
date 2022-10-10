<template>
  <nav-bar v-if="showNavBar"/>
  <main class="main">
    <router-view />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { mapState } from 'pinia'
import { useUserStore } from '@/store/user'
import log from '@/services/logger'

const MODULE_ID = 'app'

export default defineComponent({
  name: "app",
  components: {
    NavBar
  },
  computed: {
    ...mapState(useUserStore, ['isAuthenticated']),
    showNavBar():boolean {
      const name = this.$route.name
      return name !== 'login'
    }
  }
})
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
}
.main > div,
.main > section {
  flex: 2;
  min-height: calc(100vh - 56px);
}
</style>
