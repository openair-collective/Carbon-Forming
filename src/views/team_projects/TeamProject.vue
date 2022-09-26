<template>
  <main>
    <section class="p-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'team-show', params: { id: $route.params.id }}">
              &lt; Back to projects
            </router-link>
          </li>
        </ul>
      </nav>
    </section>
    <article class="article">
      <project-view v-if="project" :project="project" />
      <loading v-else />
    </article>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Team, Project } from '@/types'
import ProjectView from '@/components/Project.vue'
import Loading from '@/components/Loading.vue'
import { useProjectsStore } from '@/store/projects'
import log from '@/services/logger'

const MODULE_ID = 'views/TeamProject'

export default defineComponent({
  components: { Loading, ProjectView },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      project: undefined as Project | undefined,
      error:''
    }
  },
  computed: {
    ...mapStores(useProjectsStore)
  },
  created() {
    let project_id = this.$route.params.project_id as string
    this.projectsStore.getProjectById(project_id)
      .then(result => {
        this.project = result
      })
      .catch(error => { 
        this.error = error
      })
  }
})

</script>

<style scoped>
</style>