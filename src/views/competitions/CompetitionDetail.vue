<template>
  <article 
    class="article is-flex-grow-1 has-background-white-bis "
    >
    <div class="columns">
      <div class="column is-8">
        <h2 class="title is-4 mb-4">Competition Details</h2>
        <text-editor-content :value="competition.description" class="mb-6"/>
        <h2 class="title is-4 mb-4">Competition Rules</h2>
        <text-editor-content :value="competition.rules" class="mb-6" />
        <h2 class="title is-4 mb-4">Judging Criteria</h2>
        <text-editor-content :value="competition.judging_criteria"/>
      </div>
      <div
        v-if="!competition.prizes_disabled"
        class="column"
      >
        <table class="table is-fullwidth">
          <tr>
            <td>First Prize</td>
            <td>{{ competition.prizes.first }}</td>
          </tr>
          <tr>
            <td>Second Prize</td>
            <td>{{ competition.prizes.second }}</td>
          </tr>
          <tr>
            <td>Runner Up</td>
            <td>{{ competition.prizes.third }}</td>
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