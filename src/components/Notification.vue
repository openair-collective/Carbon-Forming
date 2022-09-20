<template>
  <div
    class="notification"
    :class="{
      'is-success': success,
      'is-danger': error
    }"
  >
    <button class="delete" @click="remove"></button>
    {{ error || success }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "notification",
  props: {
    success: { 
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    }
  },
  methods: {
    remove() {
      this.$emit('remove')
    }
  }
})
</script>