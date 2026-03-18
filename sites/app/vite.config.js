import * as fs from "node:fs";
import * as path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const source = process.env.VIZARR_DATA || "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr";

/**
 * Vite plugin that gracefully handles optional workspace packages.
 *
 * It reads pnpm-workspace.yaml to determine which workspace folders are
 * active.  For each package in `packageMap`, if the corresponding workspace
 * folder is commented-out (or absent), the plugin substitutes an empty ESM
 * module — no manual symlink cleanup required.
 *
 * @param {Record<string, string>} packageMap
 *   Maps package specifier → workspace folder name as it appears in
 *   pnpm-workspace.yaml, e.g. `{ "@biongff/roi-selector": "roi-selector" }`
 */
function optionalDeps(packageMap) {
  // Read workspace config once at startup
  const wsPath = path.resolve(__dirname, "../../pnpm-workspace.yaml");
  const wsContent = fs.readFileSync(wsPath, "utf-8");

  // Determine which packages are disabled (commented-out or missing)
  const disabled = new Set();
  for (const [pkg, folder] of Object.entries(packageMap)) {
    // Match an uncommented line like:  - 'roi-selector'  or  - "roi-selector"
    const re = new RegExp(`^\\s*-\\s*['"]?${folder}['"]?\\s*$`, "m");
    if (!re.test(wsContent)) {
      disabled.add(pkg);
      console.log(`[optional-deps] "${pkg}" (folder "${folder}") is not active in pnpm-workspace.yaml — will substitute empty module`);
    }
  }

  return {
    name: "optional-deps",
    enforce: "pre",
    resolveId(source) {
      if (disabled.has(source)) return `\0optional:${source}`;
      return null;
    },
    load(id) {
      if (id.startsWith("\0optional:")) {
        return "export default {}";
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Read workspace config to determine which packages are active
  const wsPath = path.resolve(__dirname, "../../pnpm-workspace.yaml");
  const wsContent = fs.readFileSync(wsPath, "utf-8");
  const roiActive = /^\s*-\s*['"]?roi-selector['"]?\s*$/m.test(wsContent);

  return {
    plugins: [
      optionalDeps({ "@biongff/roi-selector": "roi-selector" }),
      react(),
    ],
    resolve: {
      alias: {
        ...(mode === "development"
          ? {
              "@biongff/vizarr": path.resolve(__dirname, "../../viewer/src/index.tsx"),
              ...(roiActive
                ? { "@biongff/roi-selector": path.resolve(__dirname, "../../roi-selector/src/index.tsx") }
                : {}),
            }
          : {}),
      },
    },
    server: { open: `?source=${source}` },
  };
});
