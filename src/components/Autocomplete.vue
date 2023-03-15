<template>
  <div class="field"> 
    <label v-if="labelText" class="label">{{ labelText }}</label>
    <div 
      class="control has-icons-left"
      :class="{
        'is-active': showList
      }"
    >
      <input 
        type="text"
        class="input"
        :class="{
          'is-loading': showList && values.length === 0
        }"
        ref="inputRef"
        :placeholder="placeholder"
        @input="debouncedUpdate"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.up.prevent="onArrowUp"
        @keydown.down.prevent="onArrowDown"
        @keydown.enter.prevent="onEnter"
        @keydown.tab.prevent="onTab"
        @keydown.escape.prevent="onEscape"
        v-model="searchTerm"
        autocomplete="off"
        spellcheck="false"
      />
      <span class="icon is-left">
        <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
      </span>
      <div 
        v-if="showList" 
        ref="menu"
        class="menu p-3 elevation-0"
      >
        <div class="menu-wrap">
          <ul class="menu-list py-0">
            <li
              v-for="(value, i) in values"
              :key="i"
            >
              <a
                :class="{'is-active': i === selectedIndex }"
                @mousedown.prevent
                @click.prevent="selectValue(value)"
                @mouseenter="selectedIndex = i"
                tabindex="0"
              >
                {{ value }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { debounce } from '@/utils/debounce'

const DEBOUNCE_LENGTH = 250

export default defineComponent({
  name: 'autocomplete',
  emits: ['updated', 'selected'],
  props: {
    defaultValue: {
      type: String,
      default: ''
    },
    values: {
      type: Array as PropType<string[]>,
      default: []
    },
    labelText: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Search...'
    }
  },
  data() {
    return {
      searchTerm: '',
      selectedValue: '',
      selectedIndex: -1,
      debouncedUpdate: () => {},
      isInputFocused: false
    }
  },
  computed: {
    showList():boolean {
      return this.isInputFocused && this.values.length > 0
    }
  },
  created() {
    this.debouncedUpdate = debounce(this.update, DEBOUNCE_LENGTH)
  },
  mounted() {
    if (this.defaultValue) {
      this.selectValue(this.defaultValue)
    }
  },
  methods: {
    update() {
      this.$emit('updated', this.searchTerm)
    },
    selectValue(value:string) {
      this.selectedValue = value
      this.searchTerm = value
      this.selectedIndex = 0
      this.$emit('selected', value)
    },
    onFocus(event:Event) {
      this.isInputFocused = true
    },
    onBlur(event:Event) {
      this.isInputFocused = false
    },
    onArrowUp(event:Event) {
      if (this.showList && this.selectedIndex > 0 ) {
        this.selectedIndex = this.selectedIndex - 1
        this.scrollSelectionIntoView()
      }
    },
    onArrowDown(event:Event) {
      if (this.showList && this.selectedIndex < this.values.length - 1 ) {
        this.selectedIndex = this.selectedIndex + 1
        this.scrollSelectionIntoView()
      }
    },
    onEnter(event:Event) {
      this.selectValue(this.values[this.selectedIndex])
    },
    onTab(event:Event) {
      if (this.showList) {
        this.selectValue(this.values[this.selectedIndex])
        const input:HTMLInputElement = this.$refs.inputRef as HTMLInputElement
        if (input) input.blur()
      }
    },
    onEscape(event:Event) {
      let value = this.selectedValue || this.defaultValue
      if (value) {
        this.selectValue(value)
      }
      const inputRef:HTMLInputElement = this.$refs.inputRef as HTMLInputElement
      if (inputRef) {
        inputRef.blur()
      }
      this.update()
    },
    scrollSelectionIntoView() {
      this.$nextTick(() => {
        const menu:HTMLDivElement = this.$refs.menu as HTMLDivElement
        const wrap:HTMLDivElement = menu.querySelector('.menu-wrap') as HTMLDivElement
        const node:HTMLAnchorElement = wrap.querySelector('a.is-active') as HTMLAnchorElement
        if (!(node.offsetTop >= wrap.scrollTop && node.offsetTop + node.offsetHeight < wrap.scrollTop + wrap.offsetHeight)) {
          let scroll_to = 0
          if (node.offsetTop > wrap.scrollTop) {
            scroll_to = node.offsetTop + node.offsetHeight - wrap.offsetHeight
          } 
          else if (node.offsetTop < wrap.scrollTop) {
            scroll_to = node.offsetTop
          }
          wrap.scrollTo(0, scroll_to)
        }
      })
    },
  }
})
</script>

<style scoped>
.is-active.input,
.input:focus {
  border-color: hsl(0deg, 0%, 86%);
  border-bottom: none;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
}
.icon.is-left {
  display: flex;
  justify-content: center;
  align-items: center;
}
.menu {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 1;
  max-height: 312px;
  width: 100%;
  overflow: hidden;
  background-color: #ffffff;
  top: 36px;
  border: 1px solid hsl(0deg, 0%, 86%);
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.menu-wrap {
  position: relative;
  flex-grow: 1;
  overflow: hidden;
  overflow-y: auto;
}
</style>