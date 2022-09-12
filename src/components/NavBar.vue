<template>
  <nav class="navbar is-light is-expanded" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item">
        <h1 class="title is-4">
          <router-link :to="{ name: 'root'}">
            Carbon Forming
          </router-link>
        </h1>
      </div>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start"></div>
      <div v-if="profile" class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <button @click="logout" class="button is-text">Logout</button>
          </div>
        </div>
        <div class="navbar-item">
          <div class="image image--avatar is-48x48">
            <img class="is-rounded" :src="profile.avatar" />
          </div>
        </div>
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
    ...mapState(useUserStore, ['profile'])
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
  .image--avatar img {
    max-height: none;
  }
</style>