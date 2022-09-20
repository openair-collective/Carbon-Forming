<template>
  <section class="teams">
    <aside class="aside menu p-2 has-background-grey-light">
      <p class="menu-label">My Teams</p>
      <ul 
        v-if="userTeams && userTeams.length"
        class="menu-list"
      >
        <li 
          v-for="(team, i) in userTeams"
          :key="i"
        >
        <router-link :to="{ name: 'team-show', params: { id: team.id } }">
            {{ team.name }}
          </router-link>
        </li>
      </ul>
      <ul class="menu-list my-4">
        <li>
          <router-link 
            :to="{ name: 'teams-new'}"
            class="button is-small is-info is-outlined"
          >
            Create New Team
          </router-link>
        </li>
      </ul>
    </aside>
    <article class="article">
      <router-view  />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { mapState, mapStores } from 'pinia'
import { Team } from '@/types'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import log from '@/services/logger'

const MODULE_ID ='views/teams'

export default defineComponent({
  computed: {
    ...mapStores(useUserStore, useTeamsStore),
    ...mapState(useUserStore, { userTeams: 'teams' }),
    defaultTeam():Team|undefined {
      let result
      if (this.userTeams && this.userTeams.length) {
        result = this.userTeams[0]
      }
      return result
    }
  },
  beforeRouteUpdate(to) {
    if (to.name === 'teams') {
      this.showDefaultTeam()
    }
  },
  created() {
    if (!this.userTeams) {
      this.userStore.fetchTeams()
    }
  },
  mounted() {
    if (this.$route.name === 'teams') {
      if (this.userTeams && this.userTeams.length) {
        this.showDefaultTeam()
      }
      else {
        const unwatch = this.$watch('userTeams',(newVal:Team[]) => {
          if (newVal && newVal.length) {
            this.showDefaultTeam()
            unwatch()
          }
        })
      }
    }
  },
  methods: {
    showDefaultTeam() {
      if (this.defaultTeam) {
        this.$router.replace({ name: 'team-show', params: { id: this.defaultTeam.id }})
      }
    },
    onCreateNewTeam() {
      this.$router.push({ name: 'teams-new'})
    }
  }
})

</script>

<style scoped>
.teams {
  display: flex;
  flex-direction: row;
}
.aside {
  width: 176px;
  flex:0 1 auto;
  order: 1;
}
.article {
  flex: 2;
  order: 2;
}
.router-link-active,
.router-link-exact-active {
  background-color: hsl(0, 0%, 96%);
}
</style>
