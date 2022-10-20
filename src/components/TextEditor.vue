<template>
  <div ref='editor'></div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import Quill from 'Quill'
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
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ]
      },
      theme: 'snow',
      formats: ['bold', 'underline', 'italic', 'list'],
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
        let text = this.editor.getText()
        let value = text ? this.editor.root.innerHTML : ''
        this.$emit('text-change', value)
      }
    }
  }
})
</script>

<style scoped>
  .ql-container {
    min-height: 200px;
    font-size: 1em;
  }
</style>