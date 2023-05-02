<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li>
        <router-link :to="{ name: 'comp-projects', params: { id: $route.params.id }}">
          &lt; Back to ideas
        </router-link>
      </li>
    </ul>
  </nav>
  <section>
    <project-view v-if="project" :project="project"/>
    <loading v-else />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Competition, Project } from '@/types'
import ProjectView from '@/components/project/Project.vue'
import Loading from '@/components/Loading.vue'
import { useCompetitionsStore } from '@/store/competitions'
import log from '@/services/logger'

const MODULE_ID = 'views/competition_projects/CompetitionProject'

export default defineComponent({
  components: { Loading, ProjectView },
  props: {
    competition: {
      type: Object as () => Competition,
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
    ...mapStores(useCompetitionsStore),
  },
  created() {
    let project_id = this.$route.params.project_id as string
    this.competitionsStore.getCompetitionProjectById(this.competition, project_id)
      .then(result => {
        this.project = result
      })
  }
})

</script>

<style scoped>
</style>