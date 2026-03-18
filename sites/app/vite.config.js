import * as fs from "node:fs";
import * as path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const source = process.env.VIZARR_DATA || "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr";

/** Check whether a workspace folder is active (uncommented) in pnpm-workspace.yaml. */
function isWorkspaceFolderActive(wsContent, folder) {
  const re = new RegExp(`^\\s*-\\s*['"]?${folder}['"]?\\s*$`, "m");
  return re.test(wsContent);
}

/**
 * Vite plugin that substitutes an empty ESM module for optional workspace
 * packages whose folder is commented-out (or absent) in pnpm-workspace.yaml.
 *
 * @param {Set<string>} disabledPackages  Package specifiers to stub out.
 */
function optionalDeps(disabledPackages) {
  for (const pkg of disabledPackages) {
    console.log(`[optional-deps] "${pkg}" is not active in pnpm-workspace.yaml — substituting empty module`);
  }

  return {
    name: "optional-deps",
    enforce: "pre",
    resolveId(source) {
      if (disabledPackages.has(source)) return `\0optional:${source}`;
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
  const wsPath = path.resolve(__dirname, "../../pnpm-workspace.yaml");
  const wsContent = fs.readFileSync(wsPath, "utf-8");
  const roiActive = isWorkspaceFolderActive(wsContent, "roi-selector");

  const disabledPackages = new Set();
  if (!roiActive) disabledPackages.add("@biongff/roi-selector");

  return {
    plugins: [optionalDeps(disabledPackages), react()],
    define: {
      __ROI_AVAILABLE__: JSON.stringify(roiActive),
    },
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
