<template>
  <section>
    <header class="header">
      <h3 class="title is-3">
        Competitions Entered
        <router-link  
          :to="{ name: 'competitions' }"
          class="button is-info is-small is-outlined ml-2"
        >
          Enter a competition
        </router-link>
      </h3>
    </header>
    <article class="article p-5 has-background-white-bis">
      <competition-list :list="list" />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Team, Competition } from '@/types'
import CompetitionList from '@/components/CompetitionList.vue'

export default defineComponent({
  components: { CompetitionList },
  props: {
    team: {
      type: Object as PropType<Team>,
      required: true
    }
  },
  computed: {
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
  }
})
</script>

<style scoped>
  .box {
    cursor:pointer;
  }
</style>
