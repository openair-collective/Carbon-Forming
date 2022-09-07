<template>
  <div class="dashboard">
    <div class="sidebar has-background-grey-dark p-4">
      <router-link :to="{name: 'root'}" class="button is-small is-fullwidth" >Teams</router-link>
      <br/>
      <router-link :to="{name: 'competitions'}" class="button is-small is-fullwidth">Competitions</router-link>
    </div>
    <router-view v-if="isAuthenticated" class="content" />
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import log from '@/services/logger'

const MODULE_ID ='views/dashboard'

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    ...mapStores(useUserStore),
    ...mapState(useUserStore, ['profile', 'teams', 'isAuthenticated'])
  },
  beforeRouteUpdate(to, from) {
    if (to.name === 'root') {
      this.selectDefaultTeam()
    }
  },
  mounted() {
    if (this.$route.name === 'root') {
      this.selectDefaultTeam()
    }
  },
  methods: {
    selectDefaultTeam() {
      const store = useUserStore()
      if (this.teams.length) {
        let team = this.teams[0]
        this.$router.replace({ name: 'teams', params: { id: team.id }})
      }
    },
    onCreateNewTeam() {
      return false
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
  flex: 2;
  order: 2;
}
</style>
