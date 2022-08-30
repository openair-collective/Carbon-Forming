<template>
  <form @submit.prevent="submitTeamForm" :disabled="saving">
    <div class="field"> 
      <div class="control">
        <input class="input" type="text" placeholder="Team Name" v-model="team.name">
      </div>
    </div>
    <button type="submit">Save</button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import firestore from '@/services/firestore'
import { Team } from '@/types'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      default: {
        name: ''
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
          console.info(result)
        })
        .catch(error => {
          console.info(error)
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
})
</script>
