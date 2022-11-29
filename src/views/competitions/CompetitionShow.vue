<template>
  <section 
    v-if="competition"
    class="is-flex is-flex-direction-column"
  >
    <header class="header px-4 pt-4 pb-0">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'competitions'}">
              &lt; Back to competitions
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="columns">
        <div class="column">
          <div class="is-flex is-flex-direction-row is-align-items-center mb-4">
            <h1 class="title is-2 mr-4 mb-0">
              {{ competition.name }}
            </h1>
            <router-link 
              v-if="canEdit"
              :to="{ name: 'comp-edit', params: {id: competition.id }}"
              class="button is-small is-info is-outlined">
              Edit this competition
            </router-link>
          </div>
          <div class="field is-grouped mb-4">
            <div class="control">
              <button
                v-if="competitionState === eCompStates.UNAVAILABLE || competitionState === eCompStates.IN_PROGRESS "
                @click.stop.prevent="onEnterCompetition"
                class="button is-info"
                :disabled="isSaving || competitionState === eCompStates.UNAVAILABLE"
              >
                Enter this competition
              </button>
              <button
                v-if="competitionState === eCompStates.FINISHED"
                @click.stop.prevent=""
                class="button is-info"
                disabled
              >
                Judging in Progress
              </button>
            </div>
            <div class="control">
              <router-link
                v-if="canEdit && competitionState === eCompStates.FINISHED"
                :to="{name: 'comp-results-edit', params: { id: competition.id }}"
                class="button is-info"
              >
                Enter Results
              </router-link>
              <router-link
                v-if="competitionState === eCompStates.JUDGED"
                :to="{name: 'comp-results', params: { id: competition.id }}"
                class="button is-info"
              >
                View Results
              </router-link>
              <p
                v-if="competitionState === eCompStates.UNAVAILABLE" 
                class="help is-danger"
              >
                We cannot accept submissions until the start date
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="is-pulled-right">
            <p 
              v-if="competition.start_date && competition.end_date"
              class="is-size-4 mb-2"
            >
              {{ kDayMonth(kfsTimestampToDate(competition.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(competition.end_date)) }}
            </p>
            <p v-else>
              Time TBD
            </p>
            <countdown-timer
              v-if="competitionState !== eCompStates.FINISHED && competitionState !== eCompStates.JUDGED"
              :start_date="kfsTimestampToDate(competition.start_date)"
              :end_date="kfsTimestampToDate(competition.end_date)"
            />
            <div v-else>
              <p class="is-size-3 mb-3">Competition finished</p>
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
          </div>
        </div>
      </div>
      <div class="tabs mb-0 pb-0">
        <ul>
          <li 
            @click="onTabClick(eTabs.DETAILS)"
            :class="{'is-active': activeTab === eTabs.DETAILS}"
          >
            <a>Competition Details</a>
          </li>
          <li
            @click="onTabClick(eTabs.PROJECTS)"
            :class="{'is-active': activeTab === eTabs.PROJECTS}"
          >
            <a>Submitted Projects</a>
          </li>
          <li
            @click="onTabClick(eTabs.RESULTS)"
            :class="{'is-active': activeTab === eTabs.RESULTS}"
          >
            <a>Results</a>
          </li>
        </ul>
      </div>
    </header>
    <article class="article has-background-white-bis p-5 my-0 is-flex-grow-1">
      <router-view :competition="competition" />
    </article>
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

<style scoped>
.help {
  line-height: 30px;
}
</style>
