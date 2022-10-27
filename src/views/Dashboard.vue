<template>
  <div class="dashboard">
    <div class="sidebar is-flex is-flex-direction-column">
      <router-link 
        :to="{name: 'competitions'}"
        :class="{'router-link-active': activeCompRoute}"
      >
        Competitions
      </router-link>
      <router-link 
        :to="{name: 'teams'}"
        :class="{'router-link-active': activeTeamRoute}"
      >
        Teams
      </router-link>
      <br/>
    </div>
    <div class="content">
      <flash id="flash" />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Flash from '@/components/Flash.vue'
import log from '@/services/logger'

const MODULE_ID ='views/dashboard'

export default defineComponent({
  components: { Flash },
  data() {
    return {
      activeTeamRoute: false,
      activeCompRoute: false
    }
  },
  watch: {
    $route() {
      this.sidebarStateCheck()
    }
  },
  mounted() {
    this.sidebarStateCheck()
  },
  methods: {
    sidebarStateCheck() {
      const path = this.$route.path
      const chunks = this.$route.path.split('/')
      this.activeTeamRoute = chunks[1] === 'teams' || chunks[1] === 'my-teams'
      this.activeCompRoute = chunks[1] === 'competitions'
    }
  }
})

</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
}
.sidebar {
  width: 132px;
  flex:0 1 auto;
  order: 1;
}
.content {
  display: flex;
  flex-direction: column;
  flex: 2;
  order: 2;
}
.content > section,
.content > div {
  flex: 1 1 auto;
}

#flash {
  position: sticky;
  top: 0;
  right: 0;
  left: 132px;
  z-index: 3;
}
.sidebar {
  background-color: #1A1A1A;
}
.sidebar a,
.sidebar a:hover,
.sidebar a:visited {
  display: block;
  text-align: center;
  padding: 20px 0;
  color: #eeeeee;
}

.sidebar a.router-link-active,
.sidebar a.router-link-exact-active,
.sidebar a.router-link-active:hover,
.sidebar a.router-link-exact-active:hover,
.sidebar a.router-link-active:visited,
.sidebar a.router-link-exact-active:visited {
  background-color: #444444
}

</style>