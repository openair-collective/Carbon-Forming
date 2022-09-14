<template>
  <section>
    <header class="header p-4 has-background-white">
      <h1 class="title is-4">
        Competitions
        <router-link 
          v-if="canCreate"
          :to="{ name: 'comp-new' }"
          class="button is-info is-small is-outlined ml-2"
        >
          New Competition
        </router-link>
      </h1>
    </header>
    <article class="article p-4 has-background-white-bis">
      <div 
        v-if="list"
        class="columns is-multiline"
      >
        <div 
          v-for="(comp, i) in list" 
          :key="i"
          class="column is-one-third"
        > 
          <div
            @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
            class="box"
          >
            <router-link 
              :to="{ name: 'comp-show', params: { id: comp.id } }"
              class="button is-text" 
            > 
              <h2 class="title is-4">{{ comp.name }}</h2>
            </router-link>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { canCreateCompetition } from '@/helpers/authHelper'

export default defineComponent({
  computed: {
    ...mapStores(useCompetitionsStore, useUserStore),
    ...mapState(useCompetitionsStore, ['list']),
    ...mapState(useUserStore, {
        canCreate(store) {
          return store.guild && canCreateCompetition(store.guild)
        }
      })
  },
  created() {
    if (!this.list) {
      this.competitionsStore.fetchList()
    }
  }
})

</script>

<style scoped>
</style>
