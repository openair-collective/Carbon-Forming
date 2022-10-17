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
          <h1 class="title is-2">{{ competition.name }}</h1>
          <div class="field is-grouped mb-4">
            <div class="control">
              <button
                @click="onEnterCompetition"
                class="button is-primary"
              >
                Enter this competition
              </button>
            </div>
            <div class="control">
              <router-link 
                v-if="canEdit"
                :to="{ name: 'comp-edit', params: {id: competition.id }}"
                class="button is-info is-outlined">
                Edit this competition
              </router-link>
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
              :start_date="kfsTimestampToDate(competition.start_date)"
              :end_date="kfsTimestampToDate(competition.end_date)"
            />
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
        </ul>
      </div>
    </header>
    <article class="article has-background-white-bis p-5 my-0 is-flex-grow-1">
      <router-view :competition="competition" />
    </article>
  </section>
  <div v-else-if="error" class="notification is-error">>
    {{ error }}
  </div>
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
import Loading from '@/components/Loading.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { ERROR_NOT_FOUND } from '@/consts'
import log from '@/services/logger'

const MODULE_ID ='views/competition'

enum TABS {
  DETAILS,
  PROJECTS
}

const COMP_PATHS = {
  DETAILS: 'comp-show',
  PROJECTS: 'comp-projects',
}

const COMP_PROJECT_ROOT_PATH = 'comp-project'

export default defineComponent({
  components: { Loading, CountdownTimer},
  data() {
    return {
      eTabs: TABS,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate,
      competition: null as Competition|null,
      activeTab: TABS.DETAILS,
      projects: [] as Project[],
      error: ''
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useUserStore, useModalStore, useFlashStore),
    ...mapState(useUserStore, ['guild']),
    canEdit():boolean {
      let result = false
      if (this.guild) {
        result = canEditCompetitions(this.guild)
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
  },
  methods: {
    onTabClick(tab:number) {
      this.activeTab = tab
      if (this.competition) {
        let path
        if (tab === TABS.PROJECTS) {
          path =  { name: COMP_PATHS.PROJECTS }
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
      this.modalStore.options = {
        component: 'EnterCompetition',
        title: '',
        fullscreen: true,
        meta: {
          competition: this.competition
        }
      }
    }
  }
})

</script>

<style scoped>
</style>
