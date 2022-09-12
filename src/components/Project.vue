<template>
  <section>
    <header class="header p-4">
      <h1 class="title is-3">{{ project.name }}</h1>
      <router-link 
        :to="{name: 'team-project-edit', params: { project_id: project.id }}"
        class="button is-primary"
      >
        Edit Project
      </router-link>
    </header>
    <article class="article p-4">
      <h2 class="title is-4">Competitions</h2>
      <hr/>
      <h2 class="title is-4">Bill of Materials</h2>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Item Name*</th>
              <th>Price ($)</th>
              <th>Quantity*</th>
              <th>Purchase Link</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(m, i) in project.materials" 
              :key="'m'+ i"
            >
              <td>{{ m.name }}</td>
              <td>{{ m.cost }}</td>
              <td>{{ m.quantity }}</td>
              <td>{{ m.link }}</td>
            </tr>
          </tbody>
        </table>
      <hr/>
      <h2 class="title is-4">Design Document</h2>
      <hr/>
      <h2 class="title is-4">OpenAir Github Link</h2>
      <hr/>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Project } from '@/types'
import log from '@/services/logger'

const MODULE_ID ='components/project'

export default defineComponent({
  props: {
    project: {
      type: Object as () => Project,
      required: true
    }
  }
})

</script>

<style scoped>
</style>
