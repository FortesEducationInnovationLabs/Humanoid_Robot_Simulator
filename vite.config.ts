import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

const downloadHtmlPlugin = () => ({
  name: 'download-html-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api/download-html', (_req: any, res: any) => {
      const targetFile = path.resolve('dist/Humanoid_Simulator_v1.0.html');
      if (!fs.existsSync(targetFile)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Standalone HTML bundle is being generated. Please try again in a few seconds.');
        return;
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="Humanoid_Simulator_v1.0.html"');
      fs.createReadStream(targetFile).pipe(res);
    });
  },
});

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), downloadHtmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
