document.addEventListener("DOMContentLoaded", function () {
  const filterGroups = document.querySelectorAll(".filter-group");
  const shopItems = document.querySelectorAll(".shop-gallery-container a");

  // Aktive Filter pro Gruppe
  const activeFilters = {
    bewegung: "all",
    kategorie: "all",
    farbe: "all"
  };

  filterGroups.forEach(function (group) {
    const filterType = group.dataset.filter;
    const buttons = group.querySelectorAll(".filter-btn");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Active-Klasse in dieser Gruppe umschalten
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
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

      link.style.display = show ? "" : "none";
    });
  }
});
