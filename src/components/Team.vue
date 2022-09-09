<template>
  <section>
    <header class="header p-4 has-background-white">
      <figure class="image is-64x64 is-pulled-left mr-4">
        <img src="https://bulma.io/images/placeholders/64x64.png">
      </figure>
      <h1 class="title is-3">{{ team.name }}</h1>
      <h2 class="subtitle">{{ team.location }}</h2>
    </header>
    <article class="article p-4 has-background-white-bis">
      <router-view :team="team" />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import log from '@/services/logger'

const MODULE_ID ='components/team'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  }
})

</script>

<style scoped>
</style>
