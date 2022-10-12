<template>
  <section>
    <header class="header mb-4">
      <h3 class="title is-3">
        Projects
      </h3>
    </header>
    <article>
      <project-list
        v-if="team.projects" 
        :list="team.projects"
        :can-edit="true"
        :show-team="false"
        @project-click="onProjectClick"
      />
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
    ...mapStores(useTeamsStore, useCompetitionsStore),
    projects():Project[] {
      let result = [] as Project[]
      if (this.team.projects) {
        result = Object.values(this.team.projects)
      }
      return result
    }
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
