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
    <team-list v-if="activeList" :list="activeList" class="p-4" />
    <loading v-if="loading" />
    <div
      v-if="activeTab === eTabs.TEAMS"
      class="has-text-centered mt-4"
    >
      <button
        v-if="paginate && !loading"
        @click="fetchMore"
        class="button is-primary"
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
import Loading from '@/components/Loading.vue'
import log from '@/services/logger'

const MODULE_ID ='views/teams'

enum TABS {
  TEAMS,
  MY_TEAMS
}

export default defineComponent({
  components: { TeamList, Loading },
  data() {
    return {
      eTabs: TABS,
      activeTab: TABS.TEAMS,
      paginate: false,
      loading: false
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
    this.fetchMore()
    if (!this.userStore.teams) {
      this.userStore.fetchTeams()
    }
    let tab = this.$route.path === '/teams' ? TABS.TEAMS : TABS.MY_TEAMS
    this.onTabClick(tab)
  },
  methods: {
    fetchMore() {
      const after = this.teamsStore.list ? this.teamsStore.list[this.teamsStore.list.length -1] : undefined
      this.teamsStore.fetch(after)
        .then(result => {
          this.paginate = !!result && result.length === PAGING_SIZE
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
