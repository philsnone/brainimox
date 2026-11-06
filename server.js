const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const version = (process.env.GIT_SHA || "dev").slice(0, 7);
const publicDir = path.join(__dirname, "public");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

// ---------- Bestenliste ----------
// Wird in einer Datei gespeichert. Im Container liegt /app/data auf einem Docker-Volume,
// damit die Liste ein neues Hochladen (Deploy) überlebt.
const datenDir = process.env.DATA_DIR || path.join(__dirname, "data");
const listenDatei = path.join(datenDir, "bestenliste.json");
const MAX_EINTRAEGE = 500;
const MAX_MUENZEN = 5000;
let bestenliste = [];
try {
  bestenliste = JSON.parse(fs.readFileSync(listenDatei, "utf8"));
  if (!Array.isArray(bestenliste)) bestenliste = [];
} catch (e) {
  bestenliste = [];
}

function speichern() {
  try {
    fs.mkdirSync(datenDir, { recursive: true });
    const tmp = listenDatei + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(bestenliste));
    fs.renameSync(tmp, listenDatei);
  } catch (e) {
    console.error("Bestenliste konnte nicht gespeichert werden:", e.message);
  }
}

function sortieren() {
  bestenliste.sort((a, b) => b.muenzen - a.muenzen || a.zeit - b.zeit);
  bestenliste = bestenliste.slice(0, MAX_EINTRAEGE);
}

// Gegen Spam: pro Adresse höchstens ein Eintrag alle 10 Sekunden
const letzterEintrag = new Map();

function json(res, status, daten) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(daten));
}

function eintragAnnehmen(req, res) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const jetzt = Date.now();
  if (jetzt - (letzterEintrag.get(ip) || 0) < 10000) return json(res, 429, { fehler: "Bitte kurz warten." });

  let body = "";
  req.on("data", (stueck) => {
    body += stueck;
    if (body.length > 1000) req.destroy();
  });
  req.on("end", () => {
    let d;
    try {
      d = JSON.parse(body);
    } catch (e) {
      return json(res, 400, { fehler: "Kaputte Daten." });
    }
    const name = String(d.name || "").replace(/\s+/g, " ").trim();
    const muenzen = Number(d.muenzen);
    const klasse = Number(d.klasse);
    if (!/^[A-Za-zÄÖÜäöüß ]{1,12}$/.test(name)) return json(res, 400, { fehler: "Name: 1 bis 12 Buchstaben." });
    if (!Number.isInteger(muenzen) || muenzen < 0 || muenzen > MAX_MUENZEN) return json(res, 400, { fehler: "Münzen stimmen nicht." });
    if (![3, 4].includes(klasse)) return json(res, 400, { fehler: "Klasse stimmt nicht." });

    letzterEintrag.set(ip, jetzt);
    if (letzterEintrag.size > 10000) letzterEintrag.clear();
    const eintrag = { id: jetzt.toString(36) + Math.random().toString(36).slice(2, 6), name, muenzen, klasse, zeit: jetzt };
    bestenliste.push(eintrag);
    sortieren();
    speichern();
    const platz = bestenliste.findIndex((e) => e.id === eintrag.id) + 1;
    json(res, 200, { id: eintrag.id, platz });
  });
}

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];
    if (url === "/health") {
      return json(res, 200, { status: "ok", version });
    }
    if (url === "/api/bestenliste") {
      if (req.method === "GET") return json(res, 200, bestenliste.slice(0, 20));
      if (req.method === "POST") return eintragAnnehmen(req, res);
      return json(res, 405, { fehler: "Geht nicht." });
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
