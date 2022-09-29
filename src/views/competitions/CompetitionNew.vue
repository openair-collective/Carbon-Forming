<template>
  <section class="p-4">
    <header class="mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'competitions'}">
              &lt; Back to competitions
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Create Competition</h1>
    </header>
    <article>
      <competition-form @cancel="onCancel" />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import CompetitionForm from '@/components/CompetitionForm.vue'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm },
  methods: {
    onCancel() {
      this.$router.replace({ name: 'competitions'})
    }
  }
})

</script>

<style scoped>
</style>