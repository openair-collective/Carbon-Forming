<template>
  <section v-if="team">
    <header class="header p-4 has-background-white">
      <figure class="image is-64x64 is-pulled-left mr-4">
        <img src="https://bulma.io/images/placeholders/64x64.png">
      </figure>
      <h1 class="title is-3">{{ team.name }}</h1>
      <h2 class="subtitle">{{ team.location }}</h2>
    </header>
    <article class="article p-4 has-background-white-bis">
      <h3 class="title is-4">Projects</h3>
      <div v-if="team.projects && team.projects.length">
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
        <h4 class="title is-5">No projects yet</h4>
        <button class="button is-info">Create your first project</button>
      </div>
    </article>
  </section>
  <h1 v-else>Loading...</h1>
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
      default: undefined
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
    team(newTeam) {
      if (newTeam) {
        this.setTeamProjects(newTeam)
      }
    }
  },
  computed: { 
    ...mapStores(useTeamsStore),
  },
  methods: {
    setTeamProjects(team:Team) {
      this.errors.projects = ''
      this.teamsStore.getTeamProjects(team)
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
