"use strict";

/* ---------- Data ---------- */

const FEI = { name: "Fakulta FEI STU", address: "Ilkovičova 3, 812 19 Bratislava", lat: 48.15251, lng: 17.07326 };
const HOME = { name: "Internát Mladosť", address: "Staré grunty 53, 841 04 Bratislava", lat: 48.15867, lng: 17.06414 };

/* Hotspots on the workspace photo. x and y are percentages of the photo size. */
const HOTSPOTS = [
  {
    x: "61.5%", y: "38%", place: "panel--left",
    title: "Širokouhlý monitor",
    text: "Vľavo mám IDE, vpravo strom projektu a konzolu. Tu vzniká backend v Spring Boote – REST API, Hibernate, entity, väčšinou v Kotline."
  },
  {
    x: "30.7%", y: "52%", place: "",
    title: "Notebook s terminálom",
    text: "Druhá obrazovka a zároveň môj terminál. Docker, kubectl a logy z pipeline bežia tu, aby mi nezaberali miesto na veľkom monitore."
  },
  {
    x: "55%", y: "58%", place: "panel--left",
    title: "Klávesnica a slúchadlá",
    text: "Keď si nasadím slúchadlá a položím ruky sem, obyčajne dopisujem testy. Kým nie sú zelené, funkciu za hotovú nepovažujem."
  },
  {
    x: "37%", y: "17.5%", place: "",
    title: "Závesy",
    text: "Mám ich zatiahnuté takmer stále. Bez odleskov na monitore sa kód číta oveľa lepšie a večer ma nerozptyľuje, čo sa deje vonku."
  },
  {
    x: "96%", y: "48%", place: "panel--left",
    title: "Ventilátor",
    text: "Stojí hneď vedľa stola. V lete je jediný dôvod, prečo sa pri dlhšom builde neuvarím – a jeho šum mi zároveň prekryje chodbu na internáte."
  },
  {
    x: "62.5%", y: "74.5%", place: "panel--left panel--above",
    title: "Stôl",
    text: "Obyčajná dlhá čierna doska. Vojde sa na ňu monitor, notebook aj poznámky, takže nemusím nič presúvať, keď prepnem zo školy na vlastný projekt."
  },
  {
    x: "88.5%", y: "76%", place: "panel--left panel--above",
    title: "Tvorivý neporiadok",
    text: "Čokoláda, termoska, káble a krabica, ktorú stále nemám kam dať. Upratujem to raz za dva týždne – zvyčajne vtedy, keď mi nejde vyriešiť nejaký bug."
  },
  {
    x: "17.7%", y: "86%", place: "panel--above",
    title: "Kreslo",
    text: "Staré kancelárske kreslo z druhej ruky. Nie je to dizajnový kúsok, ale po troch hodinách pri zadaní ho ešte stále neprekľajem."
  }
];

/* ---------- Menu (hamburger on small screens) ---------- */

const navButton = document.getElementById("nav-toggle");
const nav = document.getElementById("site-nav");

if (navButton && nav) {
  navButton.addEventListener("click", function () {
    const isOpen = nav.dataset.open === "true";
    nav.dataset.open = isOpen ? "false" : "true";
    navButton.setAttribute("aria-expanded", isOpen ? "false" : "true");
  });
}

/* ---------- Print button (cv.html) ---------- */

const printButton = document.getElementById("print-button");

if (printButton) {
  printButton.addEventListener("click", function () {
    window.print();
  });
}

/* ---------- Hotspots (workspace.html) ---------- */

const stage = document.getElementById("workspace-stage");

if (stage) {
  HOTSPOTS.forEach(function (spot, i) {
    const div = document.createElement("div");
    div.className = "spot";
    div.style.setProperty("--x", spot.x);
    div.style.setProperty("--y", spot.y);

    div.innerHTML =
      '<button type="button" class="hotspot" aria-label="' + spot.title + '">' + (i + 1) + "</button>" +
      '<div class="panel ' + spot.place + '">' +
      '<p class="panel__title">' + spot.title + "</p>" +
      '<p class="panel__text">' + spot.text + "</p>" +
      "</div>";

    stage.appendChild(div);
  });
}

/* ---------- Current lesson (schedule.html) ---------- */

function toTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h + ":" + (m < 10 ? "0" + m : m);
}

function highlightLesson() {
  const status = document.getElementById("now-status");
  const slots = document.querySelectorAll(".slot");
  if (!status) {
    return;
  }

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday ...
  const minutes = now.getHours() * 60 + now.getMinutes();
  let current = null;

  slots.forEach(function (slot) {
    const start = Number(slot.dataset.start);
    const end = Number(slot.dataset.end);
    const isNow = Number(slot.dataset.day) === day && minutes >= start && minutes < end;

    slot.classList.toggle("is-now", isNow);
    if (isNow) {
      current = slot;
    }
  });

  if (current) {
    const name = current.querySelector(".lesson__name").textContent;
    status.textContent = "Práve prebieha: " + name + ", do " + toTime(Number(current.dataset.end)) + ".";
  } else {
    status.textContent = "Práve nemám výučbu.";
  }
}

if (document.getElementById("schedule-table")) {
  highlightLesson();
  setInterval(highlightLesson, 60000); // check again every minute
}

/* ---------- Map (map.html) ---------- */

/* Distance between two points on Earth in km (haversine formula). */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.asin(Math.sqrt(a));
}

const mapBox = document.getElementById("map");

if (mapBox && window.L) {
  const map = L.map(mapBox);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  [FEI, HOME].forEach(function (place) {
    L.marker([place.lat, place.lng])
      .addTo(map)
      .bindPopup("<strong>" + place.name + "</strong><br>" + place.address);
  });

  /* zoom so that both points are visible */
  map.fitBounds([[FEI.lat, FEI.lng], [HOME.lat, HOME.lng]], { padding: [40, 40] });

  const km = distanceKm(FEI.lat, FEI.lng, HOME.lat, HOME.lng);
  const text = Math.round(km * 1000) + " m";

  /* dashed line between the points with the distance written on it */
  L.polyline([[FEI.lat, FEI.lng], [HOME.lat, HOME.lng]], { dashArray: "8 6" })
    .addTo(map)
    .bindTooltip(text, { permanent: true, direction: "center" });

  document.getElementById("distance-value").textContent = text;
}
