<template>
  <div
    class="modal app-modal"
    :class="{
      'is-active': options,
      'fullscreen': options && options.fullscreen
    }"
  >
    <div class="modal-background"></div>
    <div class="modal-card">
      <header
        v-if="options && options.title"
        class="modal-card-head"
      >
        <p class="modal-card-title">
          {{ options.title }}
        </p>
      </header>
      <component
        v-if="options && options.component"
        :is="options.component"
        :meta="options.meta"
        @close="close"
        class="modal-card-body"
        ref="childref"
      />
      <footer v-if="options && options.close" class="modal-card-foot">
      <button @click="close" class="button">
        Close
      </button>
    </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { useModalStore } from '@/store/modal';
import { mapStores, mapState } from 'pinia'
import { defineComponent } from 'vue'

import EnterCompetition from '@/modals/EnterCompetition.vue'
import Message from '@/modals/Message.vue'
import Confirm from '@/modals/Confirm.vue'

export default defineComponent({
  components: { 
    EnterCompetition, 
    Message,
    Confirm
  }, 
  name: 'app-modal',
  computed: {
    ...mapStores(useModalStore),
    ...mapState(useModalStore, ['options'])
  },
  methods: {
    close () {
      this.modalStore.$reset()
    }
  }
})
</script>

<style lang="scss" scoped>
  .modal {
    transform: translateY(0%);
  }
  .modal.fullscreen .modal-card {
    min-width: 100%;
    height: 100%;
    max-height: 100%;
  }
  .modal.fullscreen .modal-card-body {
    padding: 0;
  }
  .modal.fullscreen .modal-card-head {
    padding: 10px;
  }
  .slide-up-enter-active {
    transition: transform 0.4s ease-in-out;
  }
  .slide-up-leave-active {
    transition: transform 0.25s ease;
  }
  .slide-up-enter,
  .slide-up-leave-to {
    transform: translateY(100%);
  }
</style>