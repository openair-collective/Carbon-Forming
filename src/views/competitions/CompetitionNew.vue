<template>
  <section class="section">
    <header class="mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'collaborations'}">
              &lt; Back to collaboration
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Create Collaboration</h1>
    </header>
    <competition-form @cancel="onCancel" @comp-saved="onSaved" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LogLevel, UserRole } from '@/enums'
import CompetitionForm from '@/components/competition/CompetitionForm.vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { ERROR_AUTH } from '@/consts'
import log from '@/services/logger'
import { Competition } from '@/types'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm },
  computed: {
    ...mapStores(useFlashStore, useUserStore),
    canEdit():boolean {
      return this.userStore.role === UserRole.admin
    }
  },
  created() {
    if (!this.canEdit) {
      this.$router.push({name: 'collaborations'})
      .then(() => {
        this.flashStore.$patch({ message: ERROR_AUTH, level: LogLevel.warning })
      })
    }
  },
  methods: {
    onSaved(result:Competition) {
      this.$router.replace({ name: 'comp-edit', params: {id: result.id }})
        .then(() => {
          window.scrollTo({top : 0})
          this.flashStore.$patch({ message: 'Collaboration saved', level: LogLevel.success })
        })
    },
    onCancel() {
      this.$router.replace({ name: 'collaborations'})
    }
  }
})

</script>

<style scoped>
</style>