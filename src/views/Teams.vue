<template>
  <div class="teams">
    <aside class="aside has-background-grey-light">
      <h1 class="title is-6 px-4 my-2">My Teams</h1>
      <div class="has-text-centered">
        <ul v-if="userTeams && userTeams.length">
          <li 
            v-for="(team, i) in userTeams"
            :key="i"
          >
            <router-link class="button is-text" :to="{ name: 'team-projects', params: { id: team.id } }">
              {{ team.name }}
            </router-link>
          </li>
        </ul>
        <button 
          class="button is-small is-info is-outlined my-4"
          @click="onCreateNewTeam"
        >
          Create New Team
        </button>
      </div>
      <hr/>
      <h1 class="title is-6 px-4 my-2">All Teams</h1>
      <ul v-if="otherTeams && otherTeams.length">
        <li 
          v-for="(team, i) in otherTeams"
          :key="i"
        >
          <router-link class="button is-text" :to="{ name: 'team-projects', params: { id: team.id } }">
            {{ team.name }}
          </router-link>
        </li>
      </ul>
    </aside>
    <article class="article">
      <team-component v-if="selectedTeam" :team="selectedTeam" />
      <div v-else>Loading...</div>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores, mapWritableState } from 'pinia'
import { Team } from '@/types'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import TeamComponent  from '@/components/Team.vue'
import log from '@/services/logger'

const MODULE_ID ='views/teams'

export default defineComponent({
  components: { TeamComponent },
  data() {
    return {
      selectedTeam:undefined as Team|undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore),
    ...mapState(useUserStore, ['profile']),
    ...mapState(useTeamsStore, ['list', 'getTeamsByMemberId']),
    userTeams():Team[] { 
      let result = [] as Team[]
      if (this.profile && this.list) {
        result = this.getTeamsByMemberId(this.profile.id) as Team[]
      }
      return result
    },
    otherTeams():Team[] {
      let result = this.list || []
      if (this.list && this.userTeams) {
        result = this.list.filter(t => this.userTeams.indexOf(t))
      }
      return result
    }
  },
  created() {
    if (this.list) {
      this.selectedTeam = this.userTeams && this.userTeams[0]
    }
    else {
      this.teamsStore.fetchList()
        .then(result => {
          if (this.list) {
            this.selectedTeam = this.userTeams && this.userTeams[0]
          }
        })
    }
  },
  methods: {
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
.router-link-active.is-text,
.router-link-exact-active.is-text {
  background-color: hsl(0, 0%, 96%);
}
</style>
