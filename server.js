const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const version = (process.env.GIT_SHA || "dev").slice(0, 7);
const publicDir = path.join(__dirname, "public");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];
    if (url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", version }));
    }
    const file = path.join(publicDir, url === "/" ? "index.html" : path.normalize(url));
    if (!file.startsWith(publicDir + path.sep)) {
      res.writeHead(404);
      return res.end("Nicht gefunden");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Nicht gefunden");
      }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`brainimox auf Port ${port}`));
