#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestPath = join(root, "src", "generated", "content.manifest.js");
const localReexport = `export { projects, siteSettings, contentSource } from "../data/content.local.manifest.js";
`;

writeFileSync(manifestPath, localReexport, "utf8");
console.log("Reset src/generated/content.manifest.js to use local bundled content.");
