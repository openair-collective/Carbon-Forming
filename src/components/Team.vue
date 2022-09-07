<template>
  <section v-if="team">
    <header class="header p-4 has-background-white">
      <figure class="image is-64x64 is-pulled-left mr-4">
        <img src="https://bulma.io/images/placeholders/64x64.png">
      </figure>
      <h1 class="title is-3">{{ team.name }}</h1>
      <h2 class="subtitle">{{ team.location }}</h2>
    </header>
    <article class="article p-4 has-background-white-bis">
      <h3 class="title is-4">Projects</h3>
      <div v-if="team.projects && team.projects.length">
        <ul>
          <li v-for="(project, i) in team.projects" :key="'project_'+ i" >
            {{ project }}
          </li>
        </ul>
      </div>
      <div v-else>
        <h4 class="title is-5">No projects yet</h4>
        <button class="button is-info">Create your first project</button>
      </div>
    </article>
  </section>
  <h1 v-else>Loading...</h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import log from '@/services/logger'

const MODULE_ID ='components/team'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      default: undefined
    }
  }
})

</script>

<style scoped>
</style>
