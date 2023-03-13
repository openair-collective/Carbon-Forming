<template>
  <section v-if="team" class="section is-flex is-flex-direction-column pb-0">
    <header class="header mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ path: backButtonPath }">
              &lt; {{ backButtonLabel }}
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="columns is-vcentered">
        <div class="column is-narrow">
          <figure 
            class="image"
            :style="{backgroundImage: `url(${getTeamAvatar(team)})`}  "
          >
          </figure>
        </div>
        <div class="column">
          <h1 class="title is-2 is-size-4-mobile">
            {{ team.name }}
            <router-link
              v-if="canEdit"
              :to="{ name: 'team-edit'}"
              class="button is-info is-rounded is-small ml-2"
            >
              Edit Team
            </router-link>
          </h1>
          <h2 class="subtitle">{{ getTeamLocation(team) }}</h2>
        </div>
      </div>
    </header>
    <div class="tabs mb-0 pb-0">
      <ul 
        role="tablist" 
        aria-controls="competitionInfo" 
        aria-label="Team Info"
      >
        <li 
          @click="onTabClick(eTabs.DETAILS)"
          :class="{'is-active': activeTab === eTabs.DETAILS}"
          role="tab"
          :aria-selected="activeTab === eTabs.DETAILS"
        >
          <a>Team Details</a>
        </li>
        <li 
          @click="onTabClick(eTabs.PROJECTS)"
          :class="{'is-active': activeTab === eTabs.PROJECTS}"
          role="tab"
          :aria-selected="activeTab === eTabs.PROJECTS"
        >
          <a>Projects</a>
        </li>
        <li
          @click="onTabClick(eTabs.COMPS)"
          :class="{'is-active': activeTab === eTabs.COMPS}"
          role="tab"
          :aria-selected="activeTab === eTabs.COMPS"
        >
          <a>Competitions</a>
        </li>
      </ul>
    </div>
    <div
      id="competitionInfo"
      class="has-background-white-bis p-5 is-flex-grow-1"
      role="tabpanel" 
      aria-live="polite"
    >
      <router-view :team="team" />
    </div>
  </section>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import { useFlashStore } from '@/store/flash'
import { Team } from '@/types'
import { canEditTeamWithId } from '@/helpers/authHelper'
import Loading from '@/components/Loading.vue'
import { getTeamLocation, getTeamAvatar } from '@/helpers/teamHelper'
import { TEAM_AVATAR_PLACEHOLDER, ERROR_NOT_FOUND } from '@/consts'
import log from '@/services/logger'
import { LogLevel } from '@/enums'

const MODULE_ID ='components/teams/TeamShow'

enum TABS {
  DETAILS,
  PROJECTS,
  COMPS
}

const TEAM_PATHS = {
  TEAM: 'team-show',
  PROJECTS: 'team-projects',
  COMPS: 'team-competitions'
}

const TEAM_PROJECT_ROOT_PATH = 'team-project'

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
    ...mapStores(useTeamsStore, useUserStore, useFlashStore),
    canEdit():boolean {
      let result = false
      if (this.team && this.team.id && this.userStore.profile) {
        result = canEditTeamWithId(this.userStore.profile, this.team.id)
      }
      return result
    }
  },
  created() {
    const id = this.$route.params.id as string
    this.setTeamByID(id)
    const name = this.$route.name as string
    if (name.indexOf(TEAM_PROJECT_ROOT_PATH) !== -1) {
      this.activeTab = TABS.PROJECTS
    }
    if (name === TEAM_PATHS.COMPS) {
      this.activeTab = TABS.COMPS
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      let parent_path = '/teams'
      let label = 'Back to Teams'
      if (from.path === '/my-teams') {
        parent_path = from.path
        label = "Back to My Teams"
      }
      let that = (vm as any)
      that.backButtonPath = parent_path
      that.backButtonLabel = label
    })
  },
  beforeRouteUpdate(to) {
    const id = to.params.id as string
    if (this.team && this.team.id !== id) {
      this.setTeamByID(id)
    }
  },
  methods: {
    getTeamAvatar,
    getTeamLocation,
    setTeamByID(id:string) {
      this.teamsStore.getTeamById(id)
        .then(result => {
          if (result) {
            this.team = result
          }
          else {
            throw new Error('Team not found.')
          }
        })
        .catch(error => {
          this.$router.replace({ name: 'my-teams'})
            .then(()=> {
              this.flashStore.$patch({ 
                message: ERROR_NOT_FOUND,
                level: LogLevel.error
              })
            })
        })
    },
    onTabClick(tab:number) {
      this.activeTab = tab
      if (this.team) {
        let path
        if (tab === TABS.PROJECTS) {
          path =  { name: TEAM_PATHS.PROJECTS }
        }
        else  if (tab === TABS.COMPS) {
          path = { name: TEAM_PATHS.COMPS }
        }
        else {
          path = { name: TEAM_PATHS.TEAM, params: { id: this.team.id }}
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
