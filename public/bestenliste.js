// =====================================================================
//  BESTENLISTE – Name eintippen und Tabelle mit allen Spielern
// =====================================================================
const MAX_NAME = 12;
const TASTEN = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
  ["Y", "X", "C", "V", "B", "N", "M", "⌫"],
  ["Leertaste", "Fertig ✓"],
];

const namenSchicht = document.getElementById("namen");
const listenSchicht = document.getElementById("liste");
const namenFeld = document.getElementById("namenFeld");
let eingabe = "";
let ergebnis = null;      // { muenzen, klasse }
let danach = null;        // was nach der Liste passieren soll

function namenZeigen() {
  namenFeld.textContent = eingabe || " ";
  namenFeld.classList.toggle("leer", !eingabe);
}

function taste(t) {
  if (t === "⌫") eingabe = eingabe.slice(0, -1);
  else if (t === "Leertaste") { if (eingabe && !eingabe.endsWith(" ") && eingabe.length < MAX_NAME) eingabe += " "; }
  else if (t === "Fertig ✓") return namenSpeichern();
  else if (eingabe.length < MAX_NAME) eingabe += eingabe ? t.toLowerCase() : t;
  namenZeigen();
}

// Tastatur bauen
const tastatur = document.getElementById("tastatur");
for (const reihe of TASTEN) {
  const zeile = document.createElement("div");
  zeile.className = "tastenreihe";
  for (const t of reihe) {
    const knopf = document.createElement("button");
    knopf.className = "taste" + (t.length > 1 && t !== "⌫" ? " breit" : "") + (t === "Fertig ✓" ? " fertig" : "");
    knopf.textContent = t === "Leertaste" ? "␣ Leertaste" : t;
    knopf.addEventListener("click", () => taste(t));
    zeile.appendChild(knopf);
  }
  tastatur.appendChild(zeile);
}
// Echte Tastatur geht auch
window.addEventListener("keydown", (e) => {
  if (namenSchicht.classList.contains("versteckt")) return;
  if (e.key === "Backspace") taste("⌫");
  else if (e.key === "Enter") taste("Fertig ✓");
  else if (e.key === " ") taste("Leertaste");
  else if (/^[a-zäöüß]$/i.test(e.key)) taste(e.key.toUpperCase());
  else return;
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);

// Wird vom Spiel aufgerufen, wenn alle Level geschafft sind
function nameEingeben(muenzen, klasse, weiter) {
  ergebnis = { muenzen, klasse };
  danach = weiter;
  eingabe = "";
  namenZeigen();
  document.getElementById("namenMuenzen").textContent = `Du hast ${muenzen} Münzen! 🪙`;
  document.getElementById("namenMeldung").textContent = "";
  namenSchicht.classList.remove("versteckt");
}

async function namenSpeichern() {
  const name = eingabe.trim();
  const meldung = document.getElementById("namenMeldung");
  if (!name) { meldung.textContent = "Tippe zuerst deinen Namen 🙂"; return; }
  meldung.textContent = "Speichere …";
  let meineId = null;
  try {
    const antwort = await fetch("/api/bestenliste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, muenzen: ergebnis.muenzen, klasse: ergebnis.klasse }),
    });
    const d = await antwort.json();
    if (!antwort.ok) { meldung.textContent = d.fehler || "Hat nicht geklappt."; return; }
    meineId = d.id;
  } catch (e) {
    meldung.textContent = "Keine Verbindung. Nochmal probieren?";
    return;
  }
  namenSchicht.classList.add("versteckt");
  listeZeigen(meineId, danach);
}

// Tabelle anzeigen (meineId wird hervorgehoben)
async function listeZeigen(meineId, weiter) {
  danach = weiter;
  const tabelle = document.getElementById("tabelle");
  tabelle.innerHTML = "<tr><td>Lade …</td></tr>";
  listenSchicht.classList.remove("versteckt");
  try {
    const liste = await (await fetch("/api/bestenliste")).json();
    tabelle.innerHTML = "";
    const kopf = tabelle.insertRow();
    for (const t of ["Platz", "Name", "Münzen", "Klasse"]) {
      const th = document.createElement("th");
      th.textContent = t;
      kopf.appendChild(th);
    }
    if (!liste.length) {
      tabelle.insertRow().insertCell().textContent = "Noch niemand. Sei der Erste!";
    }
    liste.forEach((e, i) => {
      const zeile = tabelle.insertRow();
      if (e.id === meineId) zeile.className = "ich";
      const medaille = ["🥇", "🥈", "🥉"][i] || `${i + 1}.`;
      for (const wert of [medaille, e.name, `${e.muenzen} 🪙`, e.klasse]) zeile.insertCell().textContent = wert;
    });
  } catch (e) {
    tabelle.innerHTML = "<tr><td>Keine Verbindung 😕</td></tr>";
  }
}

document.getElementById("listeZurueck").addEventListener("click", () => {
  listenSchicht.classList.add("versteckt");
  if (danach) danach();
});
