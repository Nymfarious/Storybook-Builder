import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Dynamic base path:
  // - For GitHub Pages (ghpages mode or production): /MeKu-Storybook-Builder/
  // - For Lovable/local development: /
  const base = mode === 'ghpages' || (mode === 'production' && process.env.GITHUB_PAGES === 'true')
    ? '/MeKu-Storybook-Builder/' 
    : '/';

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
  };
});
