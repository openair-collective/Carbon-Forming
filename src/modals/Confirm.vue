<template>
  <section>
    <article>
      <p class="is-size-3 mb-4">{{ message }}</p>
      <div class="field is-grouped">
        <div class="control">
          <button 
            class="button is-primary"
            @click="confirm"
            :class="{
              'is-danger': meta.danger
            }"
          >
            {{ meta.confirmLabel }}
          </button>
        </div>
        <div class="control">
          <button 
            class="button"
            @click="$emit('close')"
          >
            {{ meta.cancelLabel }}
          </button>
        </div>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LogLevel } from '@/enums'

export default defineComponent({
  props: {
    meta: {
      type: Object as () => {
        message:string,
        confirm:() => void
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel'
        danger:false
      },
      required: true
    }
  },
  data() {
    return {
      LogLevel,
      message: this.meta.message
    }
  },
  methods: {
    confirm() {
      this.meta.confirm()
      this.$emit('close')
    }
  }
})
</script>
