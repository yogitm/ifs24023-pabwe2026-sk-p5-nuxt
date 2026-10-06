import { existsSync } from "fs";
import { spawn } from "child_process";
import { config } from "dotenv";

config();

const port = process.env.APP_PORT || process.env.PORT || 3000;
process.env.PORT = String(port);
process.env.NITRO_PORT = String(port);
process.env.NITRO_HOST = "0.0.0.0";

if (existsSync(".output/server/index.mjs")) {
  console.log(`Menjalankan Nuxt production server pada port ${port}...`);
  const nuxtServer = spawn("node", [".output/server/index.mjs"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: String(port), NITRO_PORT: String(port), NITRO_HOST: "0.0.0.0" },
  });
  nuxtServer.on("close", (code) => {
    process.exit(code);
  });
} else {
  console.log(`Menjalankan Nuxt preview pada port ${port}...`);
  const nuxtPreview = spawn("npx", ["nuxt", "preview", "--port", String(port)], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  nuxtPreview.on("close", (code) => {
    process.exit(code);
  });
}
