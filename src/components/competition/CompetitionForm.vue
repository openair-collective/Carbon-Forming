<template>
  <form @submit.prevent="submitForm" :disabled="isSaving">
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
              pattern="\d{4})-(\d{1,2})-(\d{1,2})"
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
              :disabled="!startDate"
              :min="minEndDate"
              pattern="\d{4})-(\d{1,2})-(\d{1,2})"
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
import { Competition, Timestamp } from '@/types'
import { LogLevel } from '@/enums'
import { mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import { useFlashStore } from '@/store/flash'
import { fsTimestampToDate, lastDayOfMonth } from '@/utils/date'
import log from '@/services/logger'

const MODULE_ID = 'components/competition/CompetitionForm'

function dateForInput(stamp:any):string {
  const date = fsTimestampToDate(stamp)
  return date.toISOString().split('T')[0]
}

function dateForSave(iso:string):Timestamp {
  let date = new Date(iso)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  return { seconds: date.getTime() / 1000, nanoseconds: 0 }
}

const DEFAULT_COMP = {
  id: '',
  name: '',
  description: '',
  rules: '',
  criteria: '',
  prizesDisabled: false,
  prizes: {
    first: '',
    second: '',
    third: ''
  },
  leaderboard: {},
  start_date: null,
  end_date: null,
  projects: []
} as Competition

export default defineComponent({
  props: {
    competition: {
      type: Object as () => Competition,
      default: DEFAULT_COMP
    }
  },
  data() {
    return {
      clone: { ...DEFAULT_COMP, ...this.competition },
      isSaving: false,
      startDate: this.competition.start_date && dateForInput(this.competition.start_date),
      endDate: this.competition.end_date && dateForInput(this.competition.end_date)
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore, useFlashStore),
    minEndDate():string {
      let result = ''
      if (this.startDate) {
        let min:Date = new Date(this.startDate)
        min.setMinutes(min.getMinutes() + min.getTimezoneOffset())
        min.setDate(min.getDate()+1)
        result = min.toISOString().split('T')[0]
      }
      return result
    }
  },
  watch: {
    startDate(val) {
      let start:Date = new Date(val)
      start.setMinutes(start.getMinutes() + start.getTimezoneOffset())
      let end:Date|null = this.endDate ? new Date(this.endDate) : null
      if (!end || end < start) {
        let day:number = lastDayOfMonth(start.getFullYear(), start.getMonth())
        end = new Date(start.valueOf())
        end.setDate(day)
        this.endDate = end.toISOString().split('T')[0]
      }
    }
  },
  methods: {
    submitForm() {
      this.isSaving = true
      this.flashStore.$reset()
      if (this.startDate && this.endDate) {
        this.clone.start_date = dateForSave(this.startDate)
        this.clone.end_date = dateForSave(this.endDate)
      }
      this.competitionsStore.saveCompetition(this.clone)
        .then(result => {
          Object.assign(this.competition, result)
          this.clone = { ...this.competition }
          this.flashStore.$patch({ message: 'Competition saved', level: LogLevel.success })
          this.$emit("comp-saved", result)
        })
        .catch(error => {
          this.flashStore.$patch({ message: 'Error saving competition. Please try again.', level: LogLevel.error })
          log.error(MODULE_ID, error)
        })
        .finally(() => {
          this.isSaving = false
        })
    }
  }
})
</script>
