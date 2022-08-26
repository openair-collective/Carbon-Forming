<template>
  <h1>Home</h1>
  <div v-if="currentUser && currentUser.guild">
    <strong>Hello, {{ currentUser.guild.user.username}}</strong>
    <p>{{ currentUser.guild.roles }}</p>
    <img :src="currentUser.avatar" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia';
import { useUserStore } from '@/store/user';

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    ...mapStores(useUserStore),
    ...mapState(useUserStore, ['currentUser'])
  },
  mounted() {
    if (this.currentUser && !this.currentUser.guild) {
      this.userStore.fetchUserGuild()
    }
  }
})

</script>

<style scoped>
</style>
