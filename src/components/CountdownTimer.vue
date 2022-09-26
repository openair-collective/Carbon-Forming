<template>
  <div class="timer">
    <div class="mb-1">Starting in:</div>
    <div
      :class="{ 'disabled' : !date }" 
      class="clock"
      >
      <div class="segment">
        <div class="panels mb-1">
          <div class="value">{{ daysFormatted[0] }}</div>
          <div class="value">{{ daysFormatted[1] }}</div>
        </div>
        <div>Days</div>
      </div>
      <div>:</div>
      <div class="segment">
        <div class="panels mb-1">
          <div class="value">{{ hoursFormatted[0] }}</div>
          <div class="value">{{ hoursFormatted[1] }}</div>
        </div>
        <div>Hours</div>
      </div>
      <div>:</div>
      <div class="segment">
        <div class="panels mb-1">
          <div class="value">{{ minutesFormatted[0] }}</div>
          <div class="value">{{ minutesFormatted[1] }}</div>
        </div>
        <div>Minutes</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const DAY_MILLIS = 1000 * 60 * 60 * 24
const HOUR_MILLIS = 1000 * 60 * 60
const MINS_MILLIS = 1000 * 60

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true
    }
  },
  data(){
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      interval: null as number|null
    }
  },
  computed: {
    daysFormatted():string[] {
      let result = ['0','0']
      if (this.days > 0) {
        result = this.pad(this.days).split('')
      }
      return result
    },
    hoursFormatted():string[] {
      let result = ['0','0']
      if (this.hours > 0) {
        result = this.pad(this.hours).split('')
      }
      return result
    },
    minutesFormatted():string[] {
      let result = ['0','0']
      if (this.minutes > 0) {
        result = this.pad(this.minutes).split('')
      }
      return result
    }
  },
  created() {
    this.startCountdown()
  },
  beforeUnmount() {
    this.endCountdown()
  },
  methods: {
    pad(value:number):string {
      return value < 10 ? '0' + value : value.toString()
    },
    startCountdown() {
      this.endCountdown()
      this.tick()
      this.interval = window.setInterval(this.tick, MINS_MILLIS)
    },
    tick() {
      let now = new Date().getTime()
      let distance = this.date.getTime() - now;
      this.days = Math.floor(distance / DAY_MILLIS)
      this.hours = Math.floor((distance % DAY_MILLIS) / HOUR_MILLIS)
      this.minutes = Math.floor((distance % HOUR_MILLIS) / MINS_MILLIS)

      if (distance < 0) {
        this.endCountdown()
      }
    },
    endCountdown() {
      this.interval && clearInterval(this.interval)
    }
  }
})
</script>

<style scoped>
  .clock {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 8px;
  }
  .segment {
    display: flex;
    flex-direction: column;
    flex: 0 1 auto;
    justify-content: flex-start;
  }
  .panels {
    display: flex;
    flex-direction: row;
    flex: 0 1 auto;
    gap: 8px;
  }
  .value {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    justify-content: center;
    background: #181C71;
    border-radius: 4px;
    width: 50px;
    height: 56px;
    color: white;
    font-size:1.5em;
  }
  .clock.disabled .value {
    background:whitesmoke;
  }
</style>
