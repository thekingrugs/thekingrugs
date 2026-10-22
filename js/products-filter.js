(function () {
  "use strict";

  var cards = Array.from(document.querySelectorAll("#product-grid .product-card"));
  if (!cards.length) return;

  var comboBox = document.getElementById("filter-combo");
  var patternBox = document.getElementById("filter-pattern");
  var emptyEl = document.getElementById("products-empty");
  var clearBtn = document.getElementById("filter-clear");
  var toggleBtn = document.getElementById("filter-toggle");
  var filtersEl = document.getElementById("product-filters");
  var backdrop = document.getElementById("filter-backdrop");

  var activeCombo = null;
  var activePattern = null;

  function comboOf(card) {
    var material = (card.getAttribute("data-material") || "").trim();
    var size = (card.getAttribute("data-size") || "").trim();
    if (material && size) return material + " · " + size;
    return material || size || "";
  }

  function patternOf(card) {
    return (
      (card.getAttribute("data-title") || "").trim() ||
      (card.querySelector("h3") && card.querySelector("h3").textContent.trim()) ||
      ""
    );
  }

  cards.forEach(function (card) {
    card.setAttribute("data-combo", comboOf(card));
    card.setAttribute("data-pattern", patternOf(card));
  });

  var combos = Array.from(
    new Set(
      cards
        .map(function (c) {
          return c.getAttribute("data-combo");
        })
        .filter(Boolean)
    )
  ).sort(function (a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  });

  var patterns = Array.from(
    new Set(
      cards
        .map(function (c) {
          return c.getAttribute("data-pattern");
        })
        .filter(Boolean)
    )
  ).sort(function (a, b) {
    return a.localeCompare(b);
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fillRadios(container, values, namePrefix) {
    container.innerHTML = "";
    values.forEach(function (value) {
      var id = namePrefix + "-" + value.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      var label = document.createElement("label");
      label.className = "filter-option";
      label.setAttribute("for", id);
      label.innerHTML =
        '<input type="radio" name="' +
        namePrefix +
        '" id="' +
        id +
        '" value="' +
        escapeHtml(value) +
        '"><span>' +
        escapeHtml(value) +
        "</span>";
      container.appendChild(label);
    });
  }

  fillRadios(comboBox, combos, "combo-filter");
  fillRadios(patternBox, patterns, "pattern-filter");

  function applyFilters() {
    var visible = 0;
    cards.forEach(function (card) {
      var combo = card.getAttribute("data-combo") || "";
      var pattern = card.getAttribute("data-pattern") || "";
      var okCombo = activeCombo === null || combo === activeCombo;
      var okPattern = activePattern === null || pattern === activePattern;
      var show = okCombo && okPattern;
      card.classList.toggle("is-filtered-out", !show);
      if (show) {
        visible += 1;
        card.classList.add("in-view");
      }
    });

    emptyEl.classList.toggle("d-none", visible !== 0);

    comboBox.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.checked = activeCombo !== null && radio.value === activeCombo;
    });
    patternBox.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.checked = activePattern !== null && radio.value === activePattern;
    });
  }

  function bindRadioGroup(box, getActive, setActive) {
    box.addEventListener("change", function (e) {
      var input = e.target;
      if (!input.matches('input[type="radio"]')) return;
      setActive(input.value);
      applyFilters();
    });

    box.addEventListener("click", function (e) {
      var input = e.target.closest('input[type="radio"]');
      if (!input) return;
      if (getActive() === input.value) {
        setTimeout(function () {
          input.checked = false;
          setActive(null);
          applyFilters();
        }, 0);
      }
    });
  }

  bindRadioGroup(
    comboBox,
    function () {
      return activeCombo;
    },
    function (v) {
      activeCombo = v;
    }
  );

  bindRadioGroup(
    patternBox,
    function () {
      return activePattern;
    },
    function (v) {
      activePattern = v;
    }
  );

  clearBtn.addEventListener("click", function () {
    activeCombo = null;
    activePattern = null;
    applyFilters();
  });

  function openFilters() {
    filtersEl.classList.add("is-open");
    backdrop.classList.remove("d-none");
    document.body.classList.add("filters-open");
  }

  function closeFilters() {
    filtersEl.classList.remove("is-open");
    backdrop.classList.add("d-none");
    document.body.classList.remove("filters-open");
  }

  toggleBtn.addEventListener("click", function () {
    if (filtersEl.classList.contains("is-open")) closeFilters();
    else openFilters();
  });

  backdrop.addEventListener("click", closeFilters);

  var closeBtn = document.getElementById("filter-close");
  if (closeBtn) closeBtn.addEventListener("click", closeFilters);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && filtersEl.classList.contains("is-open")) closeFilters();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 992 && filtersEl.classList.contains("is-open")) closeFilters();
  });

  applyFilters();
})();
