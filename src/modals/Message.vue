<template>
  <section>
    <article>
      {{ message }}
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    meta: {
      type: Object as () => {
        message:string
      },
      required: true
    }
  },
  data() {
    return {
      message: this.meta.message
    }
  }
})
</script>
