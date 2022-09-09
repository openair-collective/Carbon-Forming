<template>
  <main>
    <section class="p-4">
      <h1 class="title is-3">Edit Project</h1>
      <project-form
        v-if="project"
        :team="team"
        :project="project"
        @project-saved="onProjectSaved"
        @cancel="onCancel"
      />
      <div v-else>Loading...</div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import ProjectForm from '@/components/ProjectForm.vue'
import log from '@/services/logger'

const MODULE_ID = 'views/TeamProjectEdit'

export default defineComponent({
  components: { ProjectForm },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      project: undefined as Project|undefined,
      error: ''
    }
  },
  computed: {
    ...mapStores(useTeamsStore)
  },
  created() {
    this.teamsStore.getTeamProjects(this.team)
      .then(result => {
        if (result) {
          let project_id = this.$route.params.project_id
          this.project = result.find(p => p.id === project_id)
        }
        else {
          this.error = "Could not find Team Project to edit <ADD PROMPT>"
        }
      })
      .catch((error) => {
        log.error(MODULE_ID, '#created > Error fetching team projects' + error)
      })
  },
  methods: {
    onCancel() {
      const project_id = this.$route.params.project_id
      this.$router.replace({ name: 'team-project-show', params: { project_id }})
    },
    onProjectSaved(project:Project) {
      const id = this.$route.params.id
      this.$router.replace({ name: 'team-project', params: { id, project_id: project.id }})
    }
  }
})

</script>

<style scoped>
</style>