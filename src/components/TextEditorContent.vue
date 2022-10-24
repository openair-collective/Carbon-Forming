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
</style>
