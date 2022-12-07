<template>
  <section class="section">
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
            <input type="checkbox" v-model="clone.prizes_disabled">
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
              :disabled="clone.prizes_disabled">
          </div>
        </div>
        <div class="field"> 
          <label class="label">Second Prize</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="clone.prizes.second"
              :disabled="clone.prizes_disabled">
          </div>
        </div>
        <div class="field"> 
          <label class="label">Runner Up</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="clone.prizes.third"
              :disabled="clone.prizes_disabled">
          </div>
        </div>
      </div>
      <hr/>
      <div>
        <h2 class="title is-4">Success Criteria</h2>
        <h3 class="subtitle">How will people win your comeptittion. Please describe in as much detail as possible what the competitors have to do to win the competition.</h3>
        <div class="field"> 
          <label class="label">Describe how you will assess the winners of the competition</label>
          <div class="control">
            <text-editor 
              :value="clone.success_criteria"
              :placeholder="'Tell us about your competition'"
              @text-change="(change) => clone.success_criteria = change" 
            />
          </div>
        </div>
        <div class="field"> 
        <label class="label">Metric that will be used to measure the winner</label>
          <div class="control">
            <input 
              class="input" 
              type="text" 
              v-model="clone.assessment_metric" 
              placeholder="Enter a value here e.g. &quot;grams of C02 captured&quot;"
              required>
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
            <text-editor 
              :value="clone.description"
              :placeholder="'Tell us about your competition'"
              @text-change="(change) => clone.description = change" 
            />
          </div>
        </div>
        <div class="field"> 
          <label class="label">Rules</label>
          <div class="control">
            <text-editor 
              :value="clone.rules"
              :placeholder="'What are the rules of your competition?'"
              @text-change="(change) => clone.rules = change" 
            />
          </div>
        </div>
        <div class="field"> 
          <label class="label">Criteria</label>
          <div class="control">
            <text-editor 
              :value="clone.judging_criteria"
              :placeholder="'How will the winning entries be selected?'"
              @text-change="(change) => clone.judging_criteria = change" 
            />
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
  </section>
  <section class="section mt-6">
    <div
      v-if="competition.id"
      class="p-4 has-background-light"
    >
      <h3 class="title is-5">Delete Competition</h3>
      <p><strong>Warning:</strong> Deleting a Competition is irreversible. All associated data, including any submitted Projects, will also be deleted.</p>
      <button
        class="button is-danger mt-3"
        @click="confirmDelete(competition)"
      >
        Delete Competition
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { Competition, Timestamp } from '@/types'
import { LogLevel } from '@/enums'
import { mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import { useFlashStore } from '@/store/flash'
import { useModalStore } from '@/store/modal'
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

function compFactory():Competition {
  return {
    id: '',
    name: '',
    description: '',
    rules: '',
    judging_criteria: '',
    success_criteria: '',
    assessment_metric: '',
    prizes_disabled: false,
    prizes: {
      first: '',
      second: '',
      third: ''
    },
    results: {},
    results_disabled:true,
    start_date: null,
    end_date: null,
    projects: []
  }
}

export default defineComponent({
  name: 'competition-form',
  emits: ['cancel', 'comp-saved', 'comp-deleted'],
  components: { TextEditor: defineAsyncComponent(() => import('@/components/TextEditor.vue')) },
  props: {
    competition: {
      type: Object as () => Competition,
      default: compFactory()
    }
  },
  data() {
    return {
      clone: Object.assign(
        {},
        compFactory(),
        this.competition
      ), // clone so we can modify
      isSaving: false,
      startDate: this.competition.start_date && dateForInput(this.competition.start_date),
      endDate: this.competition.end_date && dateForInput(this.competition.end_date)
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore, useFlashStore, useModalStore),
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
          this.$emit('comp-saved', result)
        })
        .catch(error => {
          this.flashStore.$patch({ message: 'Error saving competition. Please try again.', level: LogLevel.error })
          log.error(MODULE_ID, error)
        })
        .finally(() => {
          this.isSaving = false
        })
    },
    confirmDelete(comp:Competition) {
      this.modalStore.options = {
        title: 'Delete Competition?',
        component: 'Confirm',
        meta: {
          message: `Are you sure you want to delete ${comp.name}?`,
          confirm: () => { this.deleteCompetition(comp) },
          confirmLabel: 'Yes, I want to delete this competition',
          cancelLabel: 'No, don\'t delete',
          danger: true
        }
      }
    },
    deleteCompetition(comp:Competition) {
      this.competitionsStore.deleteCompetition(comp)
        .then(result => {
            this.$emit('comp-deleted')
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error deleting competition. Please try again.', level: LogLevel.error })
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
    }
  }
})
</script>
