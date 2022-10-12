<template>
  <section>
    <header class="header mb-4">
      <h1 class="title is-3">
        {{ project.name }}
      </h1>
    </header>
    <article class="article">
      <div v-if="project.competition && showCompetition" class="box box--with-border">
        <h2 class="title is-4">Competition</h2>
        <router-link :to="{ name: 'comp-show', params: { id: project.competition.id}}">
          {{ project.competition.name }}
        </router-link>
      </div>
      <h2 class="title is-4">Bill of Materials</h2>
      <div class="box box--with-border">
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
      </div>
      <h2 class="title is-4">Design Document</h2>
      <div class="box box--with-border">
        <template v-if="project.design_doc_url">
          <a :href="project.design_doc_url" target="_blank">
            {{ project.design_doc_url }}
          </a>
        </template>
        <template v-if="project.design_doc">
          <a
            :href="project.design_doc.url" 
            class="button is-info" 
            target="_blank"
          >
            Review Document
          </a>
        </template>
        <template v-if="!project.design_doc && !project.design_doc_url">
          <router-link 
            :to="{ 
              name: 'team-project-edit', 
              params: { project_id: $route.params.project_id }
            }"
            class="button is-text"
          >
            Add a Document
          </router-link>
        </template>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Project } from '@/types'
import log from '@/services/logger'

const MODULE_ID ='components/project/Project'

export default defineComponent({
  props: {
    project: {
      type: Object as () => Project,
      required: true
    },
    showCompetition: {
      type: Boolean,
      default: false
    }
  }
})

</script>

<style scoped>
</style>
