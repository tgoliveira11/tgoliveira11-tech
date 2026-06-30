import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      include: [
        "src/lib/**/*.ts",
        "src/modules/**/*.ts",
        "src/proxy.ts",
      ],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "**/*.schema.ts",
        "**/*.types.ts",
        "src/modules/public/about-content.ts",
        "src/modules/public/author-profile.ts",
        "src/modules/public/postforge-meta.ts",
        "src/modules/import/github-pages-writer.ts",
        "src/modules/import/github-pages-parser.ts",
        "src/modules/import/github-pages-report.ts",
        "src/modules/import/url-post-importer.ts",
        "src/modules/import/github-pages-importer.ts",
        "src/modules/posts/post-editor-payload.ts",
        "src/lib/markdown-editor/toolbar.ts",
        "src/modules/import/**",
        "src/modules/assets/local-storage-provider.ts",
        "src/modules/public/public-posts.repository.ts",
        "src/lib/load-env.ts",
        "src/lib/auth/secure-auth.ts",
        "src/modules/analytics/analytics.repository.ts",
      ],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
