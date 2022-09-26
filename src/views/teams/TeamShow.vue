<template>
  <section v-if="team">
    <header class="header px-4 pt-4 pb-0 has-background-white is-clearfix">
      <figure 
        class="image is-pulled-left mr-4"
        :style="{backgroundImage: `url(${avatar})`}  "
      >
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
      <div class="tabs mb-0 pb-0">
        <ul>
          <li 
            @click="onTabClick(kTabs.PROJECTS)"
            :class="{'is-active': activeTab === kTabs.PROJECTS}"
          >
            <a>Projects</a>
          </li>
          <li
            @click="onTabClick(kTabs.COMPS)"
            :class="{'is-active': activeTab === kTabs.COMPS}"
          >
            <a>Competitions Entered</a>
          </li>
        </ul>
      </div>
    </header>
    <article class="article has-background-white-bis p-5 my-0">
      <router-view :team="team" />
    </article>
  </section>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import { Team } from '@/types'
import { canEditTeam } from '@/helpers/authHelper'
import Loading from '@/components/Loading.vue'
import { TEAM_AVATAR_PLACEHOLDER } from '@/consts'
import log from '@/services/logger'

const MODULE_ID ='components/teams/TeamShow'

const TABS = {
  PROJECTS: 0,
  COMPS: 1
}

export default defineComponent({
  components: { Loading },
  data() {
    return {
      kTabs: TABS,
      team: undefined as Team | undefined,
      activeTab: TABS.PROJECTS
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useUserStore),
    avatar():string {
      let result = TEAM_AVATAR_PLACEHOLDER
      if (this.team && this.team.avatar) {
        result = this.team.avatar.url
      }
      return result
    },
    canEdit():boolean {
      let result = false
      if (this.team && this.userStore.profile) {
        result = canEditTeam(this.userStore.profile, this.team)
      }
      return result
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
    },
    onTabClick(tab:number) {
      this.activeTab = tab
      let name = tab === TABS.PROJECTS ? 'team-show' : 'team-competitions'
      this.$router.push({ name })
    }
  }
})

</script>

<style scoped>
.image {
  border-radius: 8px;
  background-repeat: no-repeat;
  background-size: cover;
  height: 80px;
  width: 80px;
}
</style>
