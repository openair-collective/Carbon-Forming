<template>
  <article 
    class="article is-flex-grow-1 has-background-white-bis "
    >
    <div class="columns">
      <div class="column is-8">
        <h2 class="title is-4 mb-2">Competition Details</h2>
        <div class="mb-4">{{ competition.description }}</div>
        <h2 class="title is-4 mb-2">Competition Rules</h2>
        <div class="mb-4">{{ competition.rules }}</div>
        <h2 class="title is-4 mb-2">Judging Criteria</h2>
        <div class="mb-4">{{ competition.criteria }}</div>
      </div>
      <div
        v-if="!competition.prizesDisabled"
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

export default defineComponent({
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  }
})
</script>