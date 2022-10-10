<template>
  <section class="teams">
    <div class="tabs">
      <ul>
        <li 
          @click="onTabClick(eTabs.TEAMS)"
          :class="{'is-active': activeTab === eTabs.TEAMS}"
        >
          <a class="is-size-3">Teams</a>
        </li>
        <li
          v-if="userStore.profile"
          @click="onTabClick(eTabs.MY_TEAMS)"
          :class="{'is-active': activeTab === eTabs.MY_TEAMS}"
        >
          <a class="is-size-3">My Teams</a>
        </li>
        <li v-if="activeTab === eTabs.MY_TEAMS">
          <router-link 
            :to="{ name: 'teams-new'}"
            class="button is-info is-outlined is-small"
          >
          Create a new team
          </router-link>
        </li>
      </ul>
    </div>
    <team-list 
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
      <div v-else-if="!paginate" class="tag is-medium">You’ve reached the end of the list</div>
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
      paginate: true,
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
    let profile = this.userStore.profile
    let tab = profile && this.$route.path === '/my-teams' ? TABS.MY_TEAMS : TABS.MY_TEAMS
    if (profile) {
      if (!this.userStore.teams) {
        this.userStore.fetchTeams()
      }
    }
    if (!this.teamsStore.list) {
      this.fetchMore()
    }
    else if (this.teamsStore.list.length < PAGING_SIZE) {
      this.paginate = false
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

<style scoped>
</style>
