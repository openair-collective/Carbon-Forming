<template>
  <div class="is-flex is-flex-direction-column is-align-items-center p-6">
    <div class="spinner mb-2"></div>
    <div class="title is-6">{ loading }</div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'loading'
})

</script>

<style scoped="true">
.spinner {
  width: 40px;
  height: 40px;
  background-color: #ddd;
  animation: sk-rotateplane 1.2s infinite ease-in-out;
}

.title {
  color: #ddd;
}

@keyframes sk-rotateplane {
  0% { 
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  } 50% { 
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  } 100% { 
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
  }
}

</style>