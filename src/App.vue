<template>
  <template v-if="userStore.isAuthenticated">
    <nav-bar />
    <main class="main">
      <div class="sidebar has-background-grey-dark p-4">
        <router-link :to="{name: 'root'}" class="button is-small is-fullwidth" >Teams</router-link>
        <br/>
        <router-link :to="{name: 'competitions'}" class="button is-small is-fullwidth">Competitions</router-link>
      </div>
      <router-view class="content" />
    </main>
  </template>
  <template v-else>
    <router-view />
  </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import log from '@/services/logger'

const MODULE_ID = 'app'

export default defineComponent({
  name: "app",
  components: {
    NavBar
  },
  data() {
    return {
      guildError: false
    }
  },
  computed: {
    ...mapStores(useUserStore)
  }
})
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
}
.sidebar {
  width: 88px;
  flex:0 1 auto;
  order: 1;
}
.content {
  flex: 2;
  order: 2;
  min-height: calc(100vh - 56px);
}
</style>
