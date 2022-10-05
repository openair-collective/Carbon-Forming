<template>
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
    <article class="article">
      <project-view v-if="project" :project="project" />
      <loading v-else />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Team, Project } from '@/types'
import ProjectView from '@/components/project/Project.vue'
import Loading from '@/components/Loading.vue'
import { useTeamsStore } from '@/store/teams'
import log from '@/services/logger'

const MODULE_ID = 'views/team_projects/TeamProject'

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
    ...mapStores(useTeamsStore)
  },
  async created() {
    let project_id = this.$route.params.project_id as string
    this.project = await this.teamsStore.getTeamProjectById(this.team, project_id)
  }
})

</script>

<style scoped>
</style>