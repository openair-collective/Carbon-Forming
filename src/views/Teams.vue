<template>
  <div class="teams">
    <aside class="aside has-background-grey-light">
      <h1 class="title is-6 px-4 my-2">My Teams</h1>
      <div class="has-text-centered">
        <ul v-if="teams.length">
          <li 
            v-for="(team, i) in teams"
            :key="i"
          >
            <router-link class="button is-text" :to="{ name: 'teams', params: { id: team.id } }">
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
    </aside>
    <article class="article">
      <team-component :team="selectedTeam" />
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { Team } from '@/types'
import TeamComponent  from '@/components/Team.vue'
import log from '@/services/logger'

const MODULE_ID ='views/teams'

export default defineComponent({
  components: { TeamComponent },
  data() {
    return {
      selectedTeam: undefined as Team|undefined
    }
  },
  computed: {
    ...mapState(useUserStore, ['teams'])
  },
  mounted() {
    let id = this.$route.params.id
    let team = this.teams.find(t => t.id === id)
    this.selectedTeam = team as Team
  },
  methods: {
    onCreateNewTeam() {
      return false
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
.router-link-exact-active.is-text {
  background-color: hsl(0, 0%, 96%);
}
</style>
