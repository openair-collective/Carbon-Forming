<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item">
        <h1>Carbon Forming</h1>
      </div>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link :to="{name: 'home'}" class="navbar-item" >Home</router-link>
        <router-link 
          v-if="currentUser"
          :to="{name: 'competitions'}" 
          class="navbar-item"
        >
            Competitions
        </router-link>
      </div>
      <div v-if="currentUser" class="navbar-end">
        <button @click="logout" class="navbar-item" >Logout</button>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import auth from '@/services/auth'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'

export default defineComponent({
  name: "nav-bar",
  computed: {
    ...mapStores(useUserStore),
    ...mapState(useUserStore, ['currentUser'])
  },
  methods: {
    logout() {
      this.userStore.logout().then(result => {
        this.$router.push({'name': 'login'})
      })
    }
  }
})
</script>

<style scoped>
.navbar {
  background-color: #eee;
  min-height: 3.25rem;
  position: relative;
  z-index: 30;
  align-items: stretch;
  display: flex;
}
.navbar a {
  text-decoration: none;
}
.navbar a.router-link-active {
  background-color: white;
}
.navbar-brand {
  align-items: stretch;
  display: flex;
  flex-shrink: 0;
  min-height: 3.25rem;
}
.navbar-brand h1 {
  margin: 0;
}
.navbar-menu {
  flex-grow: 1;
  flex-shrink: 0;
  align-items: stretch;
  display: flex;
}
.navbar-start {
  justify-content: flex-start;
  margin-right: auto;
  align-items: stretch;
  display: flex;
}
.navbar-item {
  color: #4a4a4a;
  display: flex;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  align-items: center;
  line-height: 1.5;
  padding: .5rem .75rem;
}
</style>