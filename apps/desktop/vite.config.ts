import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base: './'` makes Vite emit relative URLs in the production build
// (e.g. `src="./assets/index-XXX.js"`). The default `/` works for
// normal web servers, but Electron loads `dist/index.html` via
// `file://` — in that context `/` resolves to the drive root and the
// bundle cannot be found. Relative paths fix this for both packaged
// builds and `vite preview`.
export default defineConfig({
  base: './',
  plugins: [react()],
})
