<template>
  <article 
    class="article is-flex-grow-1"
    >
    <div 
      v-if="competition.image && competition.image.url"
      class="competition-image has-border-radius-6 has-background-grey-dark mb-5"
      :style="{ 'background-image': 'url(' + competition.image.url + ')' }">
    </div>
    <div class="columns">
      <div class="column">
        <h2 class="title is-4 mb-4">Competition Details</h2>
        <text-editor-content :value="competition.description" class="mb-6"/>
        <h2 class="title is-4 mb-4">Competition Rules</h2>
        <text-editor-content :value="competition.rules" class="mb-6" />
        <h2 class="title is-4 mb-4">Judging Criteria</h2>
        <text-editor-content :value="competition.judging_criteria"/>
      </div>
      <div
        v-if="!competition.prizes_disabled"
        class="column is-narrow"
      >
        <table class="table is-fullwidth">
          <tr>
            <td>First Prize</td>
            <td class="has-text-weight-bold">{{ competition.prizes.first  || 'TBD' }}</td>
          </tr>
          <tr>
            <td>Second Prize</td>
            <td class="has-text-weight-bold">{{ competition.prizes.second || 'TBD' }}</td>
          </tr>
          <tr>
            <td>Runner Up</td>
            <td class="has-text-weight-bold">{{ competition.prizes.third || 'TBD' }} </td>
          </tr>
        </table>
      </div>
    </div>
    </article>
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