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

/** Libraries the first page already needs (plus small ones shared with "charts"). */
const CORE_LIBRARIES = new RegExp(
  "node_modules/(" +
    [
      "react", "react-dom", "scheduler", "react-is", "prop-types", "use-sync-external-store",
      "react-router", "react-router-dom", "@remix-run/router",
      "@supabase/[^/]+", "@tanstack/[^/]+", "framer-motion", "motion-dom", "motion-utils",
      // Radix building blocks; the bigger widgets only some pages use stay out.
      "@radix-ui/(?!react-(?:select|scroll-area|navigation-menu|menubar|context-menu|hover-card|slider|radio-group|toggle-group|accordion|aspect-ratio|tabs|alert-dialog|avatar)/)[^/]+",
      "@floating-ui/[^/]+", "react-remove-scroll[^/]*", "react-style-singleton",
      "use-callback-ref", "use-sidecar", "aria-hidden", "get-nonce", "detect-node-es",
      "clsx", "tailwind-merge", "class-variance-authority", "lucide-react", "sonner", "next-themes", "tslib",
    ].join("|") +
    ")/"
);

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
        // The libraries every page needs go in one long-cached "vendor" file;
        // anything else (forms, dates, charts…) stays with the pages that use it,
        // so the first visit doesn't download it. "charts" may use "vendor" but
        // never the other way round (a loop between files leaves a blank page).
        manualChunks(id) {
          // The bundler's own helpers for older packages; everyone uses them.
          if (id.includes("commonjsHelpers")) return "vendor";
          if (!id.includes("node_modules")) return;
          // Only the admin pages draw charts; keep them (and lodash, which only
          // they use) out of everyone else's download.
          if (/node_modules\/(recharts|recharts-scale|d3-[^/]+|victory-vendor|react-smooth|decimal\.js-light|lodash)\//.test(id)) return "charts";
          if (CORE_LIBRARIES.test(id)) return "vendor";
        },
      },
    },
  },
}));
