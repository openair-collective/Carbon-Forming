<template>
  <div class="text-editor">
    <div class="content" v-html="valueFormatted" ref="content"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    valueFormatted():string {
      return this.value.replaceAll('<p><br></p>', '')
    }
  },
  mounted() {
    const $content = this.$refs.content as HTMLDivElement
    if ($content) {
      const embeddedVideo = $content.querySelectorAll('iframe[src*="youtube"]')
      embeddedVideo.forEach(function(item) {
        let wrapper = document.createElement('div')
        wrapper.classList.add(
          'embedded-video',
          'overflow-hidden'
        )
        wrapper.appendChild(item.cloneNode(true));
        item.replaceWith(wrapper);
      })
    }
  }
})
</script>

<style lang="scss">
.content p > br {
  display: none;
}
.content h1 {
  font-size: 2.5em;
}
.content h2 { 
  font-size: 2em;
}
.content .embedded-video {
  background-color: $white-ter;
}
.content .ql-video {
  display: block;
  width: 100%;
  height: 56.25vw;
  max-height: 360px;
  margin: 0 auto 1em;
}
</style>
