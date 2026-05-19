import {defineConfig, type Plugin} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import fs from "fs"

// GitHub Pages has no SPA rewrite: a hard refresh / direct link to a client
// route (e.g. /project/123, /users) returns the host's 404 page. Publishing a
// 404.html that is a copy of the built index.html lets React Router boot and
// resolve the route on the client.
const spaFallback = (): Plugin => ({
    name: "spa-fallback-404",
    closeBundle() {
        const dist = path.resolve(__dirname, "dist")
        const index = path.join(dist, "index.html")
        if (fs.existsSync(index)) {
            fs.copyFileSync(index, path.join(dist, "404.html"))
        }
    },
})

export default defineConfig({
    plugins: [react(), spaFallback()],
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