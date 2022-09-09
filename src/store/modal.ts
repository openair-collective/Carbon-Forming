import { defineStore } from 'pinia'
import { Modal } from '@/types'
import log from '@/services/logger'

const MODULE_ID = 'store/modal'

interface State {
  options: Modal | null
}

export const useModalStore = defineStore('modal', {
  state: (): State => ({
    options: null
  })
})