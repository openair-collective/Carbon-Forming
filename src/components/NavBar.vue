<template>
  <nav class="navbar is-light is-expanded" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item">
        <h1 class="title is-4">
          <router-link :to="{ name: 'root'}">
            Carbon Hackers
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
      <div v-else class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link :to="{name: 'login'}" class="button is-text">
              Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { LogLevel } from '@/enums'

export default defineComponent({
  name: "nav-bar",
  computed: {
    ...mapStores(useUserStore, useFlashStore),
    ...mapState(useUserStore, ['profile'])
  },
  methods: {
    logout() {
      this.userStore.logout().then(result => {
        this.$router.push({'name': 'root'})
          .then(() => {
            this.flashStore.$patch({ message: 'You have been logged out.', level: LogLevel.success })
          })
      })
    }
  }
})
</script>

<style scoped>
.navbar .is-light {
  background-color: #D9D9D9;
}
.navbar-brand a,
.navbar-brand a:visited {
  color: #1A1A1A;
}
.navbar-brand a:hover {
  color: #707070
}
.image--avatar img {
  max-height: none;
}
</style>