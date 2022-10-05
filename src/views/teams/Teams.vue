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
      </ul>
    </div>
    <team-list v-if="activeList" :list="activeList" class="p-4" />
    <loading v-else />
  </section>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { mapState, mapStores } from 'pinia'
import { Team } from '@/types'
import { useUserStore } from '@/store/user'
import { useTeamsStore } from '@/store/teams'
import TeamList from '@/components/TeamList.vue'
import log from '@/services/logger'
import Loading from '@/components/Loading.vue'

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
      activeTab: TABS.TEAMS
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
    if (!this.teamsStore.list) {
      this.teamsStore.fetchList()
    }
    if (!this.userStore.teams) {
      this.userStore.fetchTeams()
    }
  },
  methods: {
    onCreateNewTeam() {
      this.$router.push({ name: 'teams-new'})
    },
    onTabClick (tab:TABS) {
      this.activeTab = tab
    }
  }
})

</script>

<style scoped>
</style>
