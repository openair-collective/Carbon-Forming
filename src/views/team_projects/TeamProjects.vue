<template>
  <section>
    <header class="header mb-4">
      <h3 class="title is-3">
        Projects
      </h3>
    </header>
    <article>
      <project-list
        v-if="team.projects && team.projects.length" 
        :list="team.projects"
        :can-edit="true"
        :show-team="false"
        @project-click="onProjectClick"
      />
      <div
        v-else
        class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
      >
        <p class="mb-2">You’ve got no projects, you must enter a competition to upload a project</p>
        <router-link
          :to="{ name: 'competitions' }"
          class="button is-info"
        >
          Enter a competition
        </router-link>
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
import ProjectList from '@/components/project/ProjectList.vue'
import Loading from '@/components/Loading.vue'

import log from '@/services/logger'
const MODULE_ID ='components/team_projects/TeamProjects'

export default defineComponent({
  components: { ProjectList, Loading },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  computed: { 
    ...mapStores(useTeamsStore, useCompetitionsStore)
  },
  created() {
    this.fetchProjects()
  },
  beforeRouteUpdate() {
    this.fetchProjects()
  },
  methods: {
    fetchProjects() {
      if (!this.team.projects || !this.team.projects.length) {
        this.teamsStore.fetchTeamProjects(this.team)
      }
    },
    onProjectClick(project:Project) {
      this.$router.push({ name: 'team-project-show', params: { project_id: project.id }})
    }
  }
})

</script>

<style scoped>
</style>
