<template>
  <form @submit.prevent="submitTeamForm" :disabled="saving">
    <div class="field"> 
      <label>Team Name</label>
      <div class="control">
        <input class="input" type="text" v-model="team.name" required>
      </div>
    </div>
    <div class="field"> 
      <label>Where is your team located?</label>
      <div class="control">
        <input class="input" type="text" v-model="team.location" required>
      </div>
    </div>
    <button type="submit" class="button is-primary">Save</button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import log from '@/services/logger'

const MODULE_ID = 'components/TeamForm'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      error: '',
      saving: false
    }
  },
  computed: {
    ...mapStores(useTeamsStore)
  },
  methods: {
    submitTeamForm() {
      this.saving = true
      this.teamsStore.saveTeam(this.team)
        .then(result => {
          this.$emit("team-saved", result)
        })
        .catch(error => {
          log.error(MODULE_ID, error)
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
})
</script>
