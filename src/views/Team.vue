<template>
  <h1 v-if="team">Team {{ team.name }}</h1>
  <h1 v-else>Loading...</h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import firestore from '@/services/firestore'
import log from '@/services/logger'

const MODULE_ID ='views/team'

export default defineComponent({
  data() {
    return {
      team: null as Team|null
    }
  },
  mounted() {
    if (this.$route.params.id) {
      firestore.team(this.$route.params.id as string)
        .then(result => this.team = result)
    }
    else {
      this.$router.push({ path: 'home'})
    }
  }
})

</script>

<style scoped>
</style>
