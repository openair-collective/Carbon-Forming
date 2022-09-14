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
      <loading-view v-else />
    </article>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Team, Project } from '@/types'
import ProjectView from '@/components/Project.vue'
import LoadingView from '@/components/Loading.vue'
import { useTeamsStore } from '@/store/teams'
import log from '@/services/logger'

const MODULE_ID = 'views/TeamProject'

export default defineComponent({
  components: { ProjectView, LoadingView },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      projects: [] as Project[],
      error:''
    }
  },
  computed: {
    ...mapStores(useTeamsStore),
    project():Project|undefined {
      if (this.projects) {
        const id = this.$route.params.project_id
        return this.projects.find(p => p.id === id) as Project
      }
    }
  },
  created() {
    this.error = ''
    this.teamsStore.getTeamProjects(this.team)
      .then(result => {
        this.projects = result as Project[]
      })
      .catch(error => {
        this.error = '<ERROR SHOW PROMPT>'
        log.error(MODULE_ID, '#created > Error' + error)
      })
  }
})

</script>

<style scoped>
</style>