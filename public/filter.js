document.addEventListener("DOMContentLoaded", function () {
  const filterGroups = document.querySelectorAll(".filter-group"); // Alle Filtergruppen auswählen
  const shopItems = document.querySelectorAll(".shop-gallery-container a"); // Alle Shop-Items auswählen (vom Typ <a>)

  // Aktive Filter initial
  const activeFilters = {
    bewegung: "all",
    kategorie: "all",
    farbe: "all"
  };

  // durch gruppen iterieren
  filterGroups.forEach(function (group) {
    const filterType = group.dataset.filter;
    const buttons = group.querySelectorAll(".filter-btn");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Active entfernen und nur den geklickten Button aktiv setzen
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active"); //für CSS
        activeFilters[filterType] = btn.dataset.value;

        applyFilters();
      });
    });
  });

  function applyFilters() {
    shopItems.forEach(function (link) {
      var item = link.querySelector(".shop-item");
      var show = true;

      // Bewegung-Filter
      if (activeFilters.bewegung !== "all") {
        if (item.dataset.bewegung !== activeFilters.bewegung) {
          show = false;
        }
      }

      // Kategorie-Filter
      if (activeFilters.kategorie !== "all") {
        if (item.dataset.kategorie !== activeFilters.kategorie) {
          show = false;
        }
      }

      // Farb-Filter
      if (activeFilters.farbe !== "all") {
        try {
          var farben = JSON.parse(item.dataset.farben || "[]");
          if (farben.indexOf(activeFilters.farbe) === -1) {
            show = false;
          }
        } catch (e) {
          show = false;
        }
      }
      //display für <a> element setzen (ausblenden)
      link.style.display = show ? "" : "none";
    });
  }
});
