import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";
import { buildSite } from "./build.js";

const DIST_DIR = path.join(process.cwd(), "dist");
const PORT = 4173;
const WS_PORT = 35729;

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
      ".svg": "image/svg+xml"
    }[ext] || "text/plain";

  let data = await fs.readFile(filePath);
  if (ext === ".html") {
    data = Buffer.from(injectLiveReload(data.toString("utf8")));
  }

  res.setHeader("Content-Type", contentType);
  res.end(data);
};

const startServer = () => {
  const server = http.createServer((req, res) => {
    serveFile(req, res).catch((error) => {
      res.statusCode = 500;
      res.end(`Server error: ${error.message}`);
    });
  });

  const wss = new WebSocketServer({ port: WS_PORT });
  wss.on("connection", (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
  });

  server.listen(PORT, () => {
    console.log(`Preview: http://localhost:${PORT}`);
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
