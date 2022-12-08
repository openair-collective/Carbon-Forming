import { fileURLToPath, URL } from "url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig(({command, mode }) => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "bulma/sass/utilities/_all.sass";`
        }
      },
    },
    build: {
      minify: mode !== 'development',
      // sourcemap: mode === 'development' // still an issue https://github.com/vitejs/vite-plugin-vue/issues/35
    }
  }
})
