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
          :to="{ name: 'team-edit'}"
          class="button is-info is-small is-outlined ml-2"
        >
          Edit Team
        </router-link>
      </h1>
      <h2 class="subtitle">{{ team.region }}, {{ team.country }}</h2>
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
    <article class="article has-background-white-bis p-5 my-0 is-flex-grow-1">
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
import { useFlashStore } from '@/store/flash'
import { Team } from '@/types'
import { canEditTeamWithId } from '@/helpers/authHelper'
import Loading from '@/components/Loading.vue'
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
    avatar():string {
      let result = TEAM_AVATAR_PLACEHOLDER
      if (this.team && this.team.avatar) {
        result = this.team.avatar.url
      }
      return result
    },
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
