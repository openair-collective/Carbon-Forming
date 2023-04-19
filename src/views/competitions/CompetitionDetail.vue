<template>
  <div 
    v-if="competition.image && competition.image.url"
    class="competition-image has-border-radius-6 has-background-grey-dark mb-5"
    :style="{ 'background-image': 'url(' + competition.image.url + ')' }">
  </div>
  <div class="columns">
    <div class="column">
      <text-editor-content :value="competition.description" class="mb-6"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import TextEditorContent from '@/components/TextEditorContent.vue'

export default defineComponent({
  components: { TextEditorContent },
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  }
})
</script>

<style scoped>
.competition-image {
  height: 420px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>