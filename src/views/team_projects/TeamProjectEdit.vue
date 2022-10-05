<template>
  <section>
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li>
          <router-link :to="{ name: 'team-project-show', params: { project_id: $route.params.project_id }}">
            &lt; Back
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { mapStores } from 'pinia'
import ProjectForm from '@/components/project/ProjectForm.vue'
import Loading from '@/components/Loading.vue'
import { useTeamsStore } from '@/store/teams'

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
  async created() {
    let project_id = this.$route.params.project_id as string
    this.project = await this.teamsStore.getTeamProjectById(this.team, project_id)
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