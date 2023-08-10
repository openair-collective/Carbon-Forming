<template>
  <div ref='editor'></div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default defineComponent({
  name: 'text-editor',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Type something in here!'
    }
  },
  data() {
    return {
      editor: null as Quill | null
    };
  },
  mounted() {
    var _this = this
    const ref:HTMLDivElement = this.$refs.editor as HTMLDivElement
    if (ref) {
      this.editor = new Quill(ref, {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'header': 1 }, { 'header': 2 }], 
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'video']
          ],
        },
        theme: 'snow',
        formats: ['bold', 'underline', 'italic', 'list', 'header', 'link', 'video'],
        placeholder: this.placeholder
      })
      this.editor.root.innerHTML = this.value
      this.editor.on('text-change', function () {
        return _this.update()
      })
    }
  },
  methods: {
    update: function update() {
      if (this.editor) {
        const text = this.editor.getText()
        const value = text ? this.editor.root.innerHTML : ''
        this.$emit('text-change', value)
      }
    }
  }
})
</script>

<style>
  .ql-container {
    min-height: 200px;
    font-size: 1em;
  }

  .ql-editor .ql-video {
    width: 100%;
    height: 56.25vw;
    max-height: 576px;
  }
</style>