<template>
  <h3 class="title is-4">Projects</h3>
  <router-link
    v-if="projects && projects.length"
    :to="{ name: 'team-project-new' }"
    class="button is-small is-primary"
  >
    New Project
  </router-link>
  <div v-if="errors.projects">
    {{ errors.projects }}
  </div>
  <div v-if="projects">
    <table 
      v-if="projects.length"
      class="table is-fullwidth"
    >
      <thead>
        <tr>
          <th>Project Name</th>
          <th>Competitions</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(project, i) in projects" :key="'project_'+ i">
          <td>
            <router-link :to="{ name: 'team-project-show', params: { project_id: project.id }}">
            {{ project.name }}
          </router-link>
          </td>
          <td>---</td>
          <td><button class="button">...</button></td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <h4 class="title is-5">No projects yet</h4>
      <button 
        @click="onCreateProject" 
        class="button is-info"
      >
        Create your first project
      </button>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import log from '@/services/logger'

const MODULE_ID ='components/team'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      projects: undefined as Project[]|undefined,
      errors: {
        projects: ''
      }
    }
  },
  computed: { 
    ...mapStores(useTeamsStore)
  },
  created() {
    this.teamsStore.getTeamProjects(this.team)
      .then(result => {
        this.projects = result as Project[]
      })
      .catch(error => {
        this.errors.projects = '<ERROR SHOW PROMPT>'
        log.error(MODULE_ID, '#setTeamProjects > Error' + error)
      })
  },
  methods: {
    onCreateProject() {
      this.$router.push({ name: 'team-project-new' })
    }
  }
})

</script>

<style scoped>
</style>
