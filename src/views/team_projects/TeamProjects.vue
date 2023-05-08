<template>
  <project-list
    v-if="team.projects && team.projects.length" 
    :list="team.projects"
    :can-edit="true"
    :show-team="false" 
    @project-click="onProjectClick"
  />
  <div
    v-else
    class="is-flex is-flex-direction-column is-align-items-center p-6"
  >
    <p class="mb-4 is-size-4 has-text-centered">No ideas yet. You must join a collaboration to upload an idea.</p>
    <router-link
      :to="{ name: 'collaborations' }"
      class="button is-primary"
    >
      Join a collaboration
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
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
