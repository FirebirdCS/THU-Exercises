import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import fs from "fs"
import { createHash } from "crypto"

// public/style.css keeps its name in the build, so Cloudflare serves a stale
// copy after each deploy. The content hash in the query changes the cached URL
// whenever the stylesheet changes.
const versionPublicStylesheet = (): Plugin => ({
    name: "version-public-stylesheet",
    apply: "build",
    transformIndexHtml(html) {
        const css = fs.readFileSync(path.resolve(__dirname, "public/style.css"))
        const hash = createHash("sha256").update(css).digest("hex").slice(0, 10)
        return html.replace('href="/style.css"', `href="/style.css?v=${hash}"`)
    },
})

// Routing uses HashRouter, so every request hits "/" (always 200 on
// GitHub Pages) and the route lives after the "#". No 404.html SPA
// fallback is needed.
export default defineConfig({
    plugins: [react(), versionPublicStylesheet()],
    resolve: {
        alias: {
            // Supports imports like `src/bim-components/setup`
            src: path.resolve(__dirname, "src"),
            "@classes": path.resolve(__dirname, "src/classes"),
            "@reactComponents": path.resolve(__dirname, "src/react-components"),
            "@uiTemplates": path.resolve(__dirname, "src/ui-templates"),
            "@utils": path.resolve(__dirname, "src/utils"),
            "@db": path.resolve(__dirname, "src/firebase"),
            "@icons": path.resolve(__dirname, "src/index.ts")
        }
    },
})