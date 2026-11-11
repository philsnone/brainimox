// =====================================================================
//  ENTWICKLERMODUS – mit PIN: direkt in ein Level springen,
//  Figur wählen und Schwert oder Rüstung gleich mitnehmen.
//  (Die PIN ist nur eine Kindersicherung, kein echtes Passwort.)
// =====================================================================
const ENTWICKLER_PIN = "1008";

const pinSchicht = document.getElementById("pin");
const pinFeld = document.getElementById("pinFeld");
const pinMeldung = document.getElementById("pinMeldung");
const entwicklerSchicht = document.getElementById("entwickler");
let pinEingabe = "";

// Was im Entwicklermodus gerade ausgewählt ist
const entwicklerWahl = { level: 0, figur: "junge", schwert: false, ruestung: false, klasse: 3 };

function pinZeigen() {
  pinFeld.textContent = pinEingabe ? "●".repeat(pinEingabe.length) : " ";
}
function pinTaste(t) {
  if (t === "⌫") pinEingabe = pinEingabe.slice(0, -1);
  else if (t === "OK") return pinPruefen();
  else if (pinEingabe.length < 8) pinEingabe += t;
  pinMeldung.textContent = "";
  pinZeigen();
  if (pinEingabe.length === ENTWICKLER_PIN.length && pinEingabe === ENTWICKLER_PIN) pinPruefen();
}
function pinPruefen() {
  if (pinEingabe === ENTWICKLER_PIN) {
    pinSchicht.classList.add("versteckt");
    entwicklerAnzeigen();
    entwicklerSchicht.classList.remove("versteckt");
  } else {
    pinMeldung.textContent = "Falsche PIN 🔒";
    pinEingabe = "";
    pinZeigen();
  }
}

// PIN-Tasten bauen
const pinTasten = document.getElementById("pinTasten");
for (const t of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"]) {
  const knopf = document.createElement("button");
  knopf.className = "taste" + (t === "OK" ? " fertig" : "");
  knopf.textContent = t;
  knopf.addEventListener("click", () => pinTaste(t));
  pinTasten.appendChild(knopf);
}
// Echte Tastatur geht auch
window.addEventListener("keydown", (e) => {
  if (pinSchicht.classList.contains("versteckt")) return;
  if (/^[0-9]$/.test(e.key)) pinTaste(e.key);
  else if (e.key === "Backspace") pinTaste("⌫");
  else if (e.key === "Enter") pinTaste("OK");
  else if (e.key === "Escape") pinSchliessen();
  else return;
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);

function pinSchliessen() {
  pinSchicht.classList.add("versteckt");
  startSchicht.classList.remove("versteckt");
}
document.getElementById("entwicklerKnopf").addEventListener("click", () => {
  pinEingabe = "";
  pinMeldung.textContent = "";
  pinZeigen();
  startSchicht.classList.add("versteckt");
  pinSchicht.classList.remove("versteckt");
});
document.getElementById("pinZurueck").addEventListener("click", pinSchliessen);

// Auswahl-Seite
function wahlKnopf(text, aktiv, klick) {
  const knopf = document.createElement("button");
  knopf.className = "wahl" + (aktiv ? " aktiv" : "");
  knopf.textContent = text;
  knopf.addEventListener("click", klick);
  return knopf;
}
function entwicklerAnzeigen() {
  const W_ = entwicklerWahl;
  const levelBox = document.getElementById("entwicklerLevel");
  levelBox.innerHTML = "";
  EINSTELLUNGEN.level.forEach((L, i) => {
    levelBox.appendChild(wahlKnopf(`${i + 1}: ${L.name}`, W_.level === i, () => { W_.level = i; entwicklerAnzeigen(); }));
  });
  const figurBox = document.getElementById("entwicklerFiguren");
  figurBox.innerHTML = "";
  for (const f of EINSTELLUNGEN.figuren) {
    const knopf = document.createElement("button");
    knopf.className = "figur" + (W_.figur === f.id ? " aktiv" : "");
    if (typeof figurBild === "function") {
      const img = document.createElement("img");
      img.src = figurBild(f);
      img.alt = "";
      knopf.appendChild(img);
    }
    const text = document.createElement("span");
    text.textContent = f.name;
    knopf.appendChild(text);
    knopf.addEventListener("click", () => { W_.figur = f.id; entwicklerAnzeigen(); });
    figurBox.appendChild(knopf);
  }
  document.getElementById("entwicklerSchwert").classList.toggle("aktiv", W_.schwert);
  document.getElementById("entwicklerRuestung").classList.toggle("aktiv", W_.ruestung);
  document.querySelectorAll("[data-entwickler-klasse]").forEach((k) => {
    k.classList.toggle("aktiv", Number(k.dataset.entwicklerKlasse) === W_.klasse);
  });
}
document.getElementById("entwicklerSchwert").addEventListener("click", () => {
  entwicklerWahl.schwert = !entwicklerWahl.schwert; entwicklerAnzeigen();
});
document.getElementById("entwicklerRuestung").addEventListener("click", () => {
  entwicklerWahl.ruestung = !entwicklerWahl.ruestung; entwicklerAnzeigen();
});
document.querySelectorAll("[data-entwickler-klasse]").forEach((k) => {
  k.addEventListener("click", () => { entwicklerWahl.klasse = Number(k.dataset.entwicklerKlasse); entwicklerAnzeigen(); });
});
document.getElementById("entwicklerZurueck").addEventListener("click", () => {
  entwicklerSchicht.classList.add("versteckt");
  startSchicht.classList.remove("versteckt");
});
document.getElementById("entwicklerStart").addEventListener("click", () => {
  const W_ = entwicklerWahl;
  entwicklerSchicht.classList.add("versteckt");
  klasse = W_.klasse;
  entwicklerSpiel = true;
  // Figur gilt nur für dieses Spiel (gekaufte Figuren bleiben, wie sie sind)
  entwicklerFigur = W_.figur;
  if (typeof figurNeuMalen === "function") figurNeuMalen();
  neuesSpiel(W_.level, 0, W_.schwert, W_.ruestung);
});
