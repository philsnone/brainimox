const http = require("http");
const port = process.env.PORT || 3000;
const version = (process.env.GIT_SHA || "dev").slice(0, 7);

http
  .createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", version }));
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><title>brainimox</title><h1>brainimox läuft</h1><p>Version ${version}</p>`);
  })
  .listen(port, () => console.log(`brainimox auf Port ${port}`));
