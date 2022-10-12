<template>
  <notification 
    v-if="message && level"
    :message="message" 
    :level="level"
    @remove="reset"
    class="has-border-radius-0 is-flex-grow-0 m-0"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useFlashStore } from '@/store/flash'
import Notification from './Notification.vue'

export default defineComponent({
  components: { Notification },
  computed: {
    ...mapStores(useFlashStore),
    ...mapState(useFlashStore, ['message', 'level'])
  },
  methods: {
    reset() {
      this.flashStore.$reset()
    }
  }
})
</script>

Notification