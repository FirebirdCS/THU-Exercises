import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@classes": path.resolve(__dirname, "src/classes"),
            "@reactComponents": path.resolve(__dirname, "src/react-components"),
            "@utils": path.resolve(__dirname, "src/utils"),
        }
    }
})