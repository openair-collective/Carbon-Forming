<template>
  <section class="section">
    <div class="tabs">
      <ul role="tablist" aria-label="Teams">
        <li 
          @click="onTabClick(eTabs.TEAMS)"
          :class="{'is-active': activeTab === eTabs.TEAMS}"
          role="tab"
          :aria-selected="activeTab === eTabs.TEAMS"
        >
          <a class="is-size-5">Teams</a>
        </li>
        <li
          v-if="userStore.isAuthenticated"
          @click="onTabClick(eTabs.MY_TEAMS)"
          :class="{'is-active': activeTab === eTabs.MY_TEAMS}"
          role="tab"
          :aria-selected="activeTab === eTabs.MY_TEAMS"
        >
          <a class="is-size-5">My Teams</a>
        </li>
        <li v-if="userStore.isAuthenticated && activeTab === eTabs.MY_TEAMS">
          <router-link
            v-if="activeList.length > 0"
            :to="{ name: 'teams-new'}"
            class="button is-info is-rounded is-small mx-4"
            :aria-selected="activeTab === eTabs.MY_TEAMS"
          >
          Create a new team
          </router-link>
        </li>
      </ul>
    </div>
    <div
      v-if="activeList.length === 0"
      class="is-flex is-flex-direction-column is-align-items-center p-6"
    >
      <template v-if="activeTab === eTabs.TEAMS">
        <p class="mb-2 is-size-4">
          There are no teams.
        </p>
      </template>
      <template v-else>
        <p class="mb-4 is-size-4">
          You've got no teams
        </p>
        <router-link
          :to="{ name: 'teams-new'}"
          class="button is-info"
        >
        Create a team
        </router-link>
      </template>
    </div>
    <team-list
      v-else
      :list="activeList" 
      :showUserTeams="activeTab === eTabs.TEAMS"
      class="p-4" 
    />
    <div
      v-if="activeTab === eTabs.TEAMS"
      class="has-text-centered mt-4"
    >
      <button
        v-if="paginate"
        @click="fetchMore"
        class="button is-primary"
        :class="{ 'is-loading': isLoading}"
        :disabled="isLoading"
      >
        Show More
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { mapStores } from 'pinia'
import { PAGING_SIZE } from '@/consts'
import { Team } from '@/types'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import TeamList from '@/components/team/TeamList.vue'
import log from '@/services/logger'

const MODULE_ID ='views/teams'

enum TABS {
  TEAMS,
  MY_TEAMS
}

export default defineComponent({
  components: { TeamList },
  data() {
    return {
      eTabs: TABS,
      activeTab: TABS.TEAMS,
      paginate: false,
      isLoading: false
    }
  },
  computed: {
    ...mapStores(useUserStore, useTeamsStore),
    activeList():Team[] {
      let result = [] as Team[]
      if (this.activeTab === TABS.TEAMS) { 
        result = this.teamsStore.list || []
      }
      else {
        result = this.userStore.teams || []
      }
      return result
    }
  },
  created() {
    let isAuthenticated = this.userStore.isAuthenticated
    let name = this.$route.name
    let tab = name === 'teams' ? TABS.TEAMS : TABS.MY_TEAMS
    if (isAuthenticated) {
      if (!this.userStore.teams) {
        this.userStore.fetchTeams()
      }
    }
    else if(tab === TABS.MY_TEAMS) {
      tab = TABS.TEAMS
      this.$router.replace({ name: 'teams'})
    }
    if (!this.teamsStore.list) {
      this.fetchMore()
    }
    this.onTabClick(tab)
  },
  methods: {
    fetchMore() {
      this.isLoading = true
      const after = this.teamsStore.list ? this.teamsStore.list[this.teamsStore.list.length -1] : undefined
      this.teamsStore.fetch(after)
        .then(result => {
          this.paginate = !!result && result.length === PAGING_SIZE
        })
        .finally(()=>{
          this.isLoading = false
        })
    },
    onCreateNewTeam() {
      this.$router.push({ name: 'teams-new'})
    },
    onTabClick (tab:TABS) {
      if (this.activeTab !== tab) {
        let path = tab === TABS.TEAMS ? '/teams' : '/my-teams'
        this.$router.push({ path })
        this.activeTab = tab
      }
    }
  }
})

</script>
