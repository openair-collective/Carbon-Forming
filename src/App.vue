<template>
  <nav-bar />
  <main class="main">
    <div class="container">
      <flash id="flash" />
      <router-view />
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Flash from '@/components/Flash.vue'

const MODULE_ID = 'app'

export default defineComponent({
  name: "app",
  components: {
    NavBar,
    Flash
  }
})
</script>

<style scoped lang="scss">
#flash {
  position: sticky;
  top: 0;
  right: 0;
  left: 132px;
  z-index: 2;
} 
.main {
  display: flex;
  flex-grow: 1;
  z-index: 2;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: "";
    background: $black;
    clip-path: polygon(0 0, 100% 0, 100% 500px, 0 400px);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    position: absolute;
    z-index: 1;
  }
}
.main > .container {
  display: flex;
  flex-grow: 1;
  width: 100%;
  padding-top: 1em;
  padding-bottom: 0;
  z-index: 2;
}
.main > .container {
  padding-right: calc($gap / 2);
  padding-left: calc($gap / 2);
}

.main > .container > .section {
	flex-grow: 1;
	padding: 2em;
  overflow: hidden;
	border-top-right-radius: .5em;
	border-top-left-radius: .5em;
	background-color: $white;
}

</style>
