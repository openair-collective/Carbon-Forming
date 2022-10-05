<template>
  <div class="is-flex is-flex-wrap-wrap">
    <template v-if="list && list.length">
      <div  
        v-for="(team, i) in list" 
        :key="i"
        @click="$router.push({ 
          name: 'team-show', 
          params: { id: team.id }
        })" 
        class="box box--team mb-4 mr-4 is-flex-grow-1"
      >
        <figure 
          class="image is-pulled-left mr-4"
          :style="{backgroundImage: `url(${getTeamAvatar(team)})`}  "
        >
        </figure>
        <router-link :to="{ 
          name: 'team-show', 
          params: { id: team.id }
        }"> 
          <h3 class="title is-3">{{ team.name }}</h3>
          <h4 class="subtitle">{{ team.location }}</h4>
        </router-link>
      </div>
    </template>
    <div v-else>
      <p>No teams</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Team } from '@/types'

import { TEAM_AVATAR_PLACEHOLDER } from '@/consts'

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<Team[]>,
      required: true
    }
  },
  methods: {
    getTeamAvatar(team:Team):string {
      let result = TEAM_AVATAR_PLACEHOLDER
      if (team.avatar) {
        result = team.avatar.url
      }
      return result
    }
  }
})
</script>

<style scoped>
  .box--team {
    cursor:pointer;
    max-width: 400px;
  }
  .image {
    border-radius: 8px;
    background-repeat: no-repeat;
    background-size: cover;
    height: 80px;
    width: 80px;
  }
</style>