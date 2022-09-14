<template>
  <div class="dashboard">
    <div class="sidebar has-background-grey-dark p-4">
      <router-link 
        :to="{name: 'teams'}" 
        class="button is-small is-fullwidth" 
      >
        Teams
      </router-link>
      <br/>
      <router-link 
        :to="{name: 'competitions'}"
        class="button is-small is-fullwidth"
      >
        Competitions
      </router-link>
    </div>
    <router-view class="content" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import log from '@/services/logger'

const MODULE_ID ='views/dashboard'

export default defineComponent({})

</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
}
.sidebar {
  width: 132px;
  flex:0 1 auto;
  order: 1;
}
.content {
  flex: 2;
  order: 2;
}
</style>
