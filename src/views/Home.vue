<template>
  <h1>Home</h1>
  <div v-if="guildError">
    <p>Warning: User is not an OpenAir guild member. Need to do some kind of redirect thing.</p>
  </div>
  <div v-else-if="profile && guild">
    <img :src="profile.avatar" />
    <br />
    <strong>Hello, {{ guild.user.username}}</strong>
    <hr/>
    <h2>Discord Role IDs</h2>
    <ul>
      <li v-for="role in guild.roles" :key="role">
        {{ role }}
      </li>
    </ul>
    <template v-if="profile">
    <hr/>
    <div v-if="teams.length">
      <h2>Your Team</h2>
      <ul v-if="teams.length ">
        <li v-for="(team, i) in teams" :key="i">
          <router-link :to="{ name: 'team', params: { id: team.id } }">{{ team.name }}</router-link> | 
          <button @click="removeTeam(team)">remove</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <strong>Create Your Team</strong>
      <team-form @team-saved="onTeamSaved" />
    </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import log from '@/services/logger'
import TeamForm from '@/components/TeamForm.vue'

const MODULE_ID ='views/home'

export default defineComponent({
  components: { TeamForm },
  data() {
    return {
      guildError: false
    }
  },
  computed: {
    ...mapStores(useUserStore),
    ...mapState(useUserStore, ['profile', 'oauth', 'teams', 'guild'])
  },
  mounted() {
    if (this.oauth) {
      if (!this.guild) {
        this.userStore.fetchUserGuild()
          .catch(error => {
            this.guildError = true
            log.info(MODULE_ID, 'User is not a valid OpenAir member. <PROMPT USER>')
          })
      }
      if (!this.teams) {
        this.userStore.fetchTeams()
          .catch(error => {
            log.info(MODULE_ID, error)
          })
      }
    }
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
</style>
