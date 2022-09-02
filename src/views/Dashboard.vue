<template>
  <section v-if="profile && guild" class="section" >
    <aside class="aside p-4 has-background-grey-light">
      <h1 class="title is-6">My Teams</h1>
      <ul v-if="teams.length ">
        <li v-for="(team, i) in teams" :key="i">
          <router-link :to="{ name: 'user-team', params: { id: profile.id, team_id: team.id } }">{{ team.name }}</router-link>
        </li>
      </ul>
      <hr/>
      <strong>Add a Team</strong>
      <team-form @team-saved="onTeamSaved" />
    </aside>
    <article class="article p-4">
      <router-view />
    </article>
  </section>
  <section v-else>
    Loading...
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import TeamForm from '@/components/TeamForm.vue'
import log from '@/services/logger'

const MODULE_ID ='views/team'

export default defineComponent({
  components: { TeamForm },
  data() {
    return {}
  },
  computed: {
    ...mapStores(useUserStore),
    ...mapState(useUserStore, ['profile', 'teams', 'guild'])
  },
  methods: {
    onTeamSaved(team:Team) {
      this.userStore.addTeam(team.id)
    },
    removeTeam(team:Team) {
      this.userStore.removeTeam(team.id)
    }
  }
})

</script>

<style scoped>
.section {
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
  min-height: calc(100vh - 56px);
}
</style>
