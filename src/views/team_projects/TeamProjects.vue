<template>
  <section class="p-4">
    <header class="header mb-4">
      <h3 class="title is-3">
        Projects
        <router-link
          v-if="projects && projects.length"
          :to="{ name: 'team-project-new' }"
          class="button is-info is-small is-outlined ml-2"
        >
          New Project
        </router-link>
      </h3>
    </header>
    <article>
      <div v-if="errors.projects">
        {{ errors.projects }}
      </div>
      <div v-else-if="projects">
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
      <loading v-else />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import Loading from '@/components/Loading.vue'
import log from '@/services/logger'

const MODULE_ID ='components/team'

export default defineComponent({
  components: { Loading },
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
  watch: {
    team(newVal) {
      if (newVal) {
        this.setProjects()
      }
    }
  },
  computed: { 
    ...mapStores(useTeamsStore)
  },
  created() {
    this.setProjects()
  },
  methods: {
    setProjects() {
      this.teamsStore.getTeamProjects(this.team)
      .then(result => {
        this.projects = result as Project[]
      })
      .catch(error => {
        this.errors.projects = '<ERROR SHOW PROMPT>'
        log.error(MODULE_ID, '#setTeamProjects > Error' + error)
      })
    },
    onCreateProject() {
      this.$router.push({ name: 'team-project-new' })
    }
  }
})

</script>

<style scoped>
</style>
