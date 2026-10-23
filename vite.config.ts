import { defineConfig, createServer, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Stops the build if any lesson is broken (an answer that isn't an option,
 * a missing tile…). The checks live in src/data/validateCourse.ts.
 */
function courseCheck(): Plugin {
  return {
    name: "shpoko-course-check",
    apply: "build",
    async buildStart() {
      const server = await createServer({
        configFile: false,
        root: __dirname,
        logLevel: "silent",
        appType: "custom",
        server: { middlewareMode: true, hmr: false },
        resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
      });
      try {
        const { validateCourse } = await server.ssrLoadModule("/src/data/validateCourse.ts");
        const problems: string[] = validateCourse();
        if (problems.length) this.error(`The course has ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
      } finally {
        await server.close();
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    courseCheck(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // "vendor" is one deliberate, long-cached file of libraries (~250 kB zipped).
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Libraries in their own files: they change rarely, so phones keep them
        // cached between updates. Only two groups, and "charts" may use "vendor"
        // but never the other way round (a loop between files leaves a blank page).
        manualChunks(id) {
          // The bundler's own helpers for older packages; everyone uses them.
          if (id.includes("commonjsHelpers")) return "vendor";
          if (!id.includes("node_modules")) return;
          // Only the admin pages draw charts; keep them (and lodash, which only
          // they use) out of everyone else's download.
          if (/node_modules\/(recharts|recharts-scale|d3-[^/]+|victory-vendor|react-smooth|decimal\.js-light|lodash)\//.test(id)) return "charts";
          return "vendor";
        },
      },
    },
  },
}));
