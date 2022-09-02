<template>
  <section v-if="team">
    <figure class="image is-64x64 is-pulled-left mr-4">
      <img src="https://bulma.io/images/placeholders/64x64.png">
    </figure>
    <h1 class="title is-2">{{ team.name }}</h1>
    <h2 class="subtitle">Region/Province/City, Country</h2>
    <hr/>
    <h3 class="title is-3">Projects</h3>
  </section>
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
    if (!this.team && this.$route.params.team_id) {
      firestore.team(this.$route.params.team_id as string)
        .then(result => this.team = result)
    }
    else {
      this.$router.push({ name: 'root'})
    }
  }
})

</script>

<style scoped>
</style>
