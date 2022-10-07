import { defineStore } from 'pinia'
import { LogLevel } from '@/enums'

const MODULE_ID = 'store/flash'

interface State {
  message:string
  level: LogLevel | null
}

export const useFlashStore = defineStore('flash', {
  state: (): State => ({
    message: '',
    level: null
  })
})