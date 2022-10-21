<template>
  <section>
    <header class="header mb-4">
      <h1 class="title is-3">
        {{ project.name }}
        <router-link
          v-if="canEdit"
          :to="{ name: 'team-project-edit'}"
          class="button is-info is-small is-outlined ml-2"
        >
          Edit Project
        </router-link>
      </h1>
    </header>
    <article class="article">
      <div v-if="project.image && project.image.url">
        <div 
          class="project-image has-border-radius-6 has-background-grey-dark mb-4"
          :style="{ 'background-image': 'url(' + project.image.url + ')' }"
        >
        </div>
      </div>
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
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Project } from '@/types'
import { useUserStore } from '@/store/user'
import { canEditTeamWithId } from '@/helpers/authHelper'
import log from '@/services/logger'
import { mapStores } from 'pinia'

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
  },
  computed: {
    ...mapStores(useUserStore),
    canEdit():boolean {
      let result = false
      if (this.project.team && this.project.team.id && this.userStore.profile) {
        result = canEditTeamWithId(this.userStore.profile, this.project.team.id)
      }
      return result
    }
  }
})

</script>

<style scoped>
.project-image {
  height: 420px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
