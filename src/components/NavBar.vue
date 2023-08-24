<template>
  <nav class="navbar is-black is-spaced" role="navigation" aria-label="main navigation">
    <div class="container is-max-widescreen">
      <div class="navbar-brand">
        <div class="navbar-item">
          <h1 class="title is-4 is-uppercase pr-4">
            <router-link :to="{ name: 'home'}">
              Carbon Crowd
            </router-link>
          </h1>
        </div>
        <a role="button" 
          class="navbar-burger"
          :class="{ 'is-active': mobileMenuActive}"
          aria-label="menu"
          :aria-expanded="mobileMenuActive"
          data-target="mainNavbar"
          @click="mobileMenuActive = !mobileMenuActive"
          >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div id="mainNavbar" class="navbar-menu is-black" :class="{ 'is-active': mobileMenuActive}">
        <div class="navbar-start">
          <router-link :to="{ name: 'home' }" class="navbar-item button is-black">Home</router-link>
          <router-link :to="{ name: 'about' }" class="navbar-item button is-black">About</router-link>
          <a 
            href="https://openaircollective.cc/event/carbon-crowd-epiphyte-build-1-hello-world/2023-08-23/"
            class="navbar-item button is-black"
          >
            Calendar
          </a>
          <a href="https://www.bonfire.com/store/oamission-merch/" class="navbar-item button is-black">Merch</a>
          <a href="https://www.youtube.com/playlist?list=PL1je2pACUAbIQH3p2NlbSvzjWCoRUqxOC" class="navbar-item button is-black">YouTube</a>
        </div>
        <div v-if="isAuthenticated" class="navbar-end">
          <div class="navbar-item">
            <button @click="logout" class="button is-primary is-small">Logout</button>
          </div>
          <div class="navbar-item is-hidden-touch" v-if="profile">
            <div class="image image--avatar is-32x32" 
              :data-role="userStore.role" 
              :data-id="userStore.profile && userStore.profile.id"
            >
              <img class="is-rounded" :src="profile.avatar" />
            </div>
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
  data() {
    return {
      mobileMenuActive:false,
      activeTeamRoute: false,
      activeCompRoute: false
    }
  },
  computed: {
    ...mapStores(useUserStore, useFlashStore),
    ...mapState(useUserStore, ['profile', 'isAuthenticated'])
  },
  methods: {
    logout() {
      this.userStore.logout()
        .then(() => {
          this.$router.push({'name': 'home'})
            .then(() => {
              this.flashStore.$patch({ message: 'You have been logged out.', level: LogLevel.success })
            })
      })
    }
  }
})
</script>

<style scoped lang="scss">
.navbar.is-spaced {
  padding: 1rem 0;
}
.navbar > .container {
  padding-right: calc($gap / 2);
  padding-left: calc($gap / 2);
}
.navbar-brand a,
.navbar-brand a:visited {
  color: $white;
}
.image--avatar img {
  max-height: none;
}
.navbar-menu {
  background-color: $black;
}
.navbar.is-black .navbar-menu.is-active {
  border-bottom: 1px solid $grey-dark;
  .navbar-start > a.navbar-item,
  .navbar-start > a.navbar-item:hover {
    margin-right: 0;
    margin-bottom: .5rem;
  }
}
.navbar.is-black .navbar-start > a.navbar-item,
.navbar.is-black .navbar-start > a.navbar-item:visited {
  margin-right: 1rem;
  color:$primary;
  font-weight: 700;
}
.navbar.is-black .navbar-end button {
  color:$black;
  font-weight: 700;
}
</style>