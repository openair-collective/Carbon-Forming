<template>
  <div class="text-editor">
    <div class="content" v-html="value" />
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
  }
})
</script>
