<template>
  <div
    class="notification"
    :class="{
      'is-info': level === kLogLevel.info,
      'is-success': level === kLogLevel.success,
      'is-warning': level === kLogLevel.warning,
      'is-danger': level === kLogLevel.error
    }"
  >
    <button class="delete" @click="remove"></button>
    {{ message }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { LogLevel } from '@/enums'

export default defineComponent({
  name: "notification",
  props: {
    message: {
      type:String,
      default: ''
    },
    level: {
      type: Number as PropType<LogLevel>,
      default: LogLevel.info
    }
  },
  data() {
    return {
      kLogLevel: LogLevel
    }
  },
  methods: {
    remove() {
      this.$emit('remove')
    }
  }
})
</script>