<template>
  <section 
    v-if="team" 
    class="p-4"
  >
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
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { LogLevel } from '@/enums'
import Loading from '@/components/Loading.vue'
import TeamForm from '@/components/team/TeamForm.vue'
import { useTeamsStore } from '@/store/teams'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { mapStores } from 'pinia'
import { ERROR_PAGE_LOAD, ERROR_AUTH } from '@/consts'
import { canEditTeamWithId } from '@/helpers/authHelper'
import log from '@/services/logger'

const MODULE_ID = 'views/teams/TeamEdit'

export default defineComponent({
  components: { TeamForm, Loading },
  data() {
    return {
      team: undefined as Team | undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useUserStore, useFlashStore)
  },
  created() {
    const id = this.$route.params.id as string
    this.setTeamByID(id)
  },
  methods: {
    setTeamByID(id:string) {
      const profile = this.userStore.profile
      if (profile && canEditTeamWithId(profile, id)) {
        this.teamsStore.getTeamById(id)
        .then(result => {
          if (result) {
            this.team = result
          }
          else {
            this.flashStore.$patch({ message: ERROR_PAGE_LOAD, level: LogLevel.error })
          }
        })
        .catch(error => {
          this.flashStore.$patch({ message: ERROR_PAGE_LOAD, level: LogLevel.error })
        })
      }
      else {
        this.$router.push({name: 'team-show', params: { id }})
          .then(() => {
            this.flashStore.$patch({ message: ERROR_AUTH, level: LogLevel.warning })
          })
      }
    },
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