import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
    plugins: [react()],
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