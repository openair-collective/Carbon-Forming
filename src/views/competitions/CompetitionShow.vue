<template>
  <section
    v-if="competition"
    class="section"
  >
    <header class="header pb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'competitions'}">
              &lt; Back to competitions
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="columns is-multiline">
        <div class="column">
          <h1 class="title is-2 is-size-4-mobile mb-4">
            {{ competition.name }}
          </h1>
          <div class="buttons mb-4">
            <button
              v-if="competitionState === eCompStates.UNAVAILABLE || competitionState === eCompStates.IN_PROGRESS "
              @click.stop.prevent="onEnterCompetition"
              class="button is-primary"
              :disabled="isSaving || competitionState === eCompStates.UNAVAILABLE"
            >
              Enter this competition
            </button>
            <button
              v-if="competitionState === eCompStates.FINISHED"
              @click.stop.prevent=""
              class="button is-primary"
              disabled
            >
              Judging in Progress
            </button>
            <router-link
              v-if="canEdit && competitionState === eCompStates.FINISHED"
              :to="{name: 'comp-results-edit', params: { id: competition.id }}"
              class="button is-primary"
            >
              Enter Results
            </router-link>
            <router-link
              v-if="competitionState === eCompStates.JUDGED"
              :to="{name: 'comp-results', params: { id: competition.id }}"
              class="button is-primary"
            >
              View Results
            </router-link>
            <router-link 
              v-if="canEdit"
              :to="{ name: 'comp-edit', params: {id: competition.id }}"
              class="button is-info"
            >
              Edit this competition
            </router-link>
          </div>
          <p
              v-if="competitionState === eCompStates.UNAVAILABLE" 
              class="help is-danger"
            >
              We cannot accept submissions until the start date
          </p>
        </div>
        <div class="column is-narrow">
          <template v-if="competition.start_date && competition.end_date"> 
            <h2 class="title is-4 mb-4">
              {{ kDayMonth(kfsTimestampToDate(competition.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(competition.end_date)) }}
            </h2>
            <countdown-timer
              v-if="competitionState !== eCompStates.FINISHED && competitionState !== eCompStates.JUDGED"
              :start_date="kfsTimestampToDate(competition.start_date)"
              :end_date="kfsTimestampToDate(competition.end_date)"
            />
            <div v-else>
              <h3 class="title is-3">Competition finished</h3>
              <template v-if="canEdit">
                <button
                  v-if="competitionState !== eCompStates.JUDGED && !isEmpty(competition.results) && competition.results_disabled"
                  @click="prompResultsToggle"
                  class="button is-primary"
                  :disabled="isSaving"
                >
                  Announce Results
                </button>
                <button
                  v-else-if="!competition.results_disabled"
                  @click="prompResultsToggle"
                  class="button is-primary"
                  :disabled="isSaving"
                >
                  Hide Results
                </button>
              </template>
            </div>
          </template>
        </div>
      </div>
    </header>
    <div class="tabs mb-0 pb-0">
      <ul 
        role="tablist" 
        aria-label="Competition Sections" 
        aria-controls="teamInfo"
      >
        <li 
          @click="onTabClick(eTabs.DETAILS)"
          :class="{'is-active': activeTab === eTabs.DETAILS}"
          role="tab"
          :aria-selected="activeTab === eTabs.DETAILS"
        >
          <a>Competition Details</a>
        </li>
        <li
          @click="onTabClick(eTabs.PROJECTS)"
          :class="{'is-active': activeTab === eTabs.PROJECTS}"
          role="tab"
          :aria-selected="activeTab === eTabs.PROJECTS"
        >
          <a>Submitted Projects</a>
        </li>
        <li
          @click="onTabClick(eTabs.RESULTS)"
          :class="{'is-active': activeTab === eTabs.RESULTS}"
          role="tab"
          :aria-selected="activeTab === eTabs.RESULTS"
        >
          <a>Results</a>
        </li>
      </ul>
    </div>
    <div
      id="teamInfo"
      class="has-background-white-bis p-5"
      role="tabpanel"
      aria-live="polite"
    >
      <router-view :competition="competition" />
    </div>
  </section>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Project } from '@/types'
import { LogLevel } from '@/enums'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { useModalStore } from '@/store/modal'
import { useFlashStore } from '@/store/flash'
import { canEditCompetitions } from '@/helpers/authHelper'
import { dayMonth, dayMonthYear, fsTimestampToDate } from '@/utils/date'
import { isEmpty } from '@/utils/object'
import Loading from '@/components/Loading.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { ERROR_NOT_FOUND } from '@/consts'
import { 
  COMP_STATES, 
  getCompState 
} from  '@/helpers/compHelper'
import log from '@/services/logger'

const MODULE_ID ='views/competition'

enum TABS {
  DETAILS,
  PROJECTS,
  RESULTS
}

const COMP_PATHS = {
  DETAILS: 'comp-show',
  PROJECTS: 'comp-projects',
  RESULTS: 'comp-results',
  RESULTS_EDIT: 'comp-results-edit'
}

const COMP_PROJECT_ROOT_PATH = 'comp-project'

export default defineComponent({
  components: { Loading, CountdownTimer},
  data() {
    return {
      eTabs: TABS,
      eCompStates: COMP_STATES,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate,
      competition: null as Competition|null,
      activeTab: TABS.DETAILS,
      projects: [] as Project[],
      competitionState: COMP_STATES.UNAVAILABLE,
      isSaving: false
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useUserStore, useModalStore, useFlashStore),
    ...mapState(useUserStore, ['oauth']),
    canEdit():boolean {
      let result = false
      if (this.oauth) {
        result = canEditCompetitions(this.oauth)
      }
      return result
    }
  },
  async created() {
    const id = this.$route.params.id as string
    this.setCompetitonByID(id)
    const name = this.$route.name as string
    if (name.indexOf(COMP_PROJECT_ROOT_PATH) !== -1){
      this.activeTab = TABS.PROJECTS
    }
    if (name === COMP_PATHS.DETAILS) {
      this.activeTab = TABS.DETAILS
    }
    if (name === COMP_PATHS.RESULTS) {
      this.activeTab = TABS.RESULTS
    }
    if (name === COMP_PATHS.RESULTS_EDIT) {
      this.activeTab = TABS.RESULTS
    }
  },
  methods: {
    getCompState,
    isEmpty,
    onTabClick(tab:number) {
      this.activeTab = tab
      if (this.competition) {
        let path
        if (tab === TABS.PROJECTS) {
          path =  { name: COMP_PATHS.PROJECTS }
        }
        else if (tab === TABS.RESULTS) {
          path = { name: COMP_PATHS.RESULTS }
        }
        else {
          path = { name: COMP_PATHS.DETAILS }
        }
        this.$router.push(path)
      }
    },
    setCompetitonByID(id:string) {
      this.competitionsStore.getCompetitionById(id)
        .then(result => {
          if (result) {
            this.competition = result
            this.competitionState = getCompState(this.competition)
          }
          else {
            throw new Error('Competition not found.')
          }
        })
        .catch(error => {
          this.$router.replace({ name: 'competitions'})
            .then(()=> {
              this.flashStore.$patch({ 
                message: ERROR_NOT_FOUND,
                level: LogLevel.error
              })
            })
        })
    },
    onEnterCompetition() {
      if (this.competition) {
        this.$router.push({
          name: 'comp-enter',
          params: { id: this.competition.id }
        })
      }
    },
    saveCompetition(comp:Competition):Promise<Competition|undefined> {
      return this.competitionsStore.saveCompetition(comp)
    },
    prompResultsToggle() {
      if (this.competition) {
        const disabled = this.competition.results_disabled
        const prompt = disabled ? 'Are you ready to' : 'Do you want to'
        const action = disabled ? 'announce' : 'hide'
        const message = `${prompt} ${action} the results of ${this.competition.name}?`
        this.modalStore.options = {
          component: 'Confirm',
          title: '',
          meta: {
            message,
            confirm: this.toggleResultsDisabled,
            confirmLabel: `Yes, ${action} results`,
            cancelLabel: `No, don’t ${action}`
          }
        }
      }
    },
    toggleResultsDisabled() {
      if (this.competition) {
        let clone = { ...this.competition, ...{ results_disabled: !this.competition.results_disabled }}
        this.isSaving = true
        this.saveCompetition(clone)
          .then(result => {
            if (result) {
              this.competition = Object.assign(this.competition || {}, result)
              this.competitionState = getCompState(this.competition)
            }
            else {
              throw new Error('Error saving competition results. Please try again.')
            }
          })
          .catch(error => {
            this.flashStore.$patch({ 
            message: error,
              level: LogLevel.error
            })
          })
          .finally(() => {
            this.isSaving = false
          })
      }
    }
  }
})

</script>

<style lang="scss" scoped>
.help {
  line-height: 30px;
}
</style>
