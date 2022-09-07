<template>
  <main>
    <section class="p-4">
      <h1 class="title is-3">Create your first team</h1>
      <team-form @team-saved="onTeamSaved" />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Team } from '@/types'
import { useUserStore } from '@/store/user'
import TeamForm from '@/components/TeamForm.vue'

export default defineComponent({
  components: { TeamForm },
  data() {
    return {
      isSaving: false
    }
  },
  computed: {
    ...mapStores(useUserStore)
  },
  methods: {
    onTeamSaved(team:Team) {
      this.userStore.addTeam(team.id)
        .then(()=> {
          this.$router.push({name: 'root'})
        })
    }
  }
})

</script>

<style scoped>
</style>