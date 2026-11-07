// =====================================================================
//  BRAINIMOX – Grafik mit der Spiel-Engine Phaser
//  Hier wird alles gemalt. Die Spielregeln stehen in game.js.
//
//  Trick für flüssiges Spielen: Alle Figuren (Junge, Monster, Drachen,
//  Münzen ...) werden beim Start EINMAL als Bilder gemalt. Danach schiebt
//  die Grafikkarte (WebGL) nur noch fertige Bilder herum. Das ist schnell,
//  auch wenn noch viele neue Sachen dazukommen.
// =====================================================================

let ctx = null;            // Malstift, nur beim Bilder-Malen am Anfang
let TS = 3;                // so viel feiner werden die Bilder gemalt (für scharfe Bilder)
const ANKER = {};          // wo bei jedem Bild der "Griff" ist (z. B. die Füße)
const LAUF_BILDER = 24;    // so viele Bilder hat das Laufen vom Jungen
const MONSTER_BILDER = 16; // so viele Bilder hat das Laufen der Monster
const DRACHE_BILDER = 16;  // so viele Bilder hat der Flügelschlag
const SCHRIFT = '"Fredoka", "Trebuchet MS", system-ui, sans-serif';
let spielEngine = null;
let pixelDichte = 1;

// ---------- Hilfen ----------
function farbeZahl(farbe) {
  // "#ff8800" oder "rgba(...)" → Zahl für Phaser
  return Phaser.Display.Color.ValueToColor(farbe).color;
}
function farbeAlpha(farbe) {
  const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(farbe);
  return m ? Number(m[1]) : 1;
}
// Farbe heller (menge > 0) oder dunkler (menge < 0) machen
function mischen(farbe, menge) {
  const c = Phaser.Display.Color.ValueToColor(farbe);
  const ziel = menge > 0 ? 255 : 0, m = Math.abs(menge);
  const t = (v) => Math.round(v + (ziel - v) * m);
  return `rgb(${t(c.red)},${t(c.green)},${t(c.blue)})`;
}
function verlauf(y1, y2, farben) {
  const g = ctx.createLinearGradient(0, y1, 0, y2);
  farben.forEach((f, i) => g.addColorStop(i / (farben.length - 1), f));
  return g;
}

// Ein Bild malen und in Phaser speichern.
// w, h = Größe; ax, ay = Griff-Punkt (dort ist 0,0 beim Malen)
function textur(szene, key, w, h, ax, ay, mal, ts = TS) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * ts);
  c.height = Math.ceil(h * ts);
  ctx = c.getContext("2d");
  ctx.scale(ts, ts);
  ctx.translate(ax, ay);
  mal();
  if (szene.textures.exists(key)) szene.textures.remove(key);
  szene.textures.addCanvas(key, c);
  ANKER[key] = { x: ax / w, y: ay / h, ts };
}
function bild(szene, key, x = 0, y = 0) {
  const a = ANKER[key];
  return szene.add.image(x, y, key).setOrigin(a.x, a.y).setScale(1 / a.ts);
}

// =====================================================================
//  Die Figuren malen (passiert nur einmal beim Start)
// =====================================================================
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

// Der Junge: orange Haare, blaues T-Shirt, grüne Hose. Füße sind bei 0,0.
function zeichneJunge(lauf, inLuft) {
  const F = EINSTELLUNGEN.farben;
  const x = 0, y = 0;
  const s = inLuft ? 0.9 : Math.sin(lauf);        // Schwung von Armen und Beinen
  const huefte = y - 28, schulter = y - 50;

  const bein = (w, hinten) => {
    const hose = hinten ? mischen(F.hose, -0.2) : F.hose;
    const knieX = x + Math.sin(w) * 11, knieY = huefte + 12;
    const fussX = knieX + Math.sin(w - 0.6) * 9, fussY = Math.min(y - 3, knieY + 13);
    glied(x, huefte, knieX, knieY, fussX, fussY, hose, hose, 8);
    ctx.fillStyle = hinten ? mischen(F.schuhe, -0.2) : F.schuhe;
    ctx.beginPath(); ctx.ellipse(fussX + 3, fussY + 1, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  };
  const arm = (w, hinten) => {
    const tshirt = hinten ? mischen(F.tshirt, -0.2) : F.tshirt;
    const haut = hinten ? mischen(F.haut, -0.2) : F.haut;
    const ellX = x + Math.sin(w) * 9, ellY = schulter + 11;
    const handX = ellX + 5 + Math.sin(w) * 3, handY = ellY + 9;
    glied(x, schulter + 2, ellX, ellY, handX, handY, tshirt, haut, 6);
    ctx.fillStyle = haut;
    ctx.beginPath(); ctx.arc(handX, handY, 3.5, 0, Math.PI * 2); ctx.fill();
  };

  // hinterer Arm und hinteres Bein (etwas dunkler, weil sie hinten sind)
  arm(-s * 0.9, true);
  bein(-s * 0.8, true);

  // T-Shirt (Körper) mit leichtem Licht von oben
  ctx.fillStyle = verlauf(schulter - 3, huefte + 3, [mischen(F.tshirt, 0.18), F.tshirt]);
  ctx.beginPath();
  ctx.roundRect(x - 9, schulter - 3, 18, huefte - schulter + 6, 6);
  ctx.fill();

  bein(s * 0.8, false);

  // Kopf
  const kopfY = y - 61;
  ctx.fillStyle = F.haut;
  ctx.beginPath(); ctx.arc(x + 1, kopfY, 10, 0, Math.PI * 2); ctx.fill();
  // rote Bäckchen
  ctx.fillStyle = "rgba(255,120,120,0.35)";
  ctx.beginPath(); ctx.arc(x + 6, kopfY + 4, 2.6, 0, Math.PI * 2); ctx.fill();
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
  // Glanz in den Haaren
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, kopfY - 1, 7.5, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  // Auge und Mund
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(x + 5, kopfY + 1, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x + 5, kopfY + 4, 3, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();

  arm(s * 0.9, false);
}

// Monster: lila, mit Hörnchen und Zähnen. Füße bei 0,0 (auf dem Boden).
function zeichneMonster(wackeln, lebt) {
  const F = EINSTELLUNGEN.farben;
  const b = 40, h = 38;
  // Füße (wackeln beim Laufen)
  ctx.fillStyle = mischen(F.monster, -0.45);
  ctx.beginPath(); ctx.ellipse(-9 + wackeln, -3, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9 - wackeln, -3, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Körper mit Licht von oben
  ctx.fillStyle = verlauf(-h, 0, [mischen(F.monster, 0.25), F.monster, mischen(F.monster, -0.15)]);
  ctx.beginPath();
  ctx.moveTo(-b / 2, -4);
  ctx.lineTo(-b / 2, -h + b / 2);
  ctx.arc(0, -h + b / 2, b / 2, Math.PI, 0);
  ctx.lineTo(b / 2, -4);
  ctx.closePath();
  ctx.fill();
  // Hörnchen
  ctx.fillStyle = mischen(F.monster, 0.1);
  ctx.beginPath();
  ctx.moveTo(-12, -h + 4); ctx.lineTo(-15, -h - 8); ctx.lineTo(-5, -h + 1);
  ctx.moveTo(12, -h + 4); ctx.lineTo(15, -h - 8); ctx.lineTo(5, -h + 1);
  ctx.fill();
  // Glanzpunkt
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.ellipse(-10, -h + 8, 5, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  // Augen (schauen nach links, zum Spieler)
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-8, -h + 17, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -h + 17, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  if (lebt) {
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
  ctx.beginPath(); ctx.roundRect(-11, -h + 27, 20, 6, 2); ctx.fill();
  ctx.fillStyle = "#fff";
  for (const zx of [-9, -3, 3]) {
    ctx.beginPath(); ctx.moveTo(zx, -h + 27); ctx.lineTo(zx + 4, -h + 27); ctx.lineTo(zx + 2, -h + 31); ctx.fill();
  }
}

// Drache: fliegt, schlägt mit den Flügeln, schaut nach links zu dir
function zeichneDrache(schlag) {
  const F = EINSTELLUNGEN.farben;
  const rot = F.drache, dunkel = mischen(F.drache, -0.45);
  ctx.strokeStyle = dunkel;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  // Flügel hinten
  ctx.fillStyle = mischen(rot, -0.15);
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(25, -30 - schlag * 22); ctx.lineTo(40, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Schwanz
  ctx.fillStyle = rot;
  ctx.beginPath(); ctx.moveTo(25, 4); ctx.quadraticCurveTo(55, 0, 62, -14); ctx.lineTo(56, 2); ctx.quadraticCurveTo(50, 14, 22, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath(); ctx.moveTo(62, -14); ctx.lineTo(70, -16); ctx.lineTo(64, -6); ctx.fill();
  // Körper
  ctx.fillStyle = verlauf(-13, 17, [mischen(rot, 0.2), rot, mischen(rot, -0.2)]);
  ctx.beginPath(); ctx.ellipse(8, 2, 28, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Bauch
  ctx.fillStyle = "#ffcf70";
  ctx.beginPath(); ctx.ellipse(6, 8, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Hals und Kopf
  ctx.fillStyle = rot;
  ctx.beginPath(); ctx.ellipse(-24, -12, 16, 12, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(-52, -8); ctx.lineTo(-50, 0); ctx.lineTo(-30, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Nasenloch
  ctx.fillStyle = dunkel;
  ctx.beginPath(); ctx.arc(-47, -6, 1.3, 0, Math.PI * 2); ctx.fill();
  // Hörner
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath(); ctx.moveTo(-20, -22); ctx.lineTo(-14, -36); ctx.lineTo(-12, -20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-28, -22); ctx.lineTo(-26, -34); ctx.lineTo(-20, -22); ctx.fill();
  // Auge
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-28, -15, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(-29.5, -15, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-30.2, -16, 0.8, 0, Math.PI * 2); ctx.fill();
  // Flügel vorne
  ctx.fillStyle = mischen(rot, -0.08);
  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(14, -38 - schlag * 26); ctx.lineTo(30, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
}

// Feuerkugel (die Aufgabe steht als Text darüber)
function zeichneKugel() {
  // Feuerschweif
  for (let i = 3; i >= 1; i--) {
    ctx.fillStyle = `rgba(255,${120 + i * 25},0,${0.55 - i * 0.12})`;
    ctx.beginPath(); ctx.arc(i * 14, -i * 2, 16 - i * 3, 0, Math.PI * 2); ctx.fill();
  }
  // Leuchten
  const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 28);
  glow.addColorStop(0, "rgba(255,170,0,0.6)");
  glow.addColorStop(1, "rgba(255,120,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();
  // Kugel
  const g = ctx.createRadialGradient(-6, -6, 2, 0, 0, 18);
  g.addColorStop(0, "#fff2a8");
  g.addColorStop(0.45, "#ffa21a");
  g.addColorStop(1, "#e04a00");
  ctx.fillStyle = g;
  ctx.strokeStyle = "#c23b00";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

// Schwert (Griff bei 0,0, Klinge zeigt nach oben)
function zeichneSchwert() {
  ctx.fillStyle = verlauf(-47, -6, ["#ffffff", "#cfd9e3"]);
  ctx.strokeStyle = "#7d8b99";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(-3, -40); ctx.lineTo(0, -47); ctx.lineTo(3, -40); ctx.lineTo(3, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath(); ctx.roundRect(-9, -7, 18, 4, 1.5); ctx.fill();
  ctx.fillStyle = "#7a4e1a";
  ctx.beginPath(); ctx.roundRect(-2.5, -3, 5, 10, 1.5); ctx.fill();
}

// Rüstung: silberner Brustpanzer und Helm, passt genau über den Jungen (Füße bei 0,0)
function zeichneRuestung() {
  const silber = (y1, y2) => verlauf(y1, y2, ["#ffffff", "#c9d3dd", "#8e9aa6"]);
  ctx.strokeStyle = "#5f6b77";
  ctx.lineWidth = 1.2;
  // Brustpanzer
  ctx.fillStyle = silber(-53, -23);
  ctx.beginPath(); ctx.roundRect(-10.5, -53, 21, 29, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, -27); ctx.stroke();
  // Gürtel
  ctx.fillStyle = "#7a4e1a";
  ctx.fillRect(-10.5, -29, 21, 4);
  ctx.fillStyle = "#ffd23f";
  ctx.fillRect(-2.5, -29.5, 5, 5);
  // Schulterstück
  ctx.fillStyle = silber(-53, -45);
  ctx.beginPath(); ctx.ellipse(1, -49, 6.5, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Nieten
  ctx.fillStyle = "#5f6b77";
  for (const [nx, ny] of [[-6, -48], [6, -48], [-6, -35], [6, -35]]) { ctx.beginPath(); ctx.arc(nx, ny, 1, 0, Math.PI * 2); ctx.fill(); }
  // Helm (Gesicht bleibt frei)
  ctx.fillStyle = silber(-79, -64);
  ctx.beginPath(); ctx.arc(1, -66, 11.5, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-11.5, -67, 25, 3.5, 1.75); ctx.fill(); ctx.stroke();
  // roter Busch oben
  ctx.fillStyle = "#e63946";
  ctx.beginPath(); ctx.ellipse(-1, -79, 7, 3.5, -0.2, 0, Math.PI * 2); ctx.fill();
}

// Schneemann (Mitte unten bei 0,0)
function zeichneSchneemann() {
  const kugel = (y, r) => {
    const g = ctx.createRadialGradient(-r * 0.35, y - r * 0.35, r * 0.2, 0, y, r);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#dbe7f3");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  ctx.strokeStyle = "#9fb4c8";
  ctx.lineWidth = 2;
  kugel(-16, 17);          // Bauch
  kugel(-42, 12);          // Kopf
  ctx.fillStyle = "#333";
  for (const y of [-22, -12]) { ctx.beginPath(); ctx.arc(0, y, 2.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(-4, -45, 1.8, 0, Math.PI * 2); ctx.arc(4, -45, 1.8, 0, Math.PI * 2); ctx.fill();
  // Karottennase (zeigt nach links, zum Jungen)
  ctx.fillStyle = "#ff8c1a";
  ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(-12, -40); ctx.lineTo(0, -38); ctx.fill();
  // Hut
  ctx.fillStyle = "#333";
  ctx.beginPath(); ctx.roundRect(-11, -54, 22, 3, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-7, -66, 14, 12, 1.5); ctx.fill();
  ctx.fillStyle = "#d33";
  ctx.fillRect(-7, -57, 14, 3);
  // Schal
  ctx.fillStyle = "#d33";
  ctx.beginPath(); ctx.roundRect(-10, -32, 20, 4, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(4, -32, 4, 11, 2); ctx.fill();
}

// Kiste aus Holz (links unten bei 0,0)
function zeichneKiste() {
  const F = EINSTELLUNGEN.farben;
  const b = 44, h = 44, dunkel = mischen(F.kiste, -0.4);
  ctx.fillStyle = verlauf(-h, 0, [mischen(F.kiste, 0.15), F.kiste, mischen(F.kiste, -0.1)]);
  ctx.beginPath(); ctx.roundRect(0, -h, b, h, 4); ctx.fill();
  // Bretter
  ctx.strokeStyle = mischen(F.kiste, -0.2);
  ctx.lineWidth = 1;
  for (const y of [-33, -22, -11]) { ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(b - 3, y); ctx.stroke(); }
  // Rahmen und Kreuz
  ctx.strokeStyle = dunkel;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(1.5, -h + 1.5, b - 3, h - 3, 3.5); ctx.stroke();
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(3, -h + 3); ctx.lineTo(b - 3, -3);
  ctx.moveTo(b - 3, -h + 3); ctx.lineTo(3, -3);
  ctx.stroke();
}

function zeichneMuenze() {
  const F = EINSTELLUNGEN.farben;
  const g = ctx.createRadialGradient(-4, -4, 1, 0, 0, 12);
  g.addColorStop(0, "#fff6c2");
  g.addColorStop(0.5, F.muenze);
  g.addColorStop(1, "#e0a800");
  ctx.fillStyle = g;
  ctx.strokeStyle = "#c79a00";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(199,154,0,0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath(); ctx.ellipse(-4, -5, 2.5, 1.5, -0.6, 0, Math.PI * 2); ctx.fill();
}

function zeichneFrageBlock(benutzt) {
  const g = benutzt ? ["#cfcfcf", "#a9a9a9"] : ["#ffc04d", "#ff9f1c", "#f08400"];
  ctx.fillStyle = verlauf(-28, 28, g);
  ctx.beginPath(); ctx.roundRect(-28, -28, 56, 56, 9); ctx.fill();
  ctx.strokeStyle = benutzt ? "#8f8f8f" : "#c46d00";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(-26.5, -26.5, 53, 53, 8); ctx.stroke();
  // Nieten in den Ecken
  ctx.fillStyle = benutzt ? "#8f8f8f" : "#c46d00";
  for (const [nx, ny] of [[-20, -20], [20, -20], [-20, 20], [20, 20]]) {
    ctx.beginPath(); ctx.arc(nx, ny, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  if (benutzt) return;
  ctx.font = `700 40px ${SCHRIFT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#c46d00";
  ctx.fillText("?", 0, 5);
  ctx.fillStyle = "#fff";
  ctx.fillText("?", 0, 2);
}

function zeichneFahne() {
  ctx.fillStyle = verlauf(-160, 0, ["#888", "#555"]);
  ctx.beginPath(); ctx.roundRect(-3, -160, 6, 160, 3); ctx.fill();
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath(); ctx.arc(0, -162, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(3, -156);
  ctx.quadraticCurveTo(32, -150, 60, -140);
  ctx.quadraticCurveTo(32, -128, 3, -122);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `700 16px ${SCHRIFT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", 24, -139);
}

function zeichneWolke(n) {
  const teile = [
    [[0, 0, 26], [30, -10, 32], [62, 0, 24]],
    [[0, 0, 22], [24, -12, 28], [52, -6, 26], [76, 2, 18]],
    [[0, 0, 24], [28, -14, 30], [58, -2, 24]],
  ][n];
  // leichter Schatten unten
  ctx.fillStyle = "rgba(160,190,220,0.45)";
  ctx.beginPath();
  for (const [x, y, r] of teile) { ctx.moveTo(x + r, y + 4); ctx.arc(x, y + 4, r, 0, Math.PI * 2); }
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  for (const [x, y, r] of teile) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
  ctx.fill();
}

// Hügel/Berge: ein Streifen, der sich nahtlos wiederholt (Breite B)
function zeichneHuegel(B, hoehe, farbe, spitz, schneeKappen, saat) {
  const punkte = [];
  for (let x = 0; x <= B; x += 4) {
    const t = (x / B) * Math.PI * 2;
    let v = Math.sin(t * 2 + saat) * 0.5 + Math.sin(t * 3 + saat * 2) * 0.3 + Math.sin(t * 5 + saat * 3) * 0.2;
    if (spitz) v = 1 - Math.abs(Math.sin(t * 3 + saat)) * 1.4 + Math.sin(t * 7 + saat) * 0.15;
    punkte.push([x, -hoehe * (0.55 + v * 0.35)]);
  }
  ctx.fillStyle = verlauf(-hoehe, 0, [mischen(farbe, 0.15), farbe]);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  for (const [x, y] of punkte) ctx.lineTo(x, y);
  ctx.lineTo(B, 10);
  ctx.closePath();
  ctx.fill();
  if (schneeKappen) {
    // weiße Schneekappen oben auf den Bergen
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(0, -hoehe * 1.2, B, hoehe * 0.55);
    ctx.restore();
  }
}

// Gras-Kante oben am Boden
function zeichneGras(B, L) {
  const boden = L.boden;
  ctx.fillStyle = mischen(boden, -0.18);
  ctx.fillRect(0, 10, B, 8);
  ctx.fillStyle = boden;
  ctx.fillRect(0, 0, B, 14);
  // runde Büschel nach oben
  ctx.beginPath();
  for (let x = 10; x < B; x += 20) { ctx.moveTo(x + 7, 2); ctx.arc(x, 2, 7, Math.PI, 0); }
  ctx.fill();
  // Licht oben
  ctx.strokeStyle = mischen(boden, 0.3);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 10; x < B; x += 20) { ctx.moveTo(x - 4, -1.5); ctx.arc(x, 2, 5, Math.PI * 1.15, Math.PI * 1.6); }
  ctx.stroke();
  // Schatten unter der Grasdecke
  ctx.fillStyle = verlauf(16, 26, ["rgba(0,0,0,0.18)", "rgba(0,0,0,0)"]);
  ctx.fillRect(0, 16, B, 10);
}

// Steinchen in der Erde
function zeichneErde(B, L) {
  const zufallFest = (n) => { const v = Math.sin(n * 91.7) * 4375.85; return v - Math.floor(v); };
  for (let i = 0; i < 26; i++) {
    const x = 8 + zufallFest(i) * (B - 16), y = 8 + zufallFest(i + 50) * 56, r = 2 + zufallFest(i + 99) * 3.5;
    ctx.fillStyle = zufallFest(i + 7) < 0.6 ? mischen(L.erde, -0.15) : mischen(L.erde, 0.15);
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// Blumen für die Wiese (10 Stück, alle 97 Punkte eine)
function zeichneBlumen() {
  const farbenBlumen = ["#ff5d8f", "#ffd23f", "#ffffff", "#b48cff"];
  for (let i = 0; i < 10; i++) {
    const bx = i * 97 + 48;
    ctx.fillStyle = "#2f8a2f";
    ctx.fillRect(bx - 1, -8, 2, 8);
    ctx.beginPath(); ctx.ellipse(bx + 4, -4, 3, 1.5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = farbenBlumen[i % farbenBlumen.length];
    for (let k = 0; k < 5; k++) {
      const w = (k / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(bx + Math.cos(w) * 3, -10 + Math.sin(w) * 3, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#ffb000";
    ctx.beginPath(); ctx.arc(bx, -10, 1.8, 0, Math.PI * 2); ctx.fill();
  }
}

function alleBilderMalen(szene) {
  // Der Junge: Laufbilder und ein Sprungbild
  for (let i = 0; i < LAUF_BILDER; i++) {
    textur(szene, "junge" + i, 70, 92, 35, 84, () => zeichneJunge((i / LAUF_BILDER) * Math.PI * 2, false));
  }
  textur(szene, "jungeLuft", 70, 92, 35, 84, () => zeichneJunge(0, true));
  textur(szene, "schwert", 22, 58, 11, 50, zeichneSchwert);
  textur(szene, "ruestung", 70, 92, 35, 84, zeichneRuestung);
  // Monster
  for (let i = 0; i < MONSTER_BILDER; i++) {
    textur(szene, "monster" + i, 60, 62, 30, 54, () => zeichneMonster(Math.sin((i / MONSTER_BILDER) * Math.PI * 2) * 4, true));
  }
  textur(szene, "monsterUm", 60, 62, 30, 54, () => zeichneMonster(0, false));
  // Drachen
  for (let i = 0; i < DRACHE_BILDER; i++) {
    textur(szene, "drache" + i, 130, 96, 56, 70, () => zeichneDrache(Math.sin((i / DRACHE_BILDER) * Math.PI * 2)));
  }
  textur(szene, "kugel", 104, 60, 30, 30, zeichneKugel);
  textur(szene, "kiste", 50, 50, 3, 47, zeichneKiste);
  textur(szene, "schneemann", 48, 74, 24, 70, zeichneSchneemann);
  textur(szene, "muenze", 28, 28, 14, 14, zeichneMuenze);
  textur(szene, "frage", 62, 62, 31, 31, () => zeichneFrageBlock(false));
  textur(szene, "frageLeer", 62, 62, 31, 31, () => zeichneFrageBlock(true));
  textur(szene, "fahne", 70, 172, 6, 168, zeichneFahne);
  for (let n = 0; n < 3; n++) textur(szene, "wolke" + n, 130, 80, 30, 46, () => zeichneWolke(n), 2);
  textur(szene, "schatten", 48, 12, 24, 6, () => {
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
    g.addColorStop(0, "rgba(0,0,0,0.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.scale(1, 0.25); ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
  });
  textur(szene, "flocke", 10, 10, 5, 5, () => {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 4.5);
    g.addColorStop(0, "#fff"); g.addColorStop(0.6, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
  });
  textur(szene, "funke", 16, 16, 8, 8, () => {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 2.5 : 7, w = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(Math.cos(w) * r, Math.sin(w) * r);
    }
    ctx.fill();
  });
  textur(szene, "staub", 16, 16, 8, 8, () => {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 7);
    g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  });
  textur(szene, "muenzeHud", 32, 32, 16, 16, () => { ctx.scale(1.25, 1.25); zeichneMuenze(); });

  // Für jedes Level: Himmel, Berge, Hügel, Gras, Erde (in den Farben vom Level)
  EINSTELLUNGEN.level.forEach((L, n) => {
    textur(szene, "himmel" + n, 4, 256, 0, 0, () => {
      ctx.fillStyle = verlauf(0, 256, [mischen(L.himmel, -0.18), L.himmel, mischen(L.himmel, 0.45)]);
      ctx.fillRect(0, 0, 4, 256);
    }, 1);
    const berge = L.berge || mischen(L.himmel, -0.2), huegel = L.huegel || mischen(L.boden, 0.1);
    textur(szene, "berge" + n, 800, 190, 0, 180, () => zeichneHuegel(800, 170, berge, !!L.schnee, !!L.schnee, 1.3 + n), 1.5);
    textur(szene, "huegel" + n, 640, 110, 0, 100, () => zeichneHuegel(640, 85, huegel, false, false, 0.4 + n * 2), 1.5);
    textur(szene, "gras" + n, 240, 36, 0, 10, () => zeichneGras(240, L), 2);
    textur(szene, "erde" + n, 300, 72, 0, 0, () => zeichneErde(300, L), 2);
  });
  textur(szene, "blumen", 970, 24, 0, 16, zeichneBlumen, 2);
}

// =====================================================================
//  Die Szene: hier steht, was wo auf dem Bildschirm ist
// =====================================================================
const G = {};             // alle Grafik-Teile, die wir jedes Bild bewegen
let gebautesLevel = null; // für welches Level die Sachen schon da sind
let gebauterLevelNr = -1;

// Ein Streifen, der sich wiederholt (Berge, Hügel, Gras ...). faktor = wie schnell er mitläuft.
function streifen(szene, key, breite, y, tiefe, faktor) {
  return { szene, key, breite, y, tiefe, faktor, bilder: [] };
}
function streifenMalen(st, kamera, key) {
  const anzahl = Math.ceil(W / st.breite) + 2;
  while (st.bilder.length < anzahl) {
    st.bilder.push(bild(st.szene, key).setScrollFactor(0, 1).setDepth(st.tiefe));
  }
  const versatz = ((kamera * st.faktor) % st.breite + st.breite) % st.breite;
  st.bilder.forEach((b, i) => {
    if (b.texture.key !== key) { b.setTexture(key); const a = ANKER[key]; b.setOrigin(a.x, a.y).setScale(1 / a.ts); }
    b.setVisible(i < anzahl);
    b.setPosition(i * st.breite - versatz, st.y);
  });
}

function textStil(groesse, farbe = "#fff", rand = 5) {
  return {
    fontFamily: SCHRIFT, fontSize: groesse + "px", fontStyle: "700",
    color: farbe, stroke: "#1d3557", strokeThickness: rand,
    resolution: Math.min(4, Math.max(2, Math.ceil(skala))),
  };
}

function szeneBauen(szene) {
  alleBilderMalen(szene);
  const kam = szene.cameras.main;
  kam.setOrigin(0, 0);
  kam.setRoundPixels(false);

  // Hintergrund (bleibt am Bildschirm stehen)
  G.himmel = bild(szene, "himmel0").setScrollFactor(0, 0).setDepth(0);
  G.berge = streifen(szene, "berge0", 800, BODEN + 2, 1, 0.12);
  G.wolken = [];
  for (let i = 0; i < 12; i++) G.wolken.push(bild(szene, "wolke" + (i % 3)).setScrollFactor(0, 1).setDepth(2));
  G.huegel = streifen(szene, "huegel0", 640, BODEN + 2, 3, 0.4);
  // Boden
  G.erdeFlaeche = szene.add.rectangle(0, BODEN + 14, 10, 10, 0x000000).setOrigin(0, 0).setScrollFactor(0, 1).setDepth(4);
  G.erde = streifen(szene, "erde0", 300, BODEN + 22, 5, 1);
  G.gras = streifen(szene, "gras0", 240, BODEN, 6, 1);
  G.blumen = streifen(szene, "blumen", 970, BODEN, 7, 1);
  G.flocken = [];
  for (let i = 0; i < 70; i++) G.flocken.push(bild(szene, "flocke").setScrollFactor(0, 1).setDepth(8).setVisible(false));

  // Spieler
  G.schatten = bild(szene, "schatten").setDepth(29);
  G.junge = bild(szene, "junge0").setDepth(30);
  G.szene = szene;
  G.rueckenSchwerter = [bild(szene, "schwert").setDepth(29.5), bild(szene, "schwert").setDepth(29.5)];
  G.ruestung = bild(szene, "ruestung").setDepth(30.5);
  G.schwert = bild(szene, "schwert").setDepth(31);
  G.schwung = szene.add.graphics().setDepth(32);

  // Funken und Staub
  const funkenStil = (farben, menge) => ({
    lifespan: { min: 350, max: 650 }, speed: { min: 60, max: 170 }, gravityY: 260,
    scale: { start: (1 / TS) * menge, end: 0 }, alpha: { start: 1, end: 0.2 },
    rotate: { min: 0, max: 360 }, tint: farben, emitting: false,
  });
  G.funken = szene.add.particles(0, 0, "funke", funkenStil([0xffd23f, 0xffffff, 0xffb000], 0.9)).setDepth(45);
  G.sterne = szene.add.particles(0, 0, "funke", funkenStil([0xffffff, 0xffd23f, 0xb48cff], 1.3)).setDepth(45);
  G.feuer = szene.add.particles(0, 0, "funke", funkenStil([0xff7b00, 0xffd23f, 0xd62828], 1.6)).setDepth(45);
  G.staub = szene.add.particles(0, 0, "staub", {
    lifespan: 400, speedX: { min: -70, max: 70 }, speedY: { min: -40, max: -5 },
    scale: { start: 1 / TS, end: 2 / TS }, alpha: { start: 0.7, end: 0 }, emitting: false,
  }).setDepth(28);

  // Drachen und Feuerkugeln (höchstens so viele wie in einem Level vorkommen)
  G.drachen = [];
  G.kugeln = [];

  // Fliegende Texte wie "+1"
  G.texte = [];

  // Anzeige oben (bleibt am Bildschirm stehen)
  G.hudBox = szene.add.graphics().setScrollFactor(0, 0).setDepth(100);
  G.hudMuenze = bild(szene, "muenzeHud", 34, 34).setScrollFactor(0, 0).setDepth(101);
  G.hudZahl = szene.add.text(56, 34, "0", textStil(28)).setOrigin(0, 0.5).setScrollFactor(0, 0).setDepth(101);
  G.balken = szene.add.graphics().setScrollFactor(0, 0).setDepth(100);
  G.levelText = szene.add.text(0, 62, "", textStil(18, "#fff", 4)).setOrigin(0.5).setScrollFactor(0, 0).setDepth(101);
  G.grossText = szene.add.text(0, 0, "", textStil(48, "#fff", 8)).setOrigin(0.5).setScrollFactor(0, 0).setDepth(101);
  G.hud = [G.hudBox, G.hudMuenze, G.hudZahl, G.balken, G.levelText, G.grossText];
  G.letzteZahl = null;
  G.letzterLevelText = null;
}

// Alles, was im Level steht, als Bilder hinstellen (passiert einmal pro Level)
function levelAufbauen(szene, LV, L) {
  if (G.welt) G.welt.forEach((o) => o.destroy());
  G.welt = [];
  const neu = (o) => { G.welt.push(o); return o; };
  for (const k of LV.kisten) {
    k._bild = neu(L.schneemaenner
      ? bild(szene, "schneemann", k.x + k.b / 2, BODEN).setDepth(20)
      : bild(szene, "kiste", k.x, BODEN).setDepth(20));
    k._schatten = neu(bild(szene, "schatten", k.x + k.b / 2, BODEN + 1).setDepth(19).setScale(1.1 / TS, 1 / TS));
  }
  for (const m of LV.monster) {
    m._bild = neu(bild(szene, "monster0", m.x, BODEN).setDepth(21));
    m._schatten = neu(bild(szene, "schatten", m.x, BODEN + 1).setDepth(19));
  }
  for (const m of LV.muenzen) m._bild = neu(bild(szene, "muenze", m.x, m.y).setDepth(22));
  const fy = BODEN - EINSTELLUNGEN.fragezeichenHoehe;
  for (const f of LV.fragen) f._bild = neu(bild(szene, "frage", f.x, fy).setDepth(23));
  G.fahne = neu(bild(szene, "fahne", LV.ziel, BODEN).setDepth(18));
  G.drachen.forEach((d) => d.destroy());
  G.kugeln.forEach((k) => { k.bild.destroy(); k.text.destroy(); });
  G.drachen = LV.drachen.map(() => bild(szene, "drache0").setDepth(40).setVisible(false));
  G.kugeln = LV.drachen.map(() => ({
    bild: bild(szene, "kugel").setDepth(41).setVisible(false),
    text: szene.add.text(0, 0, "", textStil(19, "#fff", 5)).setOrigin(0.5).setDepth(42).setVisible(false),
  }));
  G.texte.forEach((t) => t.destroy());
  G.texte = [];
}

function hintergrundFarben(n, L) {
  G.himmel.setTexture("himmel" + n);
  G.erdeFlaeche.setFillStyle(farbeZahl(L.erde));
  const a = farbeAlpha(L.wolken);
  G.wolken.forEach((w) => w.setAlpha(a));
}

// ---------- Effekte (werden von game.js aufgerufen) ----------
function effekt(art, x, y) {
  if (!G.funken) return;
  if (art === "muenze") G.funken.explode(6, x, y);
  else if (art === "monster") G.sterne.explode(12, x, y);
  else if (art === "drache") G.feuer.explode(22, x, y);
  else if (art === "level" && G.szene) G.szene.cameras.main.flash(500, 255, 255, 255); // neue Welt: kurz hell aufblitzen
}

// ---------- Jedes Bild: alles an die richtige Stelle schieben ----------
let warAmBoden = true;
function malen(szene) {
  const L = spiel ? spiel.L : EINSTELLUNGEN.level[0];
  const n = Math.max(0, EINSTELLUNGEN.level.indexOf(L));
  if (n !== gebauterLevelNr) { gebauterLevelNr = n; hintergrundFarben(n, L); }
  const kamera = spiel ? spiel.x - MANN_X : (performance.now() / 1000) * 60;
  const kam = szene.cameras.main;
  kam.setScroll(kamera, -obenRand);
  const sx = (welt) => welt - kamera;
  const sichtbar = (x) => sx(x) > -90 && sx(x) < W + 90;
  const hoehe = canvas.height / skala;

  // Himmel und Boden
  G.himmel.setPosition(0, 0).setDisplaySize(W, hoehe);
  streifenMalen(G.berge, kamera, "berge" + n);
  streifenMalen(G.huegel, kamera, "huegel" + n);
  streifenMalen(G.erde, kamera, "erde" + n);
  streifenMalen(G.gras, kamera, "gras" + n);
  G.erdeFlaeche.setSize(W, hoehe);
  if (L.blumen) streifenMalen(G.blumen, kamera, "blumen");
  else G.blumen.bilder.forEach((b) => b.setVisible(false));

  // Wolken (bewegen sich langsamer = sieht weit weg aus)
  G.wolken.forEach((w, i) => {
    const wx = ((i * 420 - kamera * 0.3) % (W + 400) + W + 400) % (W + 400) - 200;
    w.setPosition(wx, 60 + ((i * 53) % 120));
  });
  // Schnee: Schneeflocken fallen vom Himmel
  const t = performance.now() / 1000;
  G.flocken.forEach((f, i) => {
    f.setVisible(!!L.schnee);
    if (!L.schnee) return;
    const fx = ((i * 131 - kamera * 0.6 + Math.sin(t + i) * 10) % W + W) % W;
    const fy = ((i * 53 + t * (30 + (i % 5) * 8)) % (BODEN + obenRand)) - obenRand;
    f.setPosition(fx, fy).setScale((2 + (i % 3)) / 4.5 / ANKER.flocke.ts);
  });

  const nichtsZeigen = !spiel;
  G.hud.forEach((o) => o.setVisible(!nichtsZeigen));
  G.junge.setVisible(!nichtsZeigen);
  G.schatten.setVisible(!nichtsZeigen);
  G.schwert.setVisible(false);
  G.ruestung.setVisible(false);
  G.rueckenSchwerter.forEach((r) => r.setVisible(false));
  G.schwung.clear();
  if (G.welt) G.welt.forEach((o) => o.setVisible(false));
  G.drachen.forEach((d) => d.setVisible(false));
  G.kugeln.forEach((k) => { k.bild.setVisible(false); k.text.setVisible(false); });
  G.texte.forEach((tx) => tx.setVisible(false));
  if (nichtsZeigen) { gebautesLevel = null; return; }

  const LV = spiel.level;
  if (LV !== gebautesLevel) { gebautesLevel = LV; levelAufbauen(szene, LV, L); }

  // Kisten (oder Schneemänner)
  for (const k of LV.kisten) {
    const v = sichtbar(k.x);
    k._bild.setVisible(v); k._schatten.setVisible(v);
  }
  // Monster
  const lauf = Math.floor((((spiel.x / 12) % (Math.PI * 2)) / (Math.PI * 2)) * MONSTER_BILDER);
  for (const m of LV.monster) {
    const v = sichtbar(m.x) && m.umfallen <= 1.2;
    m._bild.setVisible(v);
    m._schatten.setVisible(v && m.lebt);
    if (!v) continue;
    m._bild.x = m.x; m._schatten.x = m.x;
    if (m.lebt) {
      m._bild.setTexture("monster" + lauf);
    } else {
      // umfallen: nach hinten kippen und verschwinden
      m._bild.setTexture("monsterUm");
      m._bild.setAlpha(Math.max(0, 1 - m.umfallen / 1.2));
      m._bild.setRotation(Math.min(1, m.umfallen * 3) * Math.PI / 2);
    }
  }
  // Münzen (drehen sich ein bisschen)
  for (const m of LV.muenzen) {
    const v = !m.weg && sichtbar(m.x);
    m._bild.setVisible(v);
    if (v) m._bild.scaleX = (0.35 + 0.65 * Math.abs(Math.cos(t * 3 + m.x * 0.01))) / ANKER.muenze.ts;
  }
  // Fragezeichen-Blöcke (leuchten ein bisschen, solange sie noch nicht benutzt sind)
  for (const f of LV.fragen) {
    const v = sichtbar(f.x);
    f._bild.setVisible(v);
    if (!v) continue;
    if (f.fertig && f._bild.texture.key !== "frageLeer") f._bild.setTexture("frageLeer").setScale(1 / ANKER.frageLeer.ts);
    else if (!f.fertig) f._bild.setScale((1 + Math.sin(t * 5) * 0.04) / ANKER.frage.ts);
  }
  G.fahne.setVisible(sichtbar(LV.ziel));

  // Der Junge
  const blinkt = spiel.autschZeit > 0 && Math.floor(spiel.autschZeit * 10) % 2 === 0;
  const jx = spiel.x;
  G.junge.setVisible(!blinkt).setPosition(jx, spiel.y);
  if (!spiel.amBoden) G.junge.setTexture("jungeLuft");
  else {
    const phase = ((spiel.x / 18) % (Math.PI * 2)) / (Math.PI * 2);
    G.junge.setTexture("junge" + (Math.floor(phase * LAUF_BILDER) % LAUF_BILDER));
  }
  const hochOben = Math.min(1, (BODEN - spiel.y) / 250);
  G.schatten.setPosition(jx, BODEN + 1).setScale((1 - hochOben * 0.6) / TS).setAlpha(1 - hochOben * 0.5);
  if (spiel.amBoden && !warAmBoden && !spiel.pause) G.staub.explode(7, jx, BODEN);
  warAmBoden = spiel.amBoden;

  if (spiel.ruestung && !blinkt) {
    G.ruestung.setVisible(true).setPosition(jx, spiel.y);
  }
  if (spiel.schwert && !blinkt) {
    // zwei Schwerter über Kreuz auf dem Rücken
    G.rueckenSchwerter[0].setVisible(true).setPosition(jx - 12, spiel.y - 74).setRotation(Math.PI - 0.6);
    G.rueckenSchwerter[1].setVisible(true).setPosition(jx - 2, spiel.y - 77).setRotation(Math.PI - 0.15);
    const hz = spiel.hauZeit;
    const winkel = hz > 0 ? -1.6 + (1 - hz / 0.35) * 2.6 : -0.5;
    G.schwert.setVisible(true).setPosition(jx + 9, spiel.y - 32).setRotation(winkel);
    if (hz > 0) {
      // Schwung-Streifen
      G.schwung.lineStyle(4, 0xffffff, 0.7);
      G.schwung.beginPath();
      G.schwung.arc(jx + 9, spiel.y - 32, 50, -1.6 - Math.PI / 2 + 0.2, winkel - Math.PI / 2, false);
      G.schwung.strokePath();
    }
  }

  // Drachen und ihre Aufgaben-Kugeln (sie fliegen mit dem Bildschirm mit)
  LV.drachen.forEach((d, i) => {
    if (d.zustand === "wartet" || d.zustand === "weg") return;
    const db = G.drachen[i];
    db.setVisible(true);
    if (d.zustand === "besiegt") {
      db.setTexture("drache0").setPosition(kamera + d.sx, d.sy).setRotation(d.fall * 4).setAlpha(Math.max(0.2, 1 - d.fall / 2));
    } else {
      const phase = (((d.zeit * 9) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
      db.setTexture("drache" + (Math.floor(phase * DRACHE_BILDER) % DRACHE_BILDER));
      db.setPosition(kamera + d.sx, d.sy + Math.sin(d.zeit * 3) * 6).setRotation(0).setAlpha(1);
    }
    if (d.zustand === "schiesst" || d.zustand === "zurueck") {
      const k = d.kugel, kb = G.kugeln[i];
      kb.bild.setVisible(true).setPosition(kamera + k.x, k.y).setRotation(d.zustand === "zurueck" ? Math.PI : 0);
      if (kb.text.text !== k.aufgabe.text) kb.text.setText(k.aufgabe.text);
      kb.text.setVisible(true).setPosition(kamera + k.x, k.y - 30);
    }
  });

  // Fliegende Texte
  let frei = 0;
  for (const tx of spiel.texte) {
    let o = G.texte[frei++];
    if (!o) { o = szene.add.text(0, 0, "", textStil(24, "#fff", 5)).setOrigin(0.5).setDepth(50); G.texte.push(o); }
    const inhalt = tx.text.replace("+0 ", "");
    if (o.text !== inhalt) {
      o.setText(inhalt);
      o.setColor(tx.text.startsWith("+") ? "#ffffff" : "#ff6b6b");
    }
    o.setVisible(true).setPosition(tx.x, tx.y).setAlpha(Math.min(1, tx.zeit * 3));
  }

  // Anzeige oben: Münzen und Weg bis zum Ziel
  if (G.letzteZahl !== spiel.muenzen) {
    G.letzteZahl = spiel.muenzen;
    G.hudZahl.setText(String(spiel.muenzen));
    G.hudBoxBreite = null;
  }
  const boxB = 58 + G.hudZahl.width + 2;
  if (G.hudBoxBreite !== boxB) {
    G.hudBoxBreite = boxB;
    G.hudBox.clear();
    G.hudBox.fillStyle(0x1d3557, 0.45);
    G.hudBox.fillRoundedRect(12, 12, boxB, 44, 22);
  }
  const balkenB = Math.min(300, W - 300), balkenX = (W - balkenB) / 2;
  const anteil = Math.min(1, spiel.x / spiel.level.ziel);
  G.balken.clear();
  G.balken.fillStyle(0x1d3557, 0.4);
  G.balken.fillRoundedRect(balkenX - 3, 19, balkenB + 6, 22, 11);
  G.balken.fillStyle(0xffffff, 0.6);
  G.balken.fillRoundedRect(balkenX, 22, balkenB, 16, 8);
  if (anteil > 0.02) {
    G.balken.fillStyle(0xe63946, 1);
    G.balken.fillRoundedRect(balkenX, 22, Math.max(16, balkenB * anteil), 16, 8);
    G.balken.fillStyle(0xffffff, 0.3);
    G.balken.fillRoundedRect(balkenX + 4, 24, Math.max(8, balkenB * anteil - 8), 5, 2.5);
  }
  const levelText = `Level ${spiel.levelNr + 1}: ${L.name}`;
  if (G.letzterLevelText !== levelText) {
    G.letzterLevelText = levelText;
    G.levelText.setText(levelText);
    G.grossText.setText(levelText);
  }
  G.levelText.setPosition(W / 2, 60);
  // Am Anfang vom Level groß in der Mitte
  const gross = spiel.x < L.tempo * 2;
  G.grossText.setVisible(gross).setPosition(W / 2, 150 + obenRand);
  if (gross) G.grossText.setScale(1 + Math.max(0, 0.25 - spiel.x / L.tempo) * 0.6);
}

// =====================================================================
//  Bildschirmgröße und Start
// =====================================================================
function groesseAnpassen() {
  // Mehr als 2-fache Pixeldichte sieht man nicht, kostet aber viel Rechenzeit
  pixelDichte = Math.min(window.devicePixelRatio || 1, 2);
  const cw = Math.round(window.innerWidth * pixelDichte);
  const ch = Math.round(window.innerHeight * pixelDichte);
  // Quer: Höhe füllt den Bildschirm. Hochkant: Breite füllt den Bildschirm,
  // damit man trotzdem genug vom Weg vor sich sieht.
  skala = Math.min(ch / H, cw / MIN_BREITE);
  W = cw / skala;
  obenRand = (ch / skala - H) * 0.6;
  if (spielEngine) {
    spielEngine.scale.resize(cw, ch);
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    const kam = spielEngine.scene.scenes[0] && spielEngine.scene.scenes[0].cameras.main;
    if (kam) { kam.setSize(cw, ch); kam.setZoom(skala); }
  }
}

class SpielSzene extends Phaser.Scene {
  constructor() { super("spiel"); }
  create() {
    szeneBauen(this);
    groesseAnpassen();
  }
  update(zeit, delta) {
    const dt = Math.min(delta / 1000, 1 / 30);
    aktualisieren(dt);
    malen(this);
  }
}

async function grafikStarten() {
  // Erst die Schrift laden, damit "?" und Texte gleich richtig aussehen
  try {
    await Promise.race([
      Promise.all([document.fonts.load(`700 40px ${SCHRIFT}`), document.fonts.load(`600 20px ${SCHRIFT}`)]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch (e) { /* egal, dann eben Ersatzschrift */ }
  groesseAnpassen();
  // Bilder so fein malen, wie es der Bildschirm braucht (2 bis 4)
  TS = Math.min(4, Math.max(2, Math.ceil(skala)));
  // WebGL = Grafikkarte (schnell). Nur wenn das Gerät das nicht kann, ohne.
  let webgl = false;
  try { webgl = !!document.createElement("canvas").getContext("webgl"); } catch (e) { webgl = false; }
  spielEngine = new Phaser.Game({
    type: webgl ? Phaser.WEBGL : Phaser.CANVAS,
    canvas,
    width: Math.round(W * skala),
    height: Math.round(canvas.clientHeight * pixelDichte) || Math.round(window.innerHeight * pixelDichte),
    backgroundColor: "#7ec8ff",
    scale: { mode: Phaser.Scale.NONE },
    render: { antialias: true, powerPreference: "high-performance" },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    audio: { noAudio: true },
    banner: false,
    scene: SpielSzene,
  });
  window.addEventListener("resize", groesseAnpassen);
}
grafikStarten();
