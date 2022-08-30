<template>
  <h1>Home</h1>
  <div v-if="guildError">
    <p>Warning: User is not an OpenAir guild member. Need to do some kind of redirect thing.</p>
  </div>
  <div v-else-if="currentUser && currentUser.guild">
    <img :src="currentUser.avatar" />
    <br />
    <strong>Hello, {{ currentUser.guild.user.username}}</strong>
    <hr/>
    <strong>Discord Role IDs</strong>
    <ul>
      <li v-for="role in currentUser.guild.roles" :key="role">
        {{ role }}
      </li>
    </ul>
    <hr/>
    <strong>Teams</strong>
    <ul v-if="currentUser && currentUser.teams && currentUser.teams.length">
      <li v-for="(team, i) in currentUser.teams" :key="i">
        {{ team.name }}
      </li>
    </ul>
    <p v-else><em>No teams</em></p>
    <div>
      <strong>Add User Team</strong>
      <team-form />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
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
    ...mapState(useUserStore, ['currentUser', 'oauth'])
  },
  mounted() {
    if (this.oauth && this.currentUser && !this.currentUser.guild) {
        this.userStore.fetchUserGuild()
          .catch(error => {
            this.guildError = true
            log.info(MODULE_ID, 'User is not a valid OpenAir member. <PROMPT USER>')
          })
    }
  }
})

</script>

<style scoped>
</style>
