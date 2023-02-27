<template>
  <h3 class="title is-3">
    About {{ team.name }}
  </h3>
  <div class="columns">
    <div class="column">
      <text-editor-content :value="team.about" />
    </div>
    <div class="column is-4">
      <table class="table is-fullwidth">
        <tr 
          v-for="(name, i) in team.discord_usernames"
          :key="i"
        >
          <td>{{ name }}</td>
          <td></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import Loading from '@/components/Loading.vue'
import TextEditorContent from '@/components/TextEditorContent.vue'
import log from '@/services/logger'

const MODULE_ID ='components/TeamDetail'

export default defineComponent({
  components: { Loading, TextEditorContent },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  }
})

</script>

<style scoped>
</style>
