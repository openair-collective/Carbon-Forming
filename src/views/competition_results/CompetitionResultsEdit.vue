<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li>
        <router-link :to="{ name: 'comp-results'}">
          &lt; Back
        </router-link>
      </li>
    </ul>
  </nav>
  <h2 class="title is-4 mb-4">Enter Results</h2>
  <table class="table is-bordered">
    <thead>
      <tr>
        <th>Team Name</th>
        <th>Finishing Position</th>
        <th>{{ competition.assessment_metric }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="project_id in Object.keys(results)" :key="project_id">
        <td>
          {{ projectNameById(project_id) }}
        </td>
        <td>
          <div class="field">
            <div class="control">
              <input type="text" class="input" v-model="results[project_id].position" />
            </div>
          </div>
        </td>
        <td>
          <div class="field">
            <div class="control">
              <input type="text" class="input" v-model="results[project_id].value"/>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="field is-grouped">
    <div class="control">
      <router-link
        :to="{ name: 'comp-results'}"
        class="button"
      >
        Cancel
      </router-link>
    </div>
    <div class="control">
      <button
        @click="saveResults"
        class="button is-primary"
        :class="{ 'is-loading': isSaving}"
        :disabled="isSaving"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Team, Project, Ranking } from '@/types'
import { mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import { useFlashStore } from '@/store/flash'
import { useModalStore } from '@/store/modal'
import { LogLevel } from '@/enums'
import log from '@/services/logger'

const MODULE_ID = 'views/competitions/CompetitionResultsEdit'

export default defineComponent({
  props:{
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  data() {
    return {
      isSaving: false
    }
  },
  async created() {
    if (!this.competition.projects || !this.competition.projects.length) {
      await this.competitionsStore.fetchCompetitionProjects(this.competition)
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useModalStore, useFlashStore),
    results():any {
      const projects = this.competition.projects
      const values = { ...this.competition.results, ...{} } as { [key:Project['id']]: Ranking }
      if (projects) {
        projects.forEach(p => {
          if (!(p.id in values)) {
            values[p.id] = { position: null, value: null } as Ranking
          }
        })
      }
      return values
    }
  },
  methods: {
    saveResults() {
      const prevResults = this.competition.results
      this.competition.results = this.results
      this.competitionsStore.saveCompetition(this.competition)
        .then(result => {
          if (result) {
            Object.assign(this.competition, result)
            this.flashStore.$patch({ message: 'Results saved', level: LogLevel.success })
          }
        })
        .catch(error => {
          this.competition.results = prevResults
          this.flashStore.$patch({ message: 'Error saving competition. Please try again.', level: LogLevel.error })
          log.error(MODULE_ID, error)
        })
        .finally(() => {
          this.isSaving = false
        })
    },
    projectById(id:string):Project|undefined {
      let result
      if (this.competition.projects) {
        result = this.competition.projects.find(p => p.id === id)
      }
      return result
    },
    projectNameById(id:string):string {
      let result = 'no name'
      const project = this.projectById(id)
      if (project) {
        result = project.name
      }
      return result
    }
  }
})
</script>

<style scoped>
</style>