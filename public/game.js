// =====================================================================
//  BRAINIMOX – Mathe-Jump&Run
//  Hier oben stehen alle Einstellungen. Zahlen ändern = Spiel ändern!
// =====================================================================
const EINSTELLUNGEN = {
  tempo: 230,             // wie schnell das Männchen läuft
  sprungKraft: 880,       // wie hoch es springt, wenn man lange drückt
  kurzerSprung: 0.7,      // kurz tippen = kleiner Sprung (0.7 = 70 % der Kraft)
  fragezeichenHoehe: 240, // wie hoch die ?-Blöcke in der Luft hängen
  schwerkraft: 1700,      // wie schnell es wieder runterfällt
  levelSekunden: 50,      // wie lange das Level ungefähr dauert
  aufgaben: 3,            // wie viele Matheaufgaben im Level
  bonusMuenzen: 5,        // Münzen für eine richtige Antwort
  autschMuenzen: 1,       // Münzen weg, wenn man gegen eine Kiste läuft
  farben: {
    himmel: "#7ec8ff",
    boden: "#5bbf4a",
    erde: "#a8743a",
    maennchen: "#222",
    kiste: "#c98b3c",
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
function levelBauen() {
  const laenge = EINSTELLUNGEN.tempo * EINSTELLUNGEN.levelSekunden;
  const kisten = [];
  const muenzen = [];
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
        kisten.push({ x, b: 44, h: 44 });
        for (let k = -2; k <= 2; k++) {
          muenzen.push({ x: x + 22 + k * 32, y: BODEN - 120 + Math.abs(k) * 18, weg: false });
        }
      } else {
        // Münzreihe am Boden
        for (let k = 0; k < 4; k++) muenzen.push({ x: x + k * 40, y: BODEN - 30, weg: false });
      }
    }
    n++;
    x += 380 + ((n * 137) % 260); // Abstand wechselt, ist aber jedes Mal gleich
  }
  return { laenge, kisten, muenzen, fragen, ziel: laenge };
}

function neuesSpiel() {
  spiel = {
    level: levelBauen(),
    x: 0,                 // wie weit das Männchen gelaufen ist
    y: BODEN,             // Füße des Männchens
    vy: 0,
    amBoden: true,
    muenzen: 0,
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
  }
}
// Loslassen: Wenn das Männchen noch nach oben fliegt, wird der Sprung kürzer.
// So gilt: kurz drücken = kleiner Sprung, lange drücken = großer Sprung.
function loslassen() {
  if (!spiel) return;
  const kleinsterSchwung = EINSTELLUNGEN.sprungKraft * EINSTELLUNGEN.kurzerSprung;
  if (spiel.vy < -kleinsterSchwung) spiel.vy = -kleinsterSchwung;
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
  startSchicht.classList.remove("versteckt");
  spiel = null;
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

function aufgabeZeigen() {
  const dieses = spiel;
  dieses.pause = true;
  const a = aufgabeMachen();
  document.getElementById("frage").textContent = `${a.text} = ?`;
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
      if (zahl === a.loesung) {
        knopf.classList.add("richtig");
        meldung.textContent = `Super! +${EINSTELLUNGEN.bonusMuenzen} Münzen`;
        dieses.muenzen += EINSTELLUNGEN.bonusMuenzen;
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
  s.x += EINSTELLUNGEN.tempo * dt;
  s.vy += EINSTELLUNGEN.schwerkraft * dt;
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
  for (const k of s.level.kisten) {
    if (s.autschZeit <= 0 && rechts > k.x && links < k.x + k.b && s.y > BODEN - k.h + 4) {
      s.autschZeit = 1;
      const weg = Math.min(s.muenzen, EINSTELLUNGEN.autschMuenzen);
      s.muenzen -= weg;
      s.texte.push({ text: weg ? `Autsch! −${weg}` : "Autsch!", x: s.x, y: oben - 10, zeit: 1 });
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
    document.getElementById("ergebnis").textContent = `Du hast ${s.muenzen} Münzen gesammelt! 🪙`;
    setTimeout(() => endeSchicht.classList.remove("versteckt"), 600);
  }
}

// ---------- Malen ----------
function strichmaennchen(x, y, lauf, inLuft, blinkt) {
  if (blinkt) return;
  ctx.strokeStyle = EINSTELLUNGEN.farben.maennchen;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  const schwung = inLuft ? 0.6 : Math.sin(lauf) * 0.7;
  const huefte = y - 32, schulter = y - 55;
  ctx.beginPath();
  ctx.arc(x, y - 63, 9, 0, Math.PI * 2);              // Kopf
  ctx.moveTo(x, y - 54); ctx.lineTo(x, huefte);        // Körper
  ctx.moveTo(x, huefte); ctx.lineTo(x + Math.sin(schwung) * 22, y);    // Bein 1
  ctx.moveTo(x, huefte); ctx.lineTo(x - Math.sin(schwung) * 22, y);    // Bein 2
  ctx.moveTo(x, schulter + 4); ctx.lineTo(x - Math.sin(schwung) * 18, schulter + 22); // Arm 1
  ctx.moveTo(x, schulter + 4); ctx.lineTo(x + Math.sin(schwung) * 18, schulter + 22); // Arm 2
  ctx.stroke();
}

function malen() {
  const F = EINSTELLUNGEN.farben;
  ctx.setTransform(skala, 0, 0, skala, 0, 0);
  ctx.fillStyle = F.himmel;
  ctx.fillRect(0, 0, W, canvas.height / skala);
  // Erde bis ganz nach unten (wichtig, wenn das Gerät hochkant ist)
  ctx.fillStyle = F.erde;
  ctx.fillRect(0, obenRand + BODEN, W, canvas.height / skala);
  ctx.translate(0, obenRand);

  const kamera = spiel ? spiel.x - MANN_X : (performance.now() / 1000) * 60;
  const sx = (welt) => welt - kamera;

  // Wolken (bewegen sich langsamer = sieht weit weg aus)
  ctx.fillStyle = "rgba(255,255,255,0.85)";
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
  ctx.fillStyle = F.erde;
  ctx.fillRect(0, BODEN, W, H - BODEN);
  ctx.fillStyle = F.boden;
  ctx.fillRect(0, BODEN, W, 16);

  if (!spiel) return;
  const L = spiel.level;
  const sichtbar = (x) => sx(x) > -80 && sx(x) < W + 80;

  // Kisten
  for (const k of L.kisten) {
    if (!sichtbar(k.x)) continue;
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

  // Münzen
  for (const m of L.muenzen) {
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
  for (const f of L.fragen) {
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
  if (sichtbar(L.ziel)) {
    const zx = sx(L.ziel);
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
  strichmaennchen(MANN_X, spiel.y, spiel.x / 18, !spiel.amBoden, blinkt);

  // Fliegende Texte
  ctx.font = "bold 24px sans-serif";
  for (const t of spiel.texte) {
    ctx.fillStyle = t.text.startsWith("+") ? "#fff" : "#e63946";
    ctx.fillText(t.text, sx(t.x), t.y);
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
  ctx.fillRect(balkenX, 22, balkenB * Math.min(1, spiel.x / L.ziel), 16);
}

function schleife(zeit) {
  const dt = Math.min((zeit - letzteZeit) / 1000, 1 / 30);
  letzteZeit = zeit;
  aktualisieren(dt);
  malen();
  requestAnimationFrame(schleife);
}
requestAnimationFrame((z) => { letzteZeit = z; schleife(z); });
