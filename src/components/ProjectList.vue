<template>
  <div class="is-flex is-flex-wrap-wrap">
    <div  
      v-for="(project, i) in list" 
      :key="i"
      @click="$router.push({ 
        name: 'team-project-show', 
        params: { id: project.team.id, project_id: project.id }
      })" 
      class="box mb-4 mr-4"
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
import { ProjectAggregate } from '@/types'

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<ProjectAggregate[]>,
      required: true
    }
  }
})
</script>

<style scoped>
  .box {
    cursor:pointer;
  }
</style>