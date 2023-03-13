<template>
  <competition-list
    v-if="list.length"
    :list="list" 
    :showEnterButton="false"
    :showDescription="false"
  />
  <div
    v-else
    class="is-flex is-flex-direction-column is-align-items-center p-6"
  >
    <p class="mb-4 is-size-4">No competitions yet</p>
    <router-link
      :to="{ name: 'competitions' }"
      class="button is-primary"
    >
      Enter a competition
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Team, Competition } from '@/types'
import { useTeamsStore } from '@/store/teams'
import CompetitionList from '@/components/competition/CompetitionList.vue'
import { mapStores } from 'pinia'

export default defineComponent({
  components: { CompetitionList },
  props: {
    team: {
      type: Object as PropType<Team>,
      required: true
    }
  },
  computed: {
    ...mapStores(useTeamsStore),
    list():Competition[] {
      let comps = [] as Competition[]
      if (this.team.projects) {
        this.team.projects.forEach(p => {
          if (p.competition) {
            comps.push(p.competition)
          }
        })
      }
      return comps
    }
  },
  created() {
    if (!this.team.projects || !this.team.projects.length ) {
      this.teamsStore.fetchTeamProjects(this.team)
    }
  }
})
</script>

<style scoped>
</style>
