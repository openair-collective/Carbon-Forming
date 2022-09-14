<template>
  <section v-if="team">
    <header class="header p-4 has-background-white">
      <figure class="image is-64x64 is-pulled-left mr-4">
        <img :src="avatar">
      </figure>
      <h1 class="title is-4">
        {{ team.name }}
        <router-link
        v-if="canEdit"
        :to="disableEdit ? '' : { name: 'team-edit'}"
        class="button is-info is-small is-outlined ml-2"
        :class="{ 'is-disabled': disableEdit }"
      >
        Edit Team
      </router-link>
      </h1>
      <h2 class="subtitle">{{ team.location }}</h2>
    </header>
    <article class="article p-4 has-background-white-bis">
      <router-view :team="team" />
    </article>
  </section>
  <loading-view v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import { Team } from '@/types'
import { canEditTeam } from '@/helpers/authHelper'
import LoadingView from '@/components/Loading.vue'
import { TEAM_AVATAR_PLACEHOLDER } from '@/const'
import log from '@/services/logger'

const MODULE_ID ='components/teams/TeamShow'

export default defineComponent({
  components: { LoadingView },
  data() {
    return {
      team: undefined as Team | undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore),
    avatar():string {
      let result = TEAM_AVATAR_PLACEHOLDER
      if (this.team && 'avatar_url' in this.team) {
        result = this.team.avatar_url
      }
      return result
    },
    canEdit():boolean {
      // pinia bug - get type error when trying to reference mapState/mapStore from computed prop
      const store = useUserStore()
      return !!this.team && !!store.profile && canEditTeam(store.profile, this.team)
    },
    disableEdit():boolean {
      return this.$route.name !== 'team-show'
    }
  },
  created() {
    const id = this.$route.params.id as string
    this.setTeamByID(id)
  },
  beforeRouteUpdate(to) {
    const id = to.params.id as string
    this.setTeamByID(id)
  },
  methods: {
    setTeamByID(id:string) {
      this.teamsStore.getTeamById(id)
        .then(result => this.team = result)
    }
  }
})

</script>

<style scoped>
</style>
