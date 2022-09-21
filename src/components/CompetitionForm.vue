<template>
  <form @submit.prevent="submitForm" :disabled="isSaving">
    <notification 
      v-if="success || error"
      :error="error" 
      :success="success" 
      @remove="clearMessages" />
    <div class="field"> 
      <label class="label">Name</label>
      <div class="control">
        <input class="input" type="text" v-model="clone.name" required>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Start Date</label>
      <div class="control">
        <input
          class="input"
          type="date"
          v-model="startDate"
          required>
      </div>
    </div>
    <div class="field"> 
      <label class="label">End Date</label>
      <div class="control">
        <input 
          class="input" 
          type="date"
          v-model="endDate"
          required>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Description</label>
      <div class="control">
        <textarea class="textarea" v-model="clone.description"></textarea>
      </div>
    </div>
    <div class="field is-grouped is-grouped-right">
      <div class="control">
        <button @click="$emit('cancel')" class="button is-outlined">
          Cancel
        </button>
      </div>
      <div class="control">
        <button type="submit" class="button is-primary">
          Save Competition
        </button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import { mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import Notification from './Notification.vue'
import log from '@/services/logger'

const MODULE_ID = 'components/CompetitionForm'

function dateForInput(date:Date):string {
  return date.toISOString().split('T')[0]
}

function dateForSave(iso:string):Date {
  let date = new Date(iso)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date
}

export default defineComponent({
  components: { Notification },
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  data() {
    return {
      clone: { ...this.competition },
      success: '',
      error: '',
      isSaving: false,
      startDate: this.competition.start_date && dateForInput(this.competition.start_date),
      endDate: this.competition.end_date && dateForInput(this.competition.end_date)
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore)
  },
  methods: {
    clearMessages() {
      this.success = ''
      this.error = ''
    },
    submitForm() {
      this.isSaving = true
      this.clone.start_date = dateForSave(this.startDate)
      this.clone.end_date = dateForSave(this.endDate)
      this.competitionsStore.saveCompetition(this.clone)
        .then(result => {
          Object.assign(this.competition, result)
          this.clone = { ...this.competition }
          this.success = 'Competition saved'
          this.$emit("comp-saved", result)
        })
        .catch(error => {
          this.error = 'Error saving competition. Please try again.'
          log.error(MODULE_ID, error)
        })
        .finally(() => {
          this.isSaving = false
        })
    }
  }
})
</script>
