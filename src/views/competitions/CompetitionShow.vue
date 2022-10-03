<template>
  <section v-if="competition">
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
            <countdown-timer :date="kfsTimestampToDate(competition.start_date)" />
          </div>
        </div>
      </div>
      <div class="tabs mb-0 pb-0">
        <ul>
          <li 
            @click="activeTab = kTabs.DETAILS"
            :class="{'is-active': activeTab === kTabs.DETAILS}"
          >
            <a>Competition Details</a>
          </li>
          <li
            @click="(activeTab = kTabs.PROJECTS) && setProjects()"
            :class="{'is-active': activeTab === kTabs.PROJECTS}"
          >
            <a>Submitted Projects</a>
          </li>
        </ul>
      </div>
    </header>
    <article 
      v-if="activeTab === kTabs.DETAILS"
      class="article has-background-white-bis p-5 my-0"
    >
      <div class="columns">
        <div class="column is-8">
          <h2 class="title is-4">Competition Details</h2>
          {{ competition.description }}
        </div>
        <div class="column">
          <table class="table is-fullwidth">
            <tr>
              <td>First Prize</td>
              <td>$1,000</td>
            </tr>
            <tr>
              <td>Second Prize</td>
              <td>$500</td>
            </tr>
            <tr>
              <td>Third Prize</td>
              <td>$50</td>
            </tr>
          </table>
        </div>
      </div>
    </article>
    <article 
      v-else-if="activeTab === kTabs.PROJECTS"
      class="article has-background-white-bis px-5 py-5"
    >
      <h2 class="title is-4">Submitted Projects</h2>
        <project-list
          v-if="competition.projects && competition.projects.length"
          :list="competition.projects"
        />
        <div v-else>
          No projects
        </div>
    </article>
  </section>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Project } from '@/types'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { useModalStore } from '@/store/modal'
import { canCreateCompetition } from '@/helpers/authHelper'
import { dayMonth, dayMonthYear, fsTimestampToDate } from '@/utils/date'
import Loading from '@/components/Loading.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import ProjectList from '@/components/ProjectList.vue'
import log from '@/services/logger'

const MODULE_ID ='views/competition'

const TABS = {
  DETAILS: 0,
  PROJECTS: 1
}

export default defineComponent({
  components: { Loading, CountdownTimer, ProjectList },
  data() {
    return {
      kTabs: TABS,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate,
      competition: undefined as Competition|undefined,
      activeTab: TABS.DETAILS,
      projects: [] as Project[]
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useUserStore, useModalStore),
    ...mapState(useCompetitionsStore, ['list']),
    ...mapState(useUserStore, ['guild']),
    canEdit():boolean {
      let result = false
      if (this.guild) {
        result = canCreateCompetition(this.guild)
      }
      return result
    }
  },
  async created() {
    const id = this.$route.params.id as string
    if (!this.list || !this.list.length) {
      this.competitionsStore.fetchList()
        .then(()=> this.setCompetitonByID(id))
    }
    else {
      this.setCompetitonByID(id)
    }
  },
  methods: {
    setCompetitonByID(id:string) {
      this.competition = this.list &&  this.list.find(t => t.id === id)
    },
    setProjects() {
      if (this.competition && !this.competition.projects) {
        this.competitionsStore.fetchCompetitionProjects(this.competition)
      }
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
