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
import { LogLevel } from '@/enums'
import CompetitionForm from '@/components/competition/CompetitionForm.vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { ERROR_AUTH } from '@/consts'
import { canEditCompetitions } from '@/helpers/authHelper'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm },
  computed: {
    ...mapStores(useFlashStore, useUserStore)
  },
  created() {
    const oauth = this.userStore.oauth
    if (!oauth || !canEditCompetitions(oauth)) {
      this.$router.push({name: 'competitions'})
      .then(() => {
        this.flashStore.$patch({ message: ERROR_AUTH, level: LogLevel.warning })
      })
    }
  },
  methods: {
    onCancel() {
      this.$router.replace({ name: 'competitions'})
    }
  }
})

</script>

<style scoped>
</style>