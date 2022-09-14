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
      <h1 class="title is-2">{{ competition.name }}</h1>
      <router-link 
        v-if="canEdit"
        :to="{ name: 'comp-edit', params: {id: competition.id }}"
        class="button is-primary mb-4">
        Edit Competition
      </router-link>
      <div class="tabs mb-0 pb-0">
        <ul>
          <li 
            @click="activeTab = kTabs.DETAILS"
            :class="{'is-active': activeTab === kTabs.DETAILS}"
          >
            <a>Competition Details</a>
          </li>
          <li
            @click="activeTab = kTabs.PROJECTS"
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
          <table class="table">
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
      <div v-if="competition.projects && competition.projects.length">
        <div v-if="errors.projects">
          {{ errors.projects }}
        </div>
        <ul v-else-if="projects && projects.length">
          <li v-for="(project, i) in projects" :key="'project_'+ i" >
            {{ project.name }}
          </li>
        </ul>
        <div v-else>
          Loading...
        </div>
      </div>
      <div v-else>
        No projects
      </div>
    </article>
  </section>
  <h1 v-else class="title is-2">Loading...</h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Project } from '@/types'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { canCreateCompetition } from '@/helpers/authHelper'
import log from '@/services/logger'

const MODULE_ID ='views/competition'

const TABS = {
  DETAILS: 0,
  PROJECTS: 1
}

export default defineComponent({
  data() {
    return {
      kTabs: TABS,
      competition: undefined as Competition|undefined,
      projects: undefined as Project[]|undefined,
      activeTab: TABS.DETAILS,
      errors: {
        projects: ''
      }
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === TABS.PROJECTS && this.competition && !this.projects) {
        this.setCompetitionProjects(this.competition)
      }
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useUserStore),
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
  created() {
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
    setCompetitionProjects(comp:Competition) {
      this.errors.projects = ''
      this.competitionsStore.getCompetitionProjects(comp)
        .then(result => {
          this.projects = result
        })
        .catch(error => {
          this.errors.projects = '<ERROR SHOW PROMPT>'
          log.error(MODULE_ID, '#setTeamProjects > Error' + error)
        })
    }
  }
})

</script>

<style scoped>
</style>