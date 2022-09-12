<template>
  <main>
    <section class="p-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
          <router-link :to="{ name: 'team-projects', params: { id: team.id }}">
              &lt; Back to projects
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Add Team Project</h1>
      <project-form
        :team="team"
        :project="project"
        @project-saved="onProjectSaved"
        @cancel="onCancel"
        class="p-4"
      />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project, Material } from '@/types';
import ProjectForm from '@/components/ProjectForm.vue';

export default defineComponent({
  components: { ProjectForm },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  computed: {
    project():Project {
      return {
        name: '',
        terms: false,
        materials: [] as Material[]
      } as Project
    }
  },
  methods: {
    onCancel() {
      const id = this.$route.params.id
      this.$router.replace({ name: 'teams', params: { id: id }})
    },
    onProjectSaved(project:Project) {
      const id = this.$route.params.id
      this.$router.replace({ name: 'team-project-show', params: { id: id, project_id: project.id }})
    }
  }
})

</script>

<style scoped>
</style>