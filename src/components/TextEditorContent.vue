<template>
  <div class="text-editor">
    <div class="content" v-html="valueFormatted" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    valueFormatted():string {
      return this.value.replaceAll('<p><br></p>', '')
    }
  }
})
</script>

<style scoped>
.content p > br {
  display: none;
}
.content h1 {
  font-size: 2.5em;
}
.content h2 { 
  font-size: 2em;
}
</style>
