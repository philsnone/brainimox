// =====================================================================
//  BRAINIMOX – Mathe-Jump&Run
//  Hier oben stehen alle Einstellungen. Zahlen ändern = Spiel ändern!
// =====================================================================
const EINSTELLUNGEN = {
  sprungKraft: 480,       // wie hoch der kleine Sprung ist (kurz tippen)
  haltenZeit: 0.55,       // so lange (Sekunden) hilft langes Drücken beim Hochfliegen
  haltenSchwerkraft: 0.12,// beim Drücken ist die Schwerkraft schwächer (0.12 = ganz wenig)
  // Damit gilt: je länger du drückst, desto höher – in vielen kleinen Stufen.
  // Ungefähr: antippen 90 · 0,2 s 145 · 0,3 s 180 (reicht für ?-Block) · 0,4 s 220 · 0,6 s 270 (ganz hoch)
  fragezeichenHoehe: 290, // wie hoch die ?-Blöcke in der Luft hängen
  schwerkraft: 1700,      // wie schnell es wieder runterfällt
  levelSekunden: 100,     // wie lange das Level ungefähr dauert
  aufgaben: 5,            // wie viele Matheaufgaben im Level
  bonusMuenzen: 30,       // Münzen für eine richtige Antwort am ?-Block
  autschMuenzen: 1,       // Münzen weg, wenn man gegen eine Kiste oder ein Monster läuft
  monsterMuenzen: 20,     // Münzen, wenn man ein Monster besiegt (draufspringen oder Schwert)
  hotdogMuenzen: 10,      // Münzen weg, wenn man einen Riesen-Hotdog berührt (Wiese)
  schneemannMuenzen: 3,   // Münzen weg, wenn man einen Schneemann berührt
  drachenTrefferMuenzen: 5, // Münzen weg, wenn dich die Drachen-Kugel trifft
  drachenMuenzen: 5,      // nochmal Münzen weg, wenn man die Drachen-Aufgabe falsch löst
  ruestungPreis: 60,      // so viele Münzen kostet die Rüstung im Laden
  schwertPreis: 50,       // so viele Münzen kostet das Schwert im Laden
  figurPreis: 100,        // so viele Münzen kostet eine neue Figur im Laden
  // Figuren: jede kann etwas Besonderes. farben = andere Farben als der Junge, extra = Zubehör
  // sprung = so viel stärker springen, muenzen = so viele Münzen pro Münze, drachen = mal so viele Münzen pro Drache
  figuren: [
    { id: "junge", name: "Junge", kann: "Dein erster Held" },
    { id: "springer", name: "Springer", kann: "Springt richtig gut", sprung: 1.15, extra: "stirnband", zubehoer: "#1c1c1c",
      farben: { haare: "#1c1c1c", tshirt: "#ffd21f", hose: "#1c1c1c" } },               // schwarz-gelb
    { id: "ritter", name: "Ritter", kann: "Hat gleich ein Schwert", schwert: true, extra: "umhang", zubehoer: "#d62828",
      farben: { haare: "#6b3e1f", tshirt: "#f4f4f4", hose: "#d62828" } },               // weiß-rot
    { id: "panzer", name: "Panzer", kann: "Hat gleich eine Rüstung", ruestung: true, dunkleRuestung: true,
      farben: { haare: "#1c1c1c", tshirt: "#1c1c1c", hose: "#1c1c1c", schuhe: "#000" } }, // ganz schwarz
    { id: "jaeger", name: "Drachen-Jäger", kann: "Doppelte Münzen, stark gegen Drachen", muenzen: 2, drachen: 2,
      extra: "kappe", zubehoer: "#1c1c1c", feder: "#ffd21f",
      farben: { haare: "#ffd21f", tshirt: "#1c1c1c", hose: "#ffd21f" } },               // schwarz-gelb
  ],
  drachenBesiegtMuenzen: 10, // Münzen, wenn du einen Drachen mit dem Schwert besiegst
  drachenFlugzeit: 1.6,   // wie lange die Drachen-Kugel zu dir fliegt (kleiner = schneller)
  // Fliegen mit dem Raketen-Rucksack (nur in Leveln mit fliegen: true)
  raketenKraft: 2700,     // so stark schiebt die Rakete nach oben, solange du drückst
  flugSchwerkraft: 1300,  // so schnell sinkst du, wenn du loslässt
  flugTempoMax: 420,      // schneller geht es nicht hoch oder runter
  gewitterMuenzen: 2,     // Münzen weg, wenn du eine Gewitterwolke berührst
  // Die Level: Jedes ist schneller und hat mehr Monster.
  // tempo = wie schnell du läufst, monsterTempo = wie schnell die Monster laufen,
  // monster = wie viele Monster (0 = keine, 1 = viele, 2 = ganz viele)
  // schneemaenner: true = Schneemänner statt Kisten
  // fliegen: true = Level in der Luft: Raketen-Rucksack, Gewitterwolken statt Kisten
  // drachen = wie viele Drachen im Level kommen
  // berge, huegel = Farben der Berge und Hügel im Hintergrund
  level: [
    { name: "Gras", tempo: 230, monsterTempo: 40, monster: 0.9, drachen: 1,
      himmel: "#7ec8ff", boden: "#5bbf4a", erde: "#a8743a", wolken: "rgba(255,255,255,0.85)",
      berge: "#a9d8c0", huegel: "#7cc96a" },
    { name: "Wiese", tempo: 260, monsterTempo: 55, monster: 1.3, drachen: 2, blumen: true, hotdogs: true,
      himmel: "#9ad3ff", boden: "#7ed957", erde: "#9a6b35", wolken: "rgba(255,255,255,0.9)",
      berge: "#b6dcb0", huegel: "#95dd6c" },
    { name: "Schnee", tempo: 290, monsterTempo: 70, monster: 1.8, drachen: 9, schnee: true, schneemaenner: true,
      himmel: "#c9dcef", boden: "#f7fbff", erde: "#a9bccf", wolken: "rgba(255,255,255,0.95)",
      berge: "#8fa9c8", huegel: "#dce8f4" },
    { name: "Luft", tempo: 300, monsterTempo: 50, monster: 0.6, drachen: 10, fliegen: true,
      himmel: "#6ec3ff", boden: "#ffffff", erde: "#e6f4ff", wolken: "rgba(255,255,255,0.95)",
      berge: "#cfe9ff", huegel: "#f4faff" },
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
const H = 450;            // Spielwelt ist immer 450 hoch
const BODEN = 370;        // hier ist der Boden
let W = 800;              // Breite hängt vom Bildschirm ab (rechnet grafik.js aus)
let skala = 1;
let obenRand = 0;         // Platz über der Spielwelt (wenn das Gerät hochkant ist)
const MIN_BREITE = 520;   // so viel vom Level sieht man mindestens nebeneinander

const startSchicht = document.getElementById("start");
const aufgabeSchicht = document.getElementById("aufgabe");
const endeSchicht = document.getElementById("ende");

let spiel = null;         // aktueller Spielstand
let klasse = 3;
// Entwicklermodus (siehe entwickler.js): Figur nur für dieses Spiel, ohne Bestenliste
let entwicklerSpiel = false;
let entwicklerFigur = null;

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
  const gewitter = [];

  let x = 700;
  let n = 0;
  if (L.fliegen) {
    // In der Luft: ?-Blöcke in verschiedenen Höhen, Gewitterwolken und Münzen zum Einsammeln
    fragen.forEach((f, i) => { f.y = [150, 260, 190, 300, 170][i % 5]; });
    while (x < laenge - 400) {
      if (!nahAnFrage(x)) {
        const y = 140 + zufallFest(n) * 200;            // Höhe der Gewitterwolke
        gewitter.push({ x, y, b: 96, h: 48 });
        // Münzen ober- oder unterhalb der Wolke
        const my = y > 240 ? y - 90 : y + 90;
        for (let k = 0; k < 5; k++) muenzen.push({ x: x - 40 + k * 34, y: my + Math.sin(k) * 10, weg: false });
        // Fliegendes Monster zwischen den Wolken (es flattert auf und ab)
        if (zufallFest(n + 300) < L.monster) {
          const hoehe = 190 + zufallFest(n + 400) * 140; // Füße des Monsters
          monster.push({ x: x + 190, y: hoehe, basisY: hoehe, flug: true, zeit: n, b: 40, h: 38, lebt: true, umfallen: 0 });
        }
      }
      n++;
      x += 330 + ((n * 137) % 220);
    }
  }
  while (!L.fliegen && x < laenge - 400) {
    if (!nahAnFrage(x)) {
      if (n % 2 === 0) {
        // Kiste mit Münzbogen darüber
        if (L.schneemaenner) kisten.push({ x, b: 44, h: 62, rand: 5, schneemann: true });
        else if (L.hotdogs) kisten.push({ x, b: 104, h: 48, rand: 6, hotdog: true }); // Riesen-Hotdog
        else kisten.push({ x, b: 44, h: 44 });
        // ab "monster" über 1: manchmal noch ein Monster hinter der Kiste
        if (zufallFest(n + 100) < L.monster - 1) monster.push({ x: x + 230, b: 40, h: 38, lebt: true, umfallen: 0 });
        for (let k = -2; k <= 2; k++) {
          muenzen.push({ x: x + kisten[kisten.length - 1].b / 2 + k * 32, y: BODEN - 120 + Math.abs(k) * 18, weg: false });
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
  // gleichmäßig verteilt; wenn ein Drache kurz vor einem ?-Block käme, kommt er erst danach
  const D = L.drachen || 0;
  for (let i = 0; i < D; i++) {
    let start = (laenge * (i + 1)) / (D + 1);
    for (const f of fragen) if (start > f.x - 1400 && start < f.x + 200) start = f.x + 250;
    drachen.push({ start, zustand: "wartet" });
  }
  return { laenge, kisten, muenzen, monster, fragen, drachen, gewitter, ziel: laenge };
}

// ---------- Figuren: welche man hat und welche gerade spielt (merkt sich das Gerät) ----------
const FIGUR_SPEICHER = "brainimoxFiguren";
function figurenLaden() {
  try {
    const d = JSON.parse(localStorage.getItem(FIGUR_SPEICHER)) || {};
    return { besitz: Array.isArray(d.besitz) ? d.besitz : ["junge"], aktiv: d.aktiv || "junge" };
  } catch (e) { return { besitz: ["junge"], aktiv: "junge" }; }
}
const figurenStand = figurenLaden();
function figurenSpeichern() {
  try { localStorage.setItem(FIGUR_SPEICHER, JSON.stringify(figurenStand)); } catch (e) { /* egal */ }
}
function figur() {
  const id = entwicklerFigur || figurenStand.aktiv;
  return EINSTELLUNGEN.figuren.find((f) => f.id === id) || EINSTELLUNGEN.figuren[0];
}
function figurWaehlen(id) {
  entwicklerFigur = null;   // im Laden gewählt: gilt wieder die normale Figur
  figurenStand.aktiv = id;
  if (!figurenStand.besitz.includes(id)) figurenStand.besitz.push(id);
  figurenSpeichern();
  const f = figur();
  if (spiel) { if (f.schwert) spiel.schwert = true; if (f.ruestung) spiel.ruestung = true; }
  if (typeof figurNeuMalen === "function") figurNeuMalen();
}

function neuesSpiel(levelNr = 0, muenzen = 0, schwert = false, ruestung = false) {
  const L = EINSTELLUNGEN.level[levelNr];
  if (figur().schwert) schwert = true;     // Ritter hat sein Schwert immer dabei
  if (figur().ruestung) ruestung = true;   // Panzer hat seine Rüstung immer an
  spiel = {
    levelNr,
    L,
    level: levelBauen(L),
    x: 0,                 // wie weit das Männchen gelaufen ist
    y: BODEN,             // Füße des Männchens
    vy: 0,
    amBoden: true,
    muenzen,              // Münzen aus dem letzten Level nimmt man mit
    schwert,              // Schwert gekauft? (behält man fürs nächste Level)
    ruestung,             // Rüstung gekauft? Dann tut nichts mehr weh (keine Münzen weg)
    hauZeit: 0,           // > 0: der Junge schwingt gerade das Schwert
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
  if (spiel.L.fliegen) { spiel.halten = true; return; } // Rakete an
  if (spiel.amBoden) {
    spiel.vy = -EINSTELLUNGEN.sprungKraft * (figur().sprung || 1);
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
// Schwert schwingen (nur wenn man eins gekauft hat)
function hauen() {
  if (!spiel || !spiel.schwert || spiel.pause || spiel.angehalten || spiel.fertig) return;
  if (spiel.hauZeit <= 0) spiel.hauZeit = 0.35;
}
const schwertKnopf = document.getElementById("schwertknopf");
schwertKnopf.addEventListener("pointerdown", (e) => { e.preventDefault(); hauen(); });
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  springen();
});
window.addEventListener("pointerup", loslassen);
window.addEventListener("pointercancel", loslassen);
window.addEventListener("keydown", (e) => {
  if (imLaden) { if (["Escape", "KeyL", "Enter"].includes(e.code)) ladenSchliessen(); return; }
  if (e.code === "KeyL") return ladenOeffnen();
  if (["KeyP", "Escape"].includes(e.code)) return pauseUmschalten();
  if (["KeyS", "KeyX", "Enter"].includes(e.code) && spiel && !spiel.pause) { e.preventDefault(); if (!e.repeat) hauen(); return; }
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
    entwicklerSpiel = false;
    if (entwicklerFigur) { entwicklerFigur = null; if (typeof figurNeuMalen === "function") figurNeuMalen(); }
    startSchicht.classList.add("versteckt");
    neuesSpiel();
  });
});
// ---------- Pause ----------
const pauseKnopf = document.getElementById("pauseknopf");
const pauseSchicht = document.getElementById("pause");
function pauseUmschalten() {
  if (!spiel || spiel.fertig || imLaden) return;
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

// ---------- Laden: Schwert und Rüstung kaufen (🛒-Knopf oder Taste L, das Spiel wartet solange) ----------
const ladenSchicht = document.getElementById("laden");
const ladenKnopf = document.getElementById("ladenknopf");
const ladenMeldung = document.getElementById("ladenMeldung");
const WAREN = {
  schwert: { knopf: document.getElementById("schwertKaufen"), name: "⚔️ Schwert", preis: () => EINSTELLUNGEN.schwertPreis,
    gekauft: "Gekauft! Hauen: ⚔️-Knopf oder S." },
  ruestung: { knopf: document.getElementById("ruestungKaufen"), name: "🛡️ Rüstung", preis: () => EINSTELLUNGEN.ruestungPreis,
    gekauft: "Gekauft! Jetzt tut dir nichts mehr weh." },
};
let imLaden = false;
function ladenAnzeigen() {
  document.getElementById("ladenMuenzen").textContent = `Du hast ${spiel.muenzen} Münzen 🪙`;
  for (const [was, w] of Object.entries(WAREN)) {
    w.knopf.disabled = spiel[was];
    w.knopf.textContent = spiel[was] ? `${w.name}\nHast du schon ✓` : `${w.name}\n${w.preis()} 🪙`;
  }
  figurenAnzeigen();
}
function ladenOeffnen() {
  if (!spiel || spiel.fertig || spiel.pause || spiel.angehalten) return;
  imLaden = true;
  spiel.angehalten = true;
  ladenMeldung.textContent = "";
  ladenAnzeigen();
  ladenSchicht.classList.remove("versteckt");
}
function ladenSchliessen() {
  if (!imLaden) return;
  imLaden = false;
  ladenSchicht.classList.add("versteckt");
  if (spiel) spiel.angehalten = false;
}
for (const [was, w] of Object.entries(WAREN)) {
  w.knopf.addEventListener("click", () => {
    if (!spiel || spiel[was]) return;
    const preis = w.preis();
    if (spiel.muenzen < preis) {
      ladenMeldung.textContent = `Du brauchst ${preis} Münzen. Dir fehlen noch ${preis - spiel.muenzen}.`;
      return;
    }
    spiel.muenzen -= preis;
    spiel[was] = true;
    ladenAnzeigen();
    ladenMeldung.textContent = w.gekauft;
  });
}
// Figuren im Laden: kaufen (Preis siehe figurPreis) oder eine gekaufte auswählen
const figurenBox = document.getElementById("ladenFiguren");
function figurenAnzeigen() {
  figurenBox.innerHTML = "";
  for (const f of EINSTELLUNGEN.figuren) {
    const knopf = document.createElement("button");
    knopf.className = "figur";
    const hat = figurenStand.besitz.includes(f.id), aktiv = figur().id === f.id;
    if (aktiv) knopf.classList.add("aktiv");
    if (typeof figurBild === "function") {
      const img = document.createElement("img");
      img.src = figurBild(f);
      img.alt = "";
      knopf.appendChild(img);
    }
    const text = document.createElement("span");
    text.textContent = `${f.name}\n${f.kann}\n${aktiv ? "Spielst du ✓" : hat ? "Nehmen" : EINSTELLUNGEN.figurPreis + " 🪙"}`;
    knopf.appendChild(text);
    knopf.addEventListener("click", () => {
      if (aktiv) return;
      if (!hat) {
        if (spiel.muenzen < EINSTELLUNGEN.figurPreis) {
          ladenMeldung.textContent = `Du brauchst ${EINSTELLUNGEN.figurPreis} Münzen. Dir fehlen noch ${EINSTELLUNGEN.figurPreis - spiel.muenzen}.`;
          return;
        }
        spiel.muenzen -= EINSTELLUNGEN.figurPreis;
      }
      figurWaehlen(f.id);
      ladenAnzeigen();
      ladenMeldung.textContent = `Jetzt spielst du: ${f.name}! ${f.kann}.`;
    });
    figurenBox.appendChild(knopf);
  }
}
ladenKnopf.addEventListener("click", ladenOeffnen);
document.getElementById("ladenZurueck").addEventListener("click", ladenSchliessen);

document.getElementById("nochmal").addEventListener("click", () => {
  endeSchicht.classList.add("versteckt");
  if (spiel && EINSTELLUNGEN.level[spiel.levelNr + 1]) {
    neuesSpiel(spiel.levelNr + 1, spiel.muenzen, spiel.schwert, spiel.ruestung); // nächstes Level
  } else if (spiel) {
    // alle Level geschafft: Name eintippen, dann Bestenliste, dann zum Start
    const muenzen = spiel.muenzen;
    spiel = null;
    if (entwicklerSpiel) return startSchicht.classList.remove("versteckt"); // Entwicklermodus: keine Bestenliste
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
function aufgabeZeigen(drache = false, a = aufgabeMachen(), trefferWeg = 0) {
  const dieses = spiel;
  dieses.pause = true;
  document.getElementById("frage").textContent = (drache ? "🐉 " : "") + `${a.text} = ?`;
  const meldung = document.getElementById("meldung");
  meldung.textContent = drache ? `Getroffen! −${trefferWeg} Münzen 💥` : "";
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
  ladenKnopf.classList.toggle("versteckt", !spiel || spiel.fertig);
  schwertKnopf.classList.toggle("versteckt", !spiel || !spiel.schwert || spiel.fertig || imLaden);
  if (!spiel || spiel.pause || spiel.angehalten || spiel.fertig) return;
  const s = spiel;
  s.x += s.L.tempo * dt;
  if (s.L.fliegen) {
    // Raketen-Rucksack: drücken = hoch, loslassen = langsam runter
    const E = EINSTELLUNGEN;
    s.vy += (s.halten ? -E.raketenKraft * (figur().sprung || 1) + E.flugSchwerkraft : E.flugSchwerkraft) * dt;
    s.vy = Math.max(-E.flugTempoMax, Math.min(E.flugTempoMax, s.vy));
    s.y += s.vy * dt;
    if (s.y < 130) { s.y = 130; s.vy = Math.max(0, s.vy); }  // nicht oben aus dem Bild fliegen
    s.amBoden = s.y >= BODEN;
    if (s.amBoden) { s.y = BODEN; s.vy = Math.min(0, s.vy); }
  } else {
    let schwerkraft = EINSTELLUNGEN.schwerkraft;
    if (s.halten && s.vy < 0 && s.haltZeit < EINSTELLUNGEN.haltenZeit) {
      schwerkraft *= EINSTELLUNGEN.haltenSchwerkraft;
      s.haltZeit += dt;
    }
    s.vy += schwerkraft * dt;
    s.y += s.vy * dt;
    if (s.y >= BODEN) { s.y = BODEN; s.vy = 0; s.amBoden = true; }
  }
  if (s.autschZeit > 0) s.autschZeit -= dt;
  if (s.hauZeit > 0) s.hauZeit -= dt;

  // Männchen als Kasten: Breite 30, Höhe 70
  const links = s.x - 15, rechts = s.x + 15, oben = s.y - 70;

  for (const m of s.level.muenzen) {
    if (!m.weg && Math.abs(m.x - s.x) < 28 && m.y > oben - 14 && m.y < s.y + 14) {
      m.weg = true;
      const plus = figur().muenzen || 1;   // Jäger bekommt mehr
      s.muenzen += plus;
      effekt("muenze", m.x, m.y);
      s.texte.push({ text: "+" + plus, x: m.x, y: m.y, zeit: 0.7 });
    }
  }
  const autsch = (anzahl = EINSTELLUNGEN.autschMuenzen) => {
    s.autschZeit = 1;
    if (s.ruestung) { s.texte.push({ text: "+0 Pling! 🛡️", x: s.x, y: oben - 10, zeit: 1 }); return; }
    const weg = Math.min(s.muenzen, anzahl);
    s.muenzen -= weg;
    s.texte.push({ text: weg ? `Autsch! −${weg}` : "Autsch!", x: s.x, y: oben - 10, zeit: 1 });
  };
  for (const k of s.level.kisten) {
    const r = k.rand || 0;
    if (s.autschZeit <= 0 && rechts > k.x + r && links < k.x + k.b - r && s.y > BODEN - k.h + 4) {
      autsch(k.schneemann ? EINSTELLUNGEN.schneemannMuenzen : k.hotdog ? EINSTELLUNGEN.hotdogMuenzen : EINSTELLUNGEN.autschMuenzen);
    }
  }
  // Gewitterwolken in der Luft: nicht berühren!
  for (const g of s.level.gewitter) {
    if (s.autschZeit <= 0 && Math.abs(g.x - s.x) < g.b / 2 + 10 && oben < g.y + g.h / 2 - 6 && s.y > g.y - g.h / 2 + 6) {
      autsch(EINSTELLUNGEN.gewitterMuenzen);
      effekt("blitz", s.x, s.y - 40);
    }
  }
  // Monster: laufen auf dich zu. Von oben draufspringen = Monster fällt um!
  for (const m of s.level.monster) {
    if (!m.lebt) { m.umfallen += dt; continue; }
    m.x -= s.L.monsterTempo * dt;
    if (m.flug) { m.zeit += dt; m.y = m.basisY + Math.sin(m.zeit * 2.5) * 25; } // flattert auf und ab
    const fuss = m.flug ? m.y : BODEN;
    const kopf = fuss - m.h;
    // Schwert: Monster direkt vor dir wird umgehauen
    if (s.hauZeit > 0 && m.x - m.b / 2 < rechts + 55 && m.x + m.b / 2 > links && s.y > kopf - 40 && oben < fuss + 30) {
      m.lebt = false;
      effekt("monster", m.x, kopf);
      s.muenzen += EINSTELLUNGEN.monsterMuenzen;
      s.texte.push({ text: `+${EINSTELLUNGEN.monsterMuenzen} Zack!`, x: m.x, y: kopf - 20, zeit: 1 });
      continue;
    }
    if (rechts <= m.x - m.b / 2 || links >= m.x + m.b / 2 || s.y <= kopf || oben >= fuss) continue;
    if (s.vy > 0 && s.y < kopf + 24) {
      m.lebt = false;
      effekt("monster", m.x, kopf);
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
        d.kugel = { aufgabe: a, ax: d.sx - 45, ay: d.sy + 10, t: 0, zielY: s.L.fliegen ? s.y - 35 : BODEN - 35 };
        d.kugel.x = d.kugel.ax; d.kugel.y = d.kugel.ay;
      }
    } else if (d.zustand === "schiesst") {
      const k = d.kugel;
      k.t += dt / EINSTELLUNGEN.drachenFlugzeit;
      // fliegt auf Bauchhöhe zu dir und dann weiter nach links
      k.x = k.ax + (MANN_X - k.ax) * k.t;
      k.y = k.ay + (k.zielY - k.ay) * Math.min(1, k.t);
      // Mit dem Schwert: Kugel ist nah genug → zurück zum Drachen hauen!
      const reichweite = figur().drachen ? 160 : 95;  // Jäger trifft die Kugel schon von weiter weg
      if (s.hauZeit > 0 && k.x > MANN_X - 20 && k.x < MANN_X + reichweite && k.y > s.y - 120 && k.y < s.y + 20) {
        d.zustand = "zurueck";
        k.zx = k.x; k.zy = k.y; k.t = 0;
        s.texte.push({ text: "+0 Zack! ⚔️", x: s.x, y: s.y - 100, zeit: 1 });
        continue;
      }
      const getroffen = Math.abs(k.x - MANN_X) < 15 + 20 && k.y > s.y - 70 - 18 && k.y < s.y + 10;
      if (getroffen) {
        d.zustand = "fliegtWeg";
        const weg = s.ruestung ? 0 : Math.min(s.muenzen, EINSTELLUNGEN.drachenTrefferMuenzen);
        s.muenzen -= weg;
        s.texte.push({ text: weg ? `Getroffen! −${weg}` : "Getroffen!", x: s.x, y: s.y - 100, zeit: 1.5 });
        aufgabeZeigen(true, k.aufgabe, weg);
        return;
      }
      if (k.x < MANN_X - 60) {
        d.zustand = "fliegtWeg";
        s.texte.push({ text: "+0 Ausgewichen!", x: s.x, y: s.y - 100, zeit: 1 });
      }
    } else if (d.zustand === "zurueck") {
      // Kugel fliegt zurück zum Drachen
      const k = d.kugel;
      k.t += dt / 0.45;
      k.x = k.zx + (d.sx - k.zx) * Math.min(1, k.t);
      k.y = k.zy + (d.sy - k.zy) * Math.min(1, k.t);
      if (k.t >= 1) {
        d.zustand = "besiegt"; d.fall = 0;
        effekt("drache", s.x - MANN_X + d.sx, d.sy);
        const plus = EINSTELLUNGEN.drachenBesiegtMuenzen * (figur().drachen || 1);
        s.muenzen += plus;
        s.texte.push({ text: `+${plus} Drache besiegt!`, x: s.x - MANN_X + d.sx, y: d.sy - 30, zeit: 1.5 });
      }
    } else if (d.zustand === "besiegt") {
      // Drache trudelt nach unten und verschwindet
      d.fall += dt;
      d.sy += 260 * dt;
      d.sx -= 60 * dt;
      if (d.sy > BODEN + 80) d.zustand = "weg";
    } else if (d.zustand === "fliegtWeg") {
      d.sx += 260 * dt; d.sy -= 140 * dt;
      if (d.sx > W + 120) d.zustand = "weg";
    }
  }
  // ?-Blöcke hängen in der Luft: Man muss hochspringen und sie mit dem Kopf berühren
  for (const f of s.level.fragen) {
    if (f.fertig) continue;
    const blockUnten = (f.y || BODEN - EINSTELLUNGEN.fragezeichenHoehe) + 28;
    const blockOben = blockUnten - 56;
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
    if (EINSTELLUNGEN.level[s.levelNr + 1]) {
      // Kein "Weiter"-Knopf: einfach in die nächste Welt weiterlaufen
      neuesSpiel(s.levelNr + 1, s.muenzen, s.schwert, s.ruestung);
      Object.assign(spiel, { y: s.y, vy: s.vy, amBoden: s.amBoden, halten: s.halten, haltZeit: s.haltZeit });
      effekt("level", 0, 0);
      return;
    }
    s.fertig = true;
    document.getElementById("endeTitel").textContent = "Alle Level geschafft! 🏆";
    document.getElementById("ergebnis").textContent = `Du hast ${s.muenzen} Münzen gesammelt! 🪙`;
    document.getElementById("nochmal").textContent = entwicklerSpiel ? "Zum Start" : "Name eintragen ✏️";
    if (entwicklerSpiel) document.getElementById("ergebnis").textContent += " (Entwicklermodus: kein Eintrag in die Bestenliste)";
    setTimeout(() => endeSchicht.classList.remove("versteckt"), 600);
  }
}

// Das Malen (Grafik) steht in grafik.js. Dort läuft auch die Spiel-Schleife.
