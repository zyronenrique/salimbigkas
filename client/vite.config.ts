import path from 'node:path';
import { createRequire } from 'node:module'
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import Sitemap from 'vite-plugin-sitemap'

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), 
    react(),
    Sitemap({ 
      hostname: 'https://salimbigkas.web.app',
      dynamicRoutes: ['/', '/about-us', '/tos', '/privacy'],
    }),
    viteStaticCopy({
      targets: [
        {
          src: cMapsDir,
          dest: 'cmaps', // This will copy the cmaps directory to the root of the dist folder
        },
        {
          src: 'src/assets/dictionary/tagalog_dict_lines.json',
          dest: 'assets',
        },
      ],
    }),
  ],
  server: {
    open: true,
  },
  base: "/", // Replace with repo name
  build: {
    outDir: "dist",
  },
});
