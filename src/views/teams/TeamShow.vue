<template>
  <section v-if="team" class="is-flex is-flex-direction-column">
    <header class="header px-4 pt-4 pb-0 has-background-white is-clearfix">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ path: backButtonPath }">
              &lt; {{ backButtonLabel }}
            </router-link>
          </li>
        </ul>
      </nav>
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
            @click="onTabClick(eTabs.DETAILS)"
            :class="{'is-active': activeTab === eTabs.DETAILS}"
          >
            <a>Team Details</a>
          </li>
          <li 
            @click="onTabClick(eTabs.PROJECTS)"
            :class="{'is-active': activeTab === eTabs.PROJECTS}"
          >
            <a>Projects</a>
          </li>
          <li
            @click="onTabClick(eTabs.COMPS)"
            :class="{'is-active': activeTab === eTabs.COMPS}"
          >
            <a>Competitions</a>
          </li>
        </ul>
      </div>
    </header>
    <article 
      v-if="team"
      class="article has-background-white-bis p-5 my-0 is-flex-grow-1"
    >
      <router-view :team="team" />
    </article>
    <loading v-else />
  </section>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationNormalized } from 'vue-router'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import { Team } from '@/types'
import { canEditTeam } from '@/helpers/authHelper'
import Loading from '@/components/Loading.vue'
import { TEAM_AVATAR_PLACEHOLDER } from '@/consts'
import log from '@/services/logger'

const MODULE_ID ='components/teams/TeamShow'

enum TABS {
  DETAILS,
  PROJECTS,
  COMPS
}

const TEAM_PATHS = {
  TEAM: 'team-show',
  PROJECTS: 'team-projects',
  COMPS: 'team-comps'
}

export default defineComponent({
  components: { Loading },
  data() {
    return {
      eTabs: TABS,
      team: null as Team | null,
      activeTab: TABS.DETAILS,
      backButtonLabel: '',
      backButtonPath: ''
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
      return this.$route.name !== TEAM_PATHS.TEAM
    }
  },
  created() {
    const id = this.$route.params.id as string
    this.setTeamByID(id)
    const name = this.$route.name
    if (name === TEAM_PATHS.PROJECTS) {
      this.activeTab = TABS.PROJECTS
    }
    if (name === TEAM_PATHS.COMPS) {
      this.activeTab = TABS.COMPS
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      (vm as any).backButtonPath = from.path
      let label = "Back to Teams"
      if (from.path === '/my-teams') {
        label = "Back to My Teams"
      }
      (vm as any).backButtonLabel = label
    })
  },
  beforeRouteUpdate(to) {
    const id = to.params.id as string
    this.setTeamByID(id)
  },
  methods: {
    setTeamByID(id:string) {
      this.teamsStore.getTeamById(id)
        .then(result => this.team = result || null)
    },
    onTabClick(tab:number) {
      this.activeTab = tab
      if (this.team) {
        let path = { name: TEAM_PATHS.TEAM, params: { id: this.team.id }}
        if (tab === TABS.PROJECTS) {
          path.name = TEAM_PATHS.PROJECTS
        }
        if (tab === TABS.COMPS) {
          path.name = TEAM_PATHS.COMPS
        }
        this.$router.push(path)
      }
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
