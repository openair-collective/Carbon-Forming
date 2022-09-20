<template>
  <section>
    <header class="header p-4">
      <h1 class="title is-3">
        {{ project.name }}
          <router-link 
            :to="{name: 'team-project-edit', params: { project_id: project.id }}"
            class="button is-info is-small is-outlined ml-2"
          >
            Edit Project
          </router-link>
      </h1>
    </header>
    <article class="article p-4">
      <h2 class="title is-4">Competition</h2>
      <div v-if="project.competition_id" class="box box--with-border">
        <router-link :to="{ name: 'competitions', params: { id: project.competition_id}}">
          Competition Link
        </router-link>
      </div>
      <div v-else class="box box--with-border has-text-centered">
        <p class="mb-4">You have not entered this project in a competition yet</p>
        <button class="button is-info">Submit to a Competition</button>
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
      <h2 class="title is-4">OpenAir Github Link</h2>
      <div class="box box--with-border"></div>
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
