<template>
  <main>
    <section class="p-4">
      <project-form 
        :team="meta.team" 
        @project-saved="$emit('close')"
        @cancel="$emit('close')"
      />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProjectForm from '@/components/ProjectForm.vue';

export default defineComponent({
  components: { ProjectForm },
  props: {
    meta:{
      type: Object,
      default: null
    }
  }
})

</script>

<style scoped>
</style>