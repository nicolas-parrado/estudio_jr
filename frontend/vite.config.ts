import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Habilitar escucha externa para Docker
    port: 3000,
    allowedHosts: true, // Permitir acceso desde dominios externos como academy.nparrado.net
    watch: {
      usePolling: true, // Para asegurar el hot-reload dentro de Docker
    },
  },
});
