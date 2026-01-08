import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import net from "node:net";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";
import { buildSite } from "./build.js";

const DIST_DIR = path.join(process.cwd(), "dist");
let PORT = 4173;
let WS_PORT = 35729;

const clients = new Set();

const injectLiveReload = (html) => {
  const script = `
    <script>
      const ws = new WebSocket('ws://' + location.hostname + ':${WS_PORT}');
      ws.onmessage = (event) => {
        if (event.data === 'reload') {
          location.reload();
        }
      };
    </script>
  `;
  return html.replace("</body>", `${script}</body>`);
};

const serveFile = async (req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  let filePath = path.join(DIST_DIR, safePath);

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath);
  const contentType =
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css",
      ".js": "text/javascript",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".ico": "image/x-icon"
    }[ext] || "application/octet-stream";

  let data = await fs.readFile(filePath);
  if (ext === ".html") {
    data = Buffer.from(injectLiveReload(data.toString("utf8")));
  }

  res.setHeader("Content-Type", contentType);
  res.end(data);
};

const startServer = async () => {
  const server = http.createServer((req, res) => {
    serveFile(req, res).catch((error) => {
      res.statusCode = 500;
      res.end(`Server error: ${error.message}`);
    });
  });

  const isPortFree = (port) =>
    new Promise((resolve) => {
      const tester = net
        .createServer()
        .once("error", (err) => {
          resolve(false);
        })
        .once("listening", () => {
          tester.close();
          resolve(true);
        })
        .listen(port);
    });

  // choose an available HTTP port first
  let httpFound = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    const ok = await isPortFree(PORT);
    if (ok) {
      httpFound = true;
      break;
    }
    console.warn(`HTTP port ${PORT} in use, trying ${PORT + 1}`);
    PORT += 1;
  }

  if (!httpFound) {
    console.error("Failed to find a free HTTP port");
    return;
  }

  let found = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    const ok = await isPortFree(WS_PORT);
    if (ok) {
      found = true;
      break;
    }
    console.warn(`WS port ${WS_PORT} in use, trying ${WS_PORT + 1}`);
    WS_PORT += 1;
  }

  if (!found) {
    console.error("Failed to find a free WS port");
    server.listen(PORT, () => {
      console.log(`Preview: http://localhost:${PORT} (Live reload disabled)`);
    });
    return;
  }

  const wss = new WebSocketServer({ port: WS_PORT });
  wss.on("error", (err) => {
    console.error("WS server error:", err.message);
  });
  wss.on("connection", (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
  });

  server.listen(PORT, () => {
    console.log(`Preview: http://localhost:${PORT} (WS: ${WS_PORT})`);
  });
};

const notifyReload = () => {
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send("reload");
    }
  }
};

await buildSite();
startServer();

const watcher = chokidar.watch(["content", "public", "site.config.json"], {
  ignoreInitial: true
});

watcher.on("all", async () => {
  await buildSite();
  notifyReload();
});