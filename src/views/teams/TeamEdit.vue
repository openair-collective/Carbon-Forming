<template>
  <section class="p-4">
    <header class="mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'team-show', params: { id: $route.params.id }}">
              &lt; Back
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Edit Team</h1>
    </header>
    <article>
      <team-form
        v-if="team"
        :team="team"
        @cancel="onCancel"
      />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import TeamForm from '@/components/team/TeamForm.vue'
import { useTeamsStore } from '@/store/teams'
import { mapStores } from 'pinia'
import log from '@/services/logger'

const MODULE_ID = 'views/teams/TeamEdit'

export default defineComponent({
  components: { TeamForm },
  data() {
    return {
      team: undefined as Team | undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore)
  },
  created() {
    const id = this.$route.params.id as string
    this.teamsStore.getTeamById(id)
      .then(team => this.team = team)
  },
  methods: {
    onCancel() {
      if (this.team){
        const id = this.$route.params.id
        this.$router.replace({ name: 'team-show', params: { id: this.team.id }})
      }
    }
  }
})

</script>

<style scoped>
</style>