import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSite } from "./build.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "site.config.json");
const DIST_NOJEKYLL = path.join(ROOT, "dist", ".nojekyll");

const original = await fs.readFile(CONFIG_PATH, "utf8");
const config = JSON.parse(original);
config.baseUrl = "/";

await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");

try {
  await buildSite();
  await fs.writeFile(DIST_NOJEKYLL, "", "utf8");
} finally {
  await fs.writeFile(CONFIG_PATH, original, "utf8");
}
