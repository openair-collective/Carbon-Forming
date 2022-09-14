<template>
  <main>
    <section class="p-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'team-show', params: { id: team.id }}">
              &lt; Back to projects
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Edit Project</h1>
      <project-form
        v-if="project"
        :team="team"
        :project="project"
        @cancel="onCancel"
      />
      <loading v-else />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import ProjectForm from '@/components/ProjectForm.vue'
import Loading from '@/components/Loading.vue'
import log from '@/services/logger'

const MODULE_ID = 'views/TeamProjectEdit'

export default defineComponent({
  components: { ProjectForm, Loading },
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
    }
  }
})

</script>

<style scoped>
</style>