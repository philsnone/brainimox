// =====================================================================
//  BRAINIMOX – Mathe-Jump&Run
//  Hier oben stehen alle Einstellungen. Zahlen ändern = Spiel ändern!
// =====================================================================
const EINSTELLUNGEN = {
  sprungKraft: 620,       // wie hoch der kleine Sprung ist (kurz tippen)
  haltenZeit: 0.4,        // so lange (Sekunden) hilft langes Drücken beim Hochfliegen
  haltenSchwerkraft: 0.25,// beim Drücken ist die Schwerkraft schwächer (0.25 = ein Viertel)
  fragezeichenHoehe: 290, // wie hoch die ?-Blöcke in der Luft hängen
  schwerkraft: 1700,      // wie schnell es wieder runterfällt
  levelSekunden: 50,      // wie lange das Level ungefähr dauert
  aufgaben: 3,            // wie viele Matheaufgaben im Level
  bonusMuenzen: 5,        // Münzen für eine richtige Antwort
  autschMuenzen: 1,       // Münzen weg, wenn man gegen eine Kiste oder ein Monster läuft
  monsterMuenzen: 10,     // Münzen, wenn man auf ein Monster springt
  schneemannMuenzen: 3,   // Münzen weg, wenn man einen Schneemann berührt
  drachenMuenzen: 5,      // Münzen weg, wenn man die Drachen-Aufgabe falsch löst
  drachenFlugzeit: 1.6,   // wie lange die Drachen-Kugel zu dir fliegt (kleiner = schneller)
  // Die Level: Jedes ist schneller und hat mehr Monster.
  // tempo = wie schnell du läufst, monsterTempo = wie schnell die Monster laufen,
  // monster = wie viele Monster (0 = keine, 1 = viele, 2 = ganz viele)
  // schneemaenner: true = Schneemänner statt Kisten
  // drachen = wie viele Drachen im Level kommen
  level: [
    { name: "Gras", tempo: 230, monsterTempo: 40, monster: 0.9, drachen: 1,
      himmel: "#7ec8ff", boden: "#5bbf4a", erde: "#a8743a", wolken: "rgba(255,255,255,0.85)" },
    { name: "Wiese", tempo: 260, monsterTempo: 55, monster: 1.3, drachen: 2, blumen: true,
      himmel: "#9ad3ff", boden: "#7ed957", erde: "#9a6b35", wolken: "rgba(255,255,255,0.9)" },
    { name: "Schnee", tempo: 290, monsterTempo: 70, monster: 1.8, drachen: 3, schnee: true, schneemaenner: true,
      himmel: "#c9dcef", boden: "#f7fbff", erde: "#a9bccf", wolken: "rgba(255,255,255,0.95)" },
  ],
  farben: {
    // Spielfigur
    haare: "#ff8c1a",     // orange
    tshirt: "#2f6fdb",    // blau
    hose: "#2e8b3a",      // grün
    haut: "#ffd2a8",
    schuhe: "#333",
    kiste: "#c98b3c",
    monster: "#8e44ad",   // lila
    drache: "#d62828",    // rot
    muenze: "#ffd23f",
  },
};

// ---------------------------------------------------------------------
//  Ab hier kommt die Technik
// ---------------------------------------------------------------------
const canvas = document.getElementById("spiel");
const ctx = canvas.getContext("2d");
const H = 450;            // Spielwelt ist immer 450 hoch
const BODEN = 370;        // hier ist der Boden
let W = 800;              // Breite hängt vom Bildschirm ab
let skala = 1;
let obenRand = 0;         // Platz über der Spielwelt (wenn das Gerät hochkant ist)
const MIN_BREITE = 520;   // so viel vom Level sieht man mindestens nebeneinander

const startSchicht = document.getElementById("start");
const aufgabeSchicht = document.getElementById("aufgabe");
const endeSchicht = document.getElementById("ende");

let spiel = null;         // aktueller Spielstand
let klasse = 3;
let letzteZeit = 0;

function groesseAnpassen() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  // Quer: Höhe füllt den Bildschirm. Hochkant: Breite füllt den Bildschirm,
  // damit man trotzdem genug vom Weg vor sich sieht.
  skala = Math.min(canvas.height / H, canvas.width / MIN_BREITE);
  W = canvas.width / skala;
  obenRand = (canvas.height / skala - H) * 0.6;
}
window.addEventListener("resize", groesseAnpassen);
groesseAnpassen();

// ---------- Level bauen ----------
function levelBauen(L) {
  const laenge = L.tempo * EINSTELLUNGEN.levelSekunden;
  // Zufallszahl, die bei jedem Spiel gleich ist (damit das Level immer gleich aussieht)
  const zufallFest = (n) => { const v = Math.sin(n * 12.9898 + L.tempo * 78.233) * 43758.5453; return v - Math.floor(v); };
  const kisten = [];
  const muenzen = [];
  const monster = [];
  const fragen = [];

  for (let i = 1; i <= EINSTELLUNGEN.aufgaben; i++) {
    fragen.push({ x: (laenge * i) / (EINSTELLUNGEN.aufgaben + 1), fertig: false });
  }
  const nahAnFrage = (x) => fragen.some((f) => Math.abs(f.x - x) < 300);

  let x = 700;
  let n = 0;
  while (x < laenge - 400) {
    if (!nahAnFrage(x)) {
      if (n % 2 === 0) {
        // Kiste mit Münzbogen darüber
        if (L.schneemaenner) kisten.push({ x, b: 44, h: 62, rand: 5, schneemann: true });
        else kisten.push({ x, b: 44, h: 44 });
        // ab "monster" über 1: manchmal noch ein Monster hinter der Kiste
        if (zufallFest(n + 100) < L.monster - 1) monster.push({ x: x + 230, b: 40, h: 38, lebt: true, umfallen: 0 });
        for (let k = -2; k <= 2; k++) {
          muenzen.push({ x: x + 22 + k * 32, y: BODEN - 120 + Math.abs(k) * 18, weg: false });
        }
      } else if (zufallFest(n) < L.monster) {
        // Monster
        monster.push({ x: x + 60, b: 40, h: 38, lebt: true, umfallen: 0 });
      } else {
        // Münzreihe am Boden
        for (let k = 0; k < 4; k++) muenzen.push({ x: x + k * 40, y: BODEN - 30, weg: false });
      }
    }
    n++;
    x += 380 + ((n * 137) % 260); // Abstand wechselt, ist aber jedes Mal gleich
  }
  // Drachen kommen zwischen den ?-Blöcken
  const drachen = [];
  const plaetze = [2.5, 1.5, 3.5, 0.6];
  for (let i = 0; i < Math.min(L.drachen || 0, plaetze.length); i++) {
    drachen.push({ start: (laenge * plaetze[i]) / (EINSTELLUNGEN.aufgaben + 1), zustand: "wartet" });
  }
  drachen.sort((a, b) => a.start - b.start);
  return { laenge, kisten, muenzen, monster, fragen, drachen, ziel: laenge };
}

function neuesSpiel(levelNr = 0, muenzen = 0) {
  const L = EINSTELLUNGEN.level[levelNr];
  spiel = {
    levelNr,
    L,
    level: levelBauen(L),
    x: 0,                 // wie weit das Männchen gelaufen ist
    y: BODEN,             // Füße des Männchens
    vy: 0,
    amBoden: true,
    muenzen,              // Münzen aus dem letzten Level nimmt man mit
    autschZeit: 0,
    pause: false,         // Pause wegen Matheaufgabe
    angehalten: false,    // Pause-Knopf gedrückt
    fertig: false,
    texte: [],            // kleine fliegende Texte wie "+1"
  };
}

// ---------- Steuerung ----------
function springen() {
  if (!spiel || spiel.pause || spiel.angehalten || spiel.fertig) return;
  if (spiel.amBoden) {
    spiel.vy = -EINSTELLUNGEN.sprungKraft;
    spiel.amBoden = false;
    spiel.halten = true;
    spiel.haltZeit = 0;
  }
}
// Solange man gedrückt hält, zieht die Schwerkraft schwächer und der Junge fliegt höher.
// So gilt: kurz drücken = kleiner Sprung, lange drücken = großer Sprung.
function loslassen() {
  if (spiel) spiel.halten = false;
}
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  springen();
});
window.addEventListener("pointerup", loslassen);
window.addEventListener("pointercancel", loslassen);
window.addEventListener("keydown", (e) => {
  if (["KeyP", "Escape"].includes(e.code)) return pauseUmschalten();
  if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
    e.preventDefault();
    if (!e.repeat) springen();
  }
});
window.addEventListener("keyup", (e) => {
  if (["Space", "ArrowUp", "KeyW"].includes(e.code)) loslassen();
});

document.querySelectorAll("[data-klasse]").forEach((knopf) => {
  knopf.addEventListener("click", () => {
    klasse = Number(knopf.dataset.klasse);
    startSchicht.classList.add("versteckt");
    neuesSpiel();
  });
});
// ---------- Pause ----------
const pauseKnopf = document.getElementById("pauseknopf");
const pauseSchicht = document.getElementById("pause");
function pauseUmschalten() {
  if (!spiel || spiel.fertig) return;
  spiel.angehalten = !spiel.angehalten;
  pauseSchicht.classList.toggle("versteckt", !spiel.angehalten);
}
pauseKnopf.addEventListener("click", pauseUmschalten);
document.getElementById("weiter").addEventListener("click", pauseUmschalten);
document.getElementById("abbrechen").addEventListener("click", () => {
  pauseSchicht.classList.add("versteckt");
  aufgabeSchicht.classList.add("versteckt");
  startSchicht.classList.remove("versteckt");
  spiel = null;
});
// Wenn man die App verlässt (z. B. Home-Taste), automatisch Pause machen
document.addEventListener("visibilitychange", () => {
  if (document.hidden && spiel && !spiel.angehalten && !spiel.fertig) pauseUmschalten();
});

document.getElementById("nochmal").addEventListener("click", () => {
  endeSchicht.classList.add("versteckt");
  if (spiel && EINSTELLUNGEN.level[spiel.levelNr + 1]) {
    neuesSpiel(spiel.levelNr + 1, spiel.muenzen); // nächstes Level
  } else if (spiel) {
    // alle Level geschafft: Name eintippen, dann Bestenliste, dann zum Start
    const muenzen = spiel.muenzen;
    spiel = null;
    nameEingeben(muenzen, klasse, () => startSchicht.classList.remove("versteckt"));
  }
});
document.getElementById("bestenlisteKnopf").addEventListener("click", () => {
  startSchicht.classList.add("versteckt");
  listeZeigen(null, () => startSchicht.classList.remove("versteckt"));
});
document.getElementById("vollbild").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else {
      await document.documentElement.requestFullscreen();
      if (screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape");
    }
  } catch (e) {
    // manche Geräte (z. B. iPhone) können das nicht – egal
  }
});

// ---------- Matheaufgaben ----------
function zufall(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function aufgabeMachen() {
  let text, loesung;
  const art = zufall(0, klasse === 3 ? 2 : 3);
  if (klasse === 3) {
    if (art === 0) { const a = zufall(10, 60), b = zufall(5, 39); text = `${a} + ${b}`; loesung = a + b; }
    else if (art === 1) { const a = zufall(30, 99), b = zufall(5, a - 10); text = `${a} − ${b}`; loesung = a - b; }
    else { const a = zufall(2, 10), b = zufall(2, 10); text = `${a} · ${b}`; loesung = a * b; }
  } else {
    if (art === 0) { const a = zufall(10, 60) * 10, b = zufall(5, 39) * 10; text = `${a} + ${b}`; loesung = a + b; }
    else if (art === 1) { const a = zufall(30, 99) * 10, b = zufall(5, 25) * 10; text = `${a} − ${b}`; loesung = a - b; }
    else if (art === 2) { const a = zufall(11, 25), b = zufall(2, 6); text = `${a} · ${b}`; loesung = a * b; }
    else { const b = zufall(2, 9), l = zufall(2, 10); text = `${b * l} : ${b}`; loesung = l; }
  }
  const antworten = new Set([loesung]);
  const schritte = [1, 2, 10, -1, -2, -10, 5, -5];
  while (antworten.size < 3) {
    const v = loesung + schritte[zufall(0, schritte.length - 1)];
    if (v >= 0) antworten.add(v);
  }
  return { text, loesung, antworten: [...antworten].sort(() => Math.random() - 0.5) };
}

// drache = true: Aufgabe kommt vom Drachen (falsch = Münzen weg, richtig = nichts passiert)
function aufgabeZeigen(drache = false, a = aufgabeMachen()) {
  const dieses = spiel;
  dieses.pause = true;
  document.getElementById("frage").textContent = (drache ? "🐉 " : "") + `${a.text} = ?`;
  const meldung = document.getElementById("meldung");
  meldung.textContent = "";
  const box = document.getElementById("antworten");
  box.innerHTML = "";
  let beantwortet = false;
  a.antworten.forEach((zahl) => {
    const knopf = document.createElement("button");
    knopf.className = "gross";
    knopf.textContent = zahl;
    knopf.addEventListener("click", () => {
      if (beantwortet) return;
      beantwortet = true;
      if (zahl === a.loesung && drache) {
        knopf.classList.add("richtig");
        meldung.textContent = "Richtig! Der Drache fliegt weg 🐉";
      } else if (zahl === a.loesung) {
        knopf.classList.add("richtig");
        meldung.textContent = `Super! +${EINSTELLUNGEN.bonusMuenzen} Münzen`;
        dieses.muenzen += EINSTELLUNGEN.bonusMuenzen;
      } else if (drache) {
        knopf.classList.add("falsch");
        const weg = Math.min(dieses.muenzen, EINSTELLUNGEN.drachenMuenzen);
        dieses.muenzen -= weg;
        meldung.textContent = `Falsch! −${weg} Münzen. Richtig ist ${a.loesung}`;
      } else {
        knopf.classList.add("falsch");
        meldung.textContent = `Fast! Richtig ist ${a.loesung}`;
      }
      setTimeout(() => {
        if (spiel !== dieses) return; // Spiel wurde inzwischen abgebrochen
        aufgabeSchicht.classList.add("versteckt");
        dieses.pause = false;
      }, 1500);
    });
    box.appendChild(knopf);
  });
  aufgabeSchicht.classList.remove("versteckt");
}

// ---------- Spiel-Logik ----------
const MANN_X = 160;       // wo das Männchen auf dem Bildschirm steht
function aktualisieren(dt) {
  pauseKnopf.classList.toggle("versteckt", !spiel || spiel.fertig);
  if (!spiel || spiel.pause || spiel.angehalten || spiel.fertig) return;
  const s = spiel;
  s.x += s.L.tempo * dt;
  let schwerkraft = EINSTELLUNGEN.schwerkraft;
  if (s.halten && s.vy < 0 && s.haltZeit < EINSTELLUNGEN.haltenZeit) {
    schwerkraft *= EINSTELLUNGEN.haltenSchwerkraft;
    s.haltZeit += dt;
  }
  s.vy += schwerkraft * dt;
  s.y += s.vy * dt;
  if (s.y >= BODEN) { s.y = BODEN; s.vy = 0; s.amBoden = true; }
  if (s.autschZeit > 0) s.autschZeit -= dt;

  // Männchen als Kasten: Breite 30, Höhe 70
  const links = s.x - 15, rechts = s.x + 15, oben = s.y - 70;

  for (const m of s.level.muenzen) {
    if (!m.weg && Math.abs(m.x - s.x) < 28 && m.y > oben - 14 && m.y < s.y + 14) {
      m.weg = true;
      s.muenzen++;
      s.texte.push({ text: "+1", x: m.x, y: m.y, zeit: 0.7 });
    }
  }
  const autsch = (anzahl = EINSTELLUNGEN.autschMuenzen) => {
    s.autschZeit = 1;
    const weg = Math.min(s.muenzen, anzahl);
    s.muenzen -= weg;
    s.texte.push({ text: weg ? `Autsch! −${weg}` : "Autsch!", x: s.x, y: oben - 10, zeit: 1 });
  };
  for (const k of s.level.kisten) {
    const r = k.rand || 0;
    if (s.autschZeit <= 0 && rechts > k.x + r && links < k.x + k.b - r && s.y > BODEN - k.h + 4) {
      autsch(k.schneemann ? EINSTELLUNGEN.schneemannMuenzen : EINSTELLUNGEN.autschMuenzen);
    }
  }
  // Monster: laufen auf dich zu. Von oben draufspringen = Monster fällt um!
  for (const m of s.level.monster) {
    if (!m.lebt) { m.umfallen += dt; continue; }
    m.x -= s.L.monsterTempo * dt;
    const kopf = BODEN - m.h;
    if (rechts <= m.x - m.b / 2 || links >= m.x + m.b / 2 || s.y <= kopf) continue;
    if (s.vy > 0 && s.y < kopf + 24) {
      m.lebt = false;
      s.vy = -450;            // kleiner Hüpfer nach dem Draufspringen
      s.amBoden = false;
      s.halten = false;
      s.muenzen += EINSTELLUNGEN.monsterMuenzen;
      s.texte.push({ text: `+${EINSTELLUNGEN.monsterMuenzen}`, x: m.x, y: kopf - 20, zeit: 1 });
    } else if (s.autschZeit <= 0) {
      autsch();
    }
  }
  // Drachen: fliegen von rechts rein und schießen eine Kugel mit einer Matheaufgabe auf dich.
  // Springst du drüber, bist du ausgewichen. Trifft sie dich, musst du die Aufgabe lösen.
  // (Drachen und Kugeln leben in Bildschirm-Koordinaten: sie fliegen mit dir mit.)
  for (const d of s.level.drachen) {
    if (d.zustand === "wartet") {
      if (s.x < d.start) continue;
      d.zustand = "kommt"; d.sx = W + 80; d.sy = 120; d.zeit = 0;
    }
    if (d.zustand === "weg") continue;
    d.zeit += dt;
    if (d.zustand === "kommt") {
      d.sx += (W - 110 - d.sx) * Math.min(1, dt * 3);
      if (d.zeit > 1.3) {
        d.zustand = "schiesst";
        const a = aufgabeMachen();
        d.kugel = { aufgabe: a, ax: d.sx - 45, ay: d.sy + 10, t: 0 };
        d.kugel.x = d.kugel.ax; d.kugel.y = d.kugel.ay;
      }
    } else if (d.zustand === "schiesst") {
      const k = d.kugel;
      k.t += dt / EINSTELLUNGEN.drachenFlugzeit;
      // fliegt auf Bauchhöhe zu dir und dann weiter nach links
      k.x = k.ax + (MANN_X - k.ax) * k.t;
      k.y = k.ay + (BODEN - 35 - k.ay) * Math.min(1, k.t);
      const getroffen = Math.abs(k.x - MANN_X) < 15 + 20 && k.y > s.y - 70 - 18 && k.y < s.y + 10;
      if (getroffen) {
        d.zustand = "fliegtWeg";
        s.texte.push({ text: "Getroffen!", x: s.x, y: s.y - 100, zeit: 1 });
        aufgabeZeigen(true, k.aufgabe);
        return;
      }
      if (k.x < MANN_X - 60) {
        d.zustand = "fliegtWeg";
        s.texte.push({ text: "+0 Ausgewichen!", x: s.x, y: s.y - 100, zeit: 1 });
      }
    } else if (d.zustand === "fliegtWeg") {
      d.sx += 260 * dt; d.sy -= 140 * dt;
      if (d.sx > W + 120) d.zustand = "weg";
    }
  }
  // ?-Blöcke hängen in der Luft: Man muss hochspringen und sie mit dem Kopf berühren
  const blockUnten = BODEN - EINSTELLUNGEN.fragezeichenHoehe + 28;
  const blockOben = blockUnten - 56;
  for (const f of s.level.fragen) {
    if (f.fertig) continue;
    if (rechts > f.x - 28 && links < f.x + 28 && oben < blockUnten && s.y > blockOben) {
      f.fertig = true;
      s.vy = Math.max(s.vy, 0); // Kopf stößt an: nicht weiter nach oben
      aufgabeZeigen();
      return;
    }
    if (links > f.x + 28) {
      f.fertig = true;
      f.verpasst = true;
      s.texte.push({ text: "Verpasst!", x: f.x, y: blockOben - 20, zeit: 1 });
    }
  }
  for (const t of s.texte) { t.zeit -= dt; t.y -= 40 * dt; }
  s.texte = s.texte.filter((t) => t.zeit > 0);

  if (s.x >= s.level.ziel) {
    s.fertig = true;
    const naechstes = EINSTELLUNGEN.level[s.levelNr + 1];
    if (naechstes) {
      document.getElementById("endeTitel").textContent = `Level ${s.levelNr + 1} geschafft!`;
      document.getElementById("ergebnis").textContent = `Du hast ${s.muenzen} Münzen. Weiter geht's: ${naechstes.name}!`;
      document.getElementById("nochmal").textContent = "Weiter ▶";
    } else {
      document.getElementById("endeTitel").textContent = "Alle Level geschafft! 🏆";
      document.getElementById("ergebnis").textContent = `Du hast ${s.muenzen} Münzen gesammelt! 🪙`;
      document.getElementById("nochmal").textContent = "Name eintragen ✏️";
    }
    setTimeout(() => endeSchicht.classList.remove("versteckt"), 600);
  }
}

// ---------- Malen ----------
function glied(ax, ay, bx, by, cx, cy, farbe1, farbe2, dicke) {
  // Arm oder Bein: zwei Stücke (oben + unten), z. B. Ärmel und Hand
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = dicke;
  ctx.strokeStyle = farbe1;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  ctx.strokeStyle = farbe2;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(cx, cy); ctx.stroke();
}

// Schneemann: steht auf dem Boden, man muss drüberspringen
function zeichneSchneemann(x) {
  const kugel = (y, r) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#9fb4c8";
  ctx.lineWidth = 2;
  kugel(BODEN - 16, 17);          // Bauch
  kugel(BODEN - 42, 12);          // Kopf
  // Knöpfe
  ctx.fillStyle = "#333";
  for (const y of [BODEN - 22, BODEN - 12]) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); }
  // Augen
  ctx.beginPath(); ctx.arc(x - 4, BODEN - 45, 1.8, 0, Math.PI * 2); ctx.arc(x + 4, BODEN - 45, 1.8, 0, Math.PI * 2); ctx.fill();
  // Karottennase (zeigt nach links, zum Jungen)
  ctx.fillStyle = "#ff8c1a";
  ctx.beginPath(); ctx.moveTo(x, BODEN - 42); ctx.lineTo(x - 12, BODEN - 40); ctx.lineTo(x, BODEN - 38); ctx.fill();
  // Hut
  ctx.fillStyle = "#333";
  ctx.fillRect(x - 11, BODEN - 54, 22, 3);
  ctx.fillRect(x - 7, BODEN - 66, 14, 12);
  ctx.fillStyle = "#d33";
  ctx.fillRect(x - 7, BODEN - 57, 14, 3);
  // Schal
  ctx.fillStyle = "#d33";
  ctx.fillRect(x - 10, BODEN - 32, 20, 4);
  ctx.fillRect(x + 4, BODEN - 32, 4, 11);
}

// Drache: fliegt, schlägt mit den Flügeln, schaut nach links zu dir
function zeichneDrache(x, y, zeit) {
  const F = EINSTELLUNGEN.farben;
  const schlag = Math.sin(zeit * 9);
  ctx.save();
  ctx.translate(x, y + Math.sin(zeit * 3) * 6);
  ctx.fillStyle = F.drache;
  ctx.strokeStyle = "#7a1010";
  ctx.lineWidth = 2;
  // Flügel hinten
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(25, -30 - schlag * 22); ctx.lineTo(40, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Schwanz
  ctx.beginPath(); ctx.moveTo(25, 4); ctx.quadraticCurveTo(55, 0, 62, -14); ctx.lineTo(56, 2); ctx.quadraticCurveTo(50, 14, 22, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath(); ctx.moveTo(62, -14); ctx.lineTo(70, -16); ctx.lineTo(64, -6); ctx.fill();
  // Körper
  ctx.fillStyle = F.drache;
  ctx.beginPath(); ctx.ellipse(8, 2, 28, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Bauch
  ctx.fillStyle = "#ffcf70";
  ctx.beginPath(); ctx.ellipse(6, 8, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Hals und Kopf
  ctx.fillStyle = F.drache;
  ctx.beginPath(); ctx.ellipse(-24, -12, 16, 12, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(-52, -8); ctx.lineTo(-50, 0); ctx.lineTo(-30, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Hörner
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath(); ctx.moveTo(-20, -22); ctx.lineTo(-14, -36); ctx.lineTo(-12, -20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-28, -22); ctx.lineTo(-26, -34); ctx.lineTo(-20, -22); ctx.fill();
  // Auge
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-28, -15, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(-29.5, -15, 2.2, 0, Math.PI * 2); ctx.fill();
  // Flügel vorne
  ctx.fillStyle = "#b51f1f";
  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(14, -38 - schlag * 26); ctx.lineTo(30, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Feuerkugel mit Matheaufgabe drauf
function zeichneKugel(k) {
  ctx.save();
  ctx.fillStyle = "rgba(255,140,0,0.45)";
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.arc(k.x + i * 14, k.y - i * 2, 16 - i * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#ff7b00";
  ctx.strokeStyle = "#c23b00";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(k.x, k.y, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#234";
  ctx.fillStyle = "#fff";
  ctx.strokeText(k.aufgabe.text, k.x, k.y - 28);
  ctx.fillText(k.aufgabe.text, k.x, k.y - 28);
  ctx.restore();
}

function zeichneMonster(x, m, zeit) {
  const F = EINSTELLUNGEN.farben;
  ctx.save();
  ctx.translate(x, BODEN);
  if (!m.lebt) {
    // umfallen: nach hinten kippen und verschwinden
    ctx.globalAlpha = Math.max(0, 1 - m.umfallen / 1.2);
    ctx.rotate(Math.min(1, m.umfallen * 3) * Math.PI / 2);
  }
  const b = m.b, h = m.h;
  // Füße (wackeln beim Laufen)
  const wackeln = m.lebt ? Math.sin(zeit / 12) * 4 : 0;
  ctx.fillStyle = "#4a235a";
  ctx.beginPath(); ctx.ellipse(-9 + wackeln, -3, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9 - wackeln, -3, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Körper
  ctx.fillStyle = F.monster;
  ctx.beginPath();
  ctx.moveTo(-b / 2, -4);
  ctx.lineTo(-b / 2, -h + b / 2);
  ctx.arc(0, -h + b / 2, b / 2, Math.PI, 0);
  ctx.lineTo(b / 2, -4);
  ctx.closePath();
  ctx.fill();
  // Hörnchen
  ctx.beginPath();
  ctx.moveTo(-12, -h + 4); ctx.lineTo(-15, -h - 8); ctx.lineTo(-5, -h + 1);
  ctx.moveTo(12, -h + 4); ctx.lineTo(15, -h - 8); ctx.lineTo(5, -h + 1);
  ctx.fill();
  // Augen (schauen nach links, zum Spieler)
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-8, -h + 17, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -h + 17, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  if (m.lebt) {
    ctx.beginPath(); ctx.arc(-10, -h + 18, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, -h + 18, 2.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // X-Augen
    ctx.strokeStyle = "#222"; ctx.lineWidth = 2;
    for (const ax of [-8, 6]) {
      ctx.beginPath();
      ctx.moveTo(ax - 3, -h + 14); ctx.lineTo(ax + 3, -h + 20);
      ctx.moveTo(ax + 3, -h + 14); ctx.lineTo(ax - 3, -h + 20);
      ctx.stroke();
    }
  }
  // Mund mit Zähnen
  ctx.fillStyle = "#2c0f3a";
  ctx.fillRect(-11, -h + 27, 20, 6);
  ctx.fillStyle = "#fff";
  for (const zx of [-9, -3, 3]) {
    ctx.beginPath(); ctx.moveTo(zx, -h + 27); ctx.lineTo(zx + 4, -h + 27); ctx.lineTo(zx + 2, -h + 31); ctx.fill();
  }
  ctx.restore();
}

function spielfigur(x, y, lauf, inLuft, blinkt) {
  if (blinkt) return;
  const F = EINSTELLUNGEN.farben;
  const s = inLuft ? 0.9 : Math.sin(lauf);        // Schwung von Armen und Beinen
  const huefte = y - 28, schulter = y - 50;

  const bein = (w, farbeSchuh) => {
    const knieX = x + Math.sin(w) * 11, knieY = huefte + 12;
    const fussX = knieX + Math.sin(w - 0.6) * 9, fussY = Math.min(y - 3, knieY + 13);
    glied(x, huefte, knieX, knieY, fussX, fussY, F.hose, F.hose, 8);
    ctx.fillStyle = farbeSchuh;
    ctx.beginPath(); ctx.ellipse(fussX + 3, fussY + 1, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  };
  const arm = (w) => {
    const ellX = x + Math.sin(w) * 9, ellY = schulter + 11;
    const handX = ellX + 5 + Math.sin(w) * 3, handY = ellY + 9;
    glied(x, schulter + 2, ellX, ellY, handX, handY, F.tshirt, F.haut, 6);
    ctx.fillStyle = F.haut;
    ctx.beginPath(); ctx.arc(handX, handY, 3.5, 0, Math.PI * 2); ctx.fill();
  };

  // hinterer Arm und hinteres Bein (etwas dunkler, weil sie hinten sind)
  ctx.filter = "brightness(0.8)";
  arm(-s * 0.9);
  bein(-s * 0.8, F.schuhe);
  ctx.filter = "none";

  // T-Shirt (Körper)
  ctx.fillStyle = F.tshirt;
  ctx.beginPath();
  ctx.roundRect(x - 9, schulter - 3, 18, huefte - schulter + 6, 6);
  ctx.fill();

  bein(s * 0.8, F.schuhe);

  // Kopf
  const kopfY = y - 61;
  ctx.fillStyle = F.haut;
  ctx.beginPath(); ctx.arc(x + 1, kopfY, 10, 0, Math.PI * 2); ctx.fill();
  // Haare (oben und hinten am Kopf, ein bisschen strubbelig)
  ctx.fillStyle = F.haare;
  ctx.beginPath();
  ctx.arc(x, kopfY - 1, 10.5, Math.PI * 0.95, Math.PI * 2.05);
  ctx.lineTo(x + 9, kopfY - 4);
  ctx.lineTo(x + 2, kopfY - 6);
  ctx.lineTo(x - 4, kopfY - 3);
  ctx.lineTo(x - 9, kopfY + 5);
  ctx.closePath();
  ctx.fill();
  for (const [dx, dy] of [[-7, -9], [-2, -12], [4, -11]]) {
    ctx.beginPath();
    ctx.moveTo(x + dx - 3, kopfY - 7);
    ctx.lineTo(x + dx, kopfY + dy - 4);
    ctx.lineTo(x + dx + 4, kopfY - 7);
    ctx.fill();
  }
  // Auge und Mund
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(x + 5, kopfY + 1, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x + 5, kopfY + 4, 3, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();

  arm(s * 0.9);
}

function malen() {
  const F = EINSTELLUNGEN.farben;
  const L = spiel ? spiel.L : EINSTELLUNGEN.level[0];
  ctx.setTransform(skala, 0, 0, skala, 0, 0);
  ctx.fillStyle = L.himmel;
  ctx.fillRect(0, 0, W, canvas.height / skala);
  // Erde bis ganz nach unten (wichtig, wenn das Gerät hochkant ist)
  ctx.fillStyle = L.erde;
  ctx.fillRect(0, obenRand + BODEN, W, canvas.height / skala);
  ctx.translate(0, obenRand);

  const kamera = spiel ? spiel.x - MANN_X : (performance.now() / 1000) * 60;
  const sx = (welt) => welt - kamera;

  // Wolken (bewegen sich langsamer = sieht weit weg aus)
  ctx.fillStyle = L.wolken;
  for (let i = 0; i < 12; i++) {
    const wx = ((i * 420 - kamera * 0.3) % (W + 400) + W + 400) % (W + 400) - 200;
    const wy = 60 + ((i * 53) % 120);
    ctx.beginPath();
    ctx.arc(wx, wy, 26, 0, Math.PI * 2);
    ctx.arc(wx + 30, wy - 10, 32, 0, Math.PI * 2);
    ctx.arc(wx + 62, wy, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boden
  ctx.fillStyle = L.erde;
  ctx.fillRect(0, BODEN, W, H - BODEN);
  ctx.fillStyle = L.boden;
  ctx.fillRect(0, BODEN, W, 16);

  // Wiese: bunte Blumen auf dem Boden
  if (L.blumen) {
    const farbenBlumen = ["#ff5d8f", "#ffd23f", "#ffffff", "#b48cff"];
    for (let i = 0; i < 60; i++) {
      const bx = ((i * 97 - kamera) % (W + 100) + W + 100) % (W + 100) - 50;
      ctx.fillStyle = "#2f8a2f";
      ctx.fillRect(bx - 1, BODEN - 8, 2, 8);
      ctx.fillStyle = farbenBlumen[i % farbenBlumen.length];
      ctx.beginPath(); ctx.arc(bx, BODEN - 10, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffb000";
      ctx.beginPath(); ctx.arc(bx, BODEN - 10, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Schnee: Schneeflocken fallen vom Himmel
  if (L.schnee) {
    ctx.fillStyle = "#fff";
    const t = performance.now() / 1000;
    for (let i = 0; i < 70; i++) {
      const fx = ((i * 131 - kamera * 0.6 + Math.sin(t + i) * 10) % W + W) % W;
      const fy = ((i * 53 + t * (30 + (i % 5) * 8)) % (BODEN + obenRand)) - obenRand;
      ctx.beginPath(); ctx.arc(fx, fy, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
    }
  }

  if (!spiel) return;
  const LV = spiel.level;
  const sichtbar = (x) => sx(x) > -80 && sx(x) < W + 80;

  // Kisten (oder Schneemänner)
  for (const k of LV.kisten) {
    if (!sichtbar(k.x)) continue;
    if (L.schneemaenner) { zeichneSchneemann(sx(k.x) + k.b / 2); continue; }
    ctx.fillStyle = F.kiste;
    ctx.fillRect(sx(k.x), BODEN - k.h, k.b, k.h);
    ctx.strokeStyle = "#7a4e1a";
    ctx.lineWidth = 3;
    ctx.strokeRect(sx(k.x), BODEN - k.h, k.b, k.h);
    ctx.beginPath();
    ctx.moveTo(sx(k.x), BODEN - k.h); ctx.lineTo(sx(k.x) + k.b, BODEN);
    ctx.moveTo(sx(k.x) + k.b, BODEN - k.h); ctx.lineTo(sx(k.x), BODEN);
    ctx.stroke();
  }

  // Monster
  for (const m of LV.monster) {
    if (!sichtbar(m.x) || m.umfallen > 1.2) continue;
    zeichneMonster(sx(m.x), m, spiel.x);
  }

  // Münzen
  for (const m of LV.muenzen) {
    if (m.weg || !sichtbar(m.x)) continue;
    ctx.fillStyle = F.muenze;
    ctx.strokeStyle = "#c79a00";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sx(m.x), m.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Fragezeichen-Blöcke
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of LV.fragen) {
    if (!sichtbar(f.x)) continue;
    const bx = sx(f.x), by = BODEN - EINSTELLUNGEN.fragezeichenHoehe;
    if (f.fertig) {
      // schon benutzt oder verpasst: grauer, leerer Block
      ctx.fillStyle = "#b5b5b5";
      ctx.fillRect(bx - 28, by - 28, 56, 56);
      continue;
    }
    ctx.fillStyle = "#ff9f1c";
    ctx.fillRect(bx - 28, by - 28, 56, 56);
    ctx.strokeStyle = "#c46d00";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx - 28, by - 28, 56, 56);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("?", bx, by + 2);
  }

  // Zielfahne
  if (sichtbar(LV.ziel)) {
    const zx = sx(LV.ziel);
    ctx.fillStyle = "#555";
    ctx.fillRect(zx - 3, BODEN - 160, 6, 160);
    ctx.fillStyle = "#e63946";
    ctx.beginPath();
    ctx.moveTo(zx + 3, BODEN - 160);
    ctx.lineTo(zx + 60, BODEN - 140);
    ctx.lineTo(zx + 3, BODEN - 120);
    ctx.fill();
  }

  // Männchen
  const blinkt = spiel.autschZeit > 0 && Math.floor(spiel.autschZeit * 10) % 2 === 0;
  spielfigur(MANN_X, spiel.y, spiel.x / 18, !spiel.amBoden, blinkt);

  // Drachen und ihre Aufgaben-Kugeln
  for (const d of LV.drachen) {
    if (d.zustand === "wartet" || d.zustand === "weg") continue;
    zeichneDrache(d.sx, d.sy, d.zeit);
    if (d.zustand === "schiesst") zeichneKugel(d.kugel);
  }

  // Fliegende Texte
  ctx.font = "bold 24px sans-serif";
  for (const t of spiel.texte) {
    ctx.fillStyle = t.text.startsWith("+") ? "#fff" : "#e63946";
    ctx.fillText(t.text.replace("+0 ", ""), sx(t.x), t.y);
  }

  // Anzeige oben: Münzen und Weg bis zum Ziel (immer ganz oben am Bildschirm)
  ctx.setTransform(skala, 0, 0, skala, 0, 0);
  ctx.textAlign = "left";
  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = F.muenze;
  ctx.beginPath();
  ctx.arc(32, 32, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#234";
  ctx.lineWidth = 5;
  ctx.strokeText(spiel.muenzen, 54, 33);
  ctx.fillText(spiel.muenzen, 54, 33);

  const balkenB = Math.min(300, W - 300), balkenX = (W - balkenB) / 2;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(balkenX, 22, balkenB, 16);
  ctx.fillStyle = "#e63946";
  ctx.fillRect(balkenX, 22, balkenB * Math.min(1, spiel.x / spiel.level.ziel), 16);
  // Level-Name unter dem Balken
  ctx.textAlign = "center";
  ctx.font = "bold 18px sans-serif";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#234";
  const levelText = `Level ${spiel.levelNr + 1}: ${L.name}`;
  ctx.strokeText(levelText, W / 2, 56);
  ctx.fillStyle = "#fff";
  ctx.fillText(levelText, W / 2, 56);
  // Am Anfang vom Level groß in der Mitte
  if (spiel.x < L.tempo * 2) {
    ctx.font = "bold 48px sans-serif";
    ctx.lineWidth = 7;
    ctx.strokeText(levelText, W / 2, 150 + obenRand);
    ctx.fillText(levelText, W / 2, 150 + obenRand);
  }
}

function schleife(zeit) {
  const dt = Math.min((zeit - letzteZeit) / 1000, 1 / 30);
  letzteZeit = zeit;
  aktualisieren(dt);
  malen();
  requestAnimationFrame(schleife);
}
requestAnimationFrame((z) => { letzteZeit = z; schleife(z); });
