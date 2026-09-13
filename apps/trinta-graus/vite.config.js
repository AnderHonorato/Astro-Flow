import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    // host:true faz o Vite escutar em 0.0.0.0 e imprimir a URL de rede,
    // que é a que você abre no celular pelo Wi-Fi.
    host: true,
    port: 5173,
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
