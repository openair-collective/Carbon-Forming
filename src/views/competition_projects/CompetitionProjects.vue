<template>
  <project-list
    v-if="competition.projects && competition.projects.length"
    :list="competition.projects"
    :show-team="true"
    @project-click="onProjectClick"
  />
  <div
    v-else
    class="is-flex is-flex-direction-column is-align-items-center p-6"
  >
    <p class="mb-4 is-size-4">
      No projects yet
    </p>
    <button
      @click="onEnterCompetition"
      class="button"
      :class="{
        'is-primary': acceptingEntries(competition),
        'is-light': !acceptingEntries(competition)
      }"
      :disabled="!acceptingEntries(competition)" 
    >
      Enter this competition
    </button>
    <p
      v-if="!acceptingEntries(competition)" 
      class="help is-danger mt-4"
    >
      We cannot accept submissions until the start date
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Project } from '@/types'
import { useCompetitionsStore } from '@/store/competitions'
import { useModalStore } from '@/store/modal'
import { mapStores } from 'pinia'
import ProjectList from '@/components/project/ProjectList.vue'
import { acceptingEntries } from  '@/helpers/compHelper'

export default defineComponent({
  components: { ProjectList },
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore, useModalStore)
  },
  created() {
    this.fetchProjects()
  },
  beforeRouteUpdate() {
    this.fetchProjects()
  },
  methods: {
    acceptingEntries,
    fetchProjects() {
      if (!this.competition.projects || !this.competition.projects.length) {
        this.competitionsStore.fetchCompetitionProjects(this.competition)
      }
    },
    onProjectClick(project:Project) {
      this.$router.push({ name: 'comp-project-show', params: { project_id: project.id }})
    },
    onEnterCompetition() {
      this.modalStore.options = {
        component: 'EnterCompetition',
        title: '',
        fullscreen: true,
        meta: {
          competition: this.competition
        }
      }
    }
  }
})
</script>
