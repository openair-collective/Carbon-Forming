<template>
  <section>
    <header class="header mb-4">
      <h3 class="title is-3">
        Competitions Entered
      </h3>
    </header>
    <article class="article has-background-white-bis">
      <competition-list :list="list" />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Team, Competition } from '@/types'
import { useTeamsStore } from '@/store/teams'
import CompetitionList from '@/components/CompetitionList.vue'
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
    if (!this.team.projects) {
      this.teamsStore.fetchTeamProjects(this.team)
    }
  }
})
</script>

<style scoped>
  .box {
    cursor:pointer;
  }
</style>
