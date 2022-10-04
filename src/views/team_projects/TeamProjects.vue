<template>
  <section>
    <header class="header mb-4">
      <h3 class="title is-3">
        Projects
      </h3>
    </header>
    <article>
      <div v-if="team.projects" class="box box--with-border">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Competitions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(project, i) in team.projects" :key="'project_'+ i">
              <td>
                <router-link :to="{ name: 'team-project-show', params: { project_id: project.id }}">
                {{ project.name }}
              </router-link>
              </td>
              <td>
                <router-link
                  v-if="project.competition"
                  :to="{ name: 'comp-show', params: { id: project.competition.id }}"
                  >
                  {{ project.competition.name }}
                </router-link>
                <button 
                  v-else
                  class="button is-info is-small"
                >
                  Submit to Competition
                </button>
              </td>
              <td><button class="button">...</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <h4 class="title is-5">No projects yet</h4>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project, Competition } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useCompetitionsStore } from '@/store/competitions'
import Loading from '@/components/Loading.vue'
import log from '@/services/logger'

const MODULE_ID ='components/team_projects/TeamProjects'

export default defineComponent({
  components: { Loading },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  computed: { 
    ...mapStores(useTeamsStore, useCompetitionsStore),
    projects() {
      return Object.values(this.team.projects)
    }
  },
  created() {
    if (!this.team.projects) {
      this.teamsStore.fetchTeamProjects(this.team)
    }
  }
})

</script>

<style scoped>
</style>
