<template>
  <h2 class="title is-4">Submitted Projects</h2>
  <project-list
    v-if="competition.projects && competition.projects.length"
    :list="competition.projects"
    :show-team="true"
    @project-click="onProjectClick"
  />
  <div v-else>
    No projects
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Project } from '@/types'
import { useCompetitionsStore } from '@/store/competitions'
import { mapStores } from 'pinia'
import ProjectList from '@/components/project/ProjectList.vue'

export default defineComponent({
  components: { ProjectList },
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore)
  },
  created() {
    this.fetchProjects()
  },
  beforeRouteUpdate() {
    this.fetchProjects()
  },
  methods: {
    fetchProjects() {
      if (!this.competition.projects || !this.competition.projects.length) {
        this.competitionsStore.fetchCompetitionProjects(this.competition)
      }
    },
    onProjectClick(project:Project) {
      this.$router.push({ name: 'comp-project-show', params: { project_id: project.id }})
    }
  }
})
</script>
