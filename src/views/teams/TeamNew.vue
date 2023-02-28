<template>
  <section class="section">
    <header class="header mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'my-teams'}">
              &lt; Back to My Teams
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Create Team</h1>
    </header>
    <team-form
      @team-saved="onTeamSaved"
      @cancel="onCancel"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { TeamRole, LogLevel } from '@/enums'
import { mapStores } from 'pinia'
import TeamForm from '@/components/team/TeamForm.vue'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import { useFlashStore } from '@/store/flash'
import log from '@/services/logger'

const MODULE_ID = 'views/TeamNew'

export default defineComponent({
  components: { TeamForm },
  computed: {
    ...mapStores(useUserStore, useFlashStore, useTeamsStore)
  },
  methods: {
    onCancel() {
      const id = this.$route.params.id
      this.$router.replace({ name: 'my-teams'})
    },
    onTeamSaved(team:Team) {
      this.userStore.addTeam(team, TeamRole.admin)
        .then(result => {
          this.$router.replace({ name: 'team-show', params: { id: team.id }})
            .then(() => {
              this.flashStore.$patch({ message: 'Team saved', level: LogLevel.success })
              window.scrollTo({ top: 0 })
            })
        })
        .catch(error => {
          log.warn(MODULE_ID, '#onTeamSaved > Error adding Team to User')
        })
    }
  }
})

</script>

<style scoped>
</style>