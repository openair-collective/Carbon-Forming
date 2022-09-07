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
    <button type="submit" class="">Save</button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID = 'components/TeamForm'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      default: {
        name: null,
        location: null
      }
    }
  },
  data() {
    return {
      error: '',
      saving: false
    }
  },
  methods: {
    submitTeamForm() {
      this.saving = true
      firestore.saveTeam(this.team)
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
