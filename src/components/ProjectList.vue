<template>
  <div class="is-flex is-flex-wrap-wrap">
    <div  
      v-for="(project, i) in list" 
      :key="i"
      @click="$router.push({ 
        name: 'team-project-show', 
        params: { id: project.team.id, project_id: project.id }
      })" 
      class="box box--project mb-4 mr-4"
    >
      <router-link :to="{ 
        name: 'team-project-show', 
        params: { id: project.team.id, project_id: project.id }
      }"> 
        <h3 class="title is-3">{{ project.name }}</h3>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Project } from '@/types'

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<Project[]>,
      required: true
    }
  }
})
</script>

<style scoped>
  .box--project {
    cursor:pointer;
    max-width: 400px;
  }
</style>