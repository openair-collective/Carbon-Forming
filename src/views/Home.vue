<template>
  <h1>Home</h1>
  <div v-if="currentUser && currentUser.guild">
    <strong>Hello, {{ currentUser.guild.user.username}}</strong>
    <p>{{ currentUser.guild.roles }}</p>
    <img :src="currentUser.avatar" />
  </div>
  <div>
    <h2>Comps list</h2>
    <template v-if="list && list.length">
      <p v-for="comp in list" :key="comp.name">{{ comp.name }}</p>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionStore } from '@/store/competition'

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    ...mapStores(useUserStore, useCompetitionStore),
    ...mapState(useUserStore, ['currentUser']),
    ...mapState(useCompetitionStore, ['list'])
  },
  mounted() {
    if (this.currentUser && !this.currentUser.guild) {
      this.userStore.fetchUserGuild()
    }
    else {
      this.competitionStore.fetchList()
    }
  }
})

</script>

<style scoped>
</style>
