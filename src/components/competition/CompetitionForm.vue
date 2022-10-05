<template>
  <form @submit.prevent="submitForm" :disabled="isSaving">
    <notification 
      v-if="success || error"
      :error="error" 
      :success="success" 
      @remove="clearMessages" />
    <div class="field"> 
      <label class="label">Competition Name</label>
      <div class="control">
        <input class="input" type="text" v-model="clone.name" required>
      </div>
    </div>
    <hr/>
    <div>
      <h2 class="title is-4">Dates</h2>
      <h3 class="subtitle">Please list the beginning and the end date for your competition</h3>
      <div class="is-flex is-flex-direction-row">
        <div class="field mr-6"> 
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
      </div>
    </div>
    <hr/>
    <div>
      <h2 class="title is-4">Prizes</h2>
      <h3 class="subtitle">List the prize amounts you will be awarding to the winners of your competition</h3>
      <div class="field">
        <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="clone.prizesDisabled">
            Click this checkbox if you do not want to offer prizes as part of your competition
          </label>
        </div>
      </div>
      <div class="field"> 
        <label class="label">First Prize</label>
        <div class="control">
          <input
            class="input"
            type="text"
            v-model="clone.prizes.first"
            :disabled="clone.prizesDisabled">
        </div>
      </div>
      <div class="field"> 
        <label class="label">Second Prize</label>
        <div class="control">
          <input
            class="input"
            type="text"
            v-model="clone.prizes.second"
            :disabled="clone.prizesDisabled">
        </div>
      </div>
      <div class="field"> 
        <label class="label">Runner Up</label>
        <div class="control">
          <input
            class="input"
            type="text"
            v-model="clone.prizes.third"
            :disabled="clone.prizesDisabled">
        </div>
      </div>
    </div>
    <hr/>
    <div>
      <h2 class="title is-4">Competition Details</h2>
      <h3 class="subtitle">Please describe your competition in detail, the rules and the criteria by which a winner will be selected</h3>
      <div class="field"> 
        <label class="label">Description</label>
        <div class="control">
          <textarea class="textarea" v-model="clone.description"></textarea>
        </div>
      </div>
      <div class="field"> 
        <label class="label">Rules</label>
        <div class="control">
          <textarea class="textarea" v-model="clone.rules"></textarea>
        </div>
      </div>
      <div class="field"> 
        <label class="label">Criteria</label>
        <div class="control">
          <textarea class="textarea" v-model="clone.criteria"></textarea>
        </div>
      </div>
    </div>
    <hr/>
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
import { fsTimestampToDate } from '@/utils/date'
import Notification from '@/components/Notification.vue'
import log from '@/services/logger'

const MODULE_ID = 'components/competition/CompetitionForm'

function dateForInput(stamp:any):string {
  const date = fsTimestampToDate(stamp)
  return date.toISOString().split('T')[0]
}

function dateForSave(iso:string):Date {
  let date = new Date(iso)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date
}

const DEFAULT_COMP = {
  name: '',
  description: '',
  rules: '',
  criteria: '',
  prizesDisabled: false,
  prizes: {
    first: '',
    second: '',
    third: ''
  }
}

export default defineComponent({
  components: { Notification },
  props: {
    competition: {
      type: Object as () => Competition,
      default: DEFAULT_COMP
    }
  },
  data() {
    return {
      clone: { ...DEFAULT_COMP, ...this.competition },
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
      if (this.startDate && this.endDate) {
        this.clone.start_date = dateForSave(this.startDate)
        this.clone.end_date = dateForSave(this.endDate)
      }
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
