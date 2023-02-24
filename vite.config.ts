import { fileURLToPath, URL } from "url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

import * as child from "child_process";

const commitHash = child.execSync("git rev-parse --short HEAD").toString();

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
          additionalData: `@import "src/_bulma.scss";`
        }
      },
    },
    build: {
      minify: mode !== 'development',
      // sourcemap: mode === 'development' // still an issue https://github.com/vitejs/vite-plugin-vue/issues/35
    },
    define: {
      '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
      '__COMMIT_HASH__': JSON.stringify(commitHash)
    }
  }
})
