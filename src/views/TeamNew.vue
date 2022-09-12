<template>
  <main>
    <section class="p-4">
      <h1 class="title is-3">Create Team</h1>
      <team-form
        :team="team"
        @team-saved="onTeamSaved"
        @cancel="onCancel"
      />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { mapStores } from 'pinia'
import TeamForm from '@/components/TeamForm.vue'
import { useUserStore } from '@/store/user'
import log from '@/services/logger'

const MODULE_ID = 'views/TeamNew'

export default defineComponent({
  components: { TeamForm },
  computed: {
    ...mapStores(useUserStore),
    team():Team {
      return {
        name: '',
        location: ''
      } as Team
    }
  },
  methods: {
    onCancel() {
      const id = this.$route.params.id
      this.$router.replace({ name: 'root'})
    },
    onTeamSaved(team:Team) {
      this.userStore.addTeam(team)
        .then(result => {
          this.$router.replace({ name: 'teams', params: { id: team.id }})
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