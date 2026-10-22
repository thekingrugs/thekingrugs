/* Render products page from catalog (admin-editable) */
(function () {
  "use strict";

  var grid = document.getElementById("product-grid");
  if (!grid || !window.TKRProducts) return;

  var products = TKRProducts.get();

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardHTML(p) {
    var hasDeal = p.mrp > 0 && p.discount > 0;
    var sale = TKRProducts.salePrice(p.mrp, p.discount);
    var desc =
      (p.material || "Carpet") +
      " · Size " +
      (p.size || "") +
      (hasDeal ? " · " + p.discount + "% OFF" : "");
    var priceBlock = "";
    if (hasDeal) {
      priceBlock =
        '<div class="product-price">' +
        '<span class="price-sale">' +
        TKRProducts.formatINR(sale) +
        "</span>" +
        '<span class="price-mrp">' +
        TKRProducts.formatINR(p.mrp) +
        "</span>" +
        '<span class="price-off">' +
        p.discount +
        "% OFF</span>" +
        "</div>";
    } else if (p.mrp > 0) {
      priceBlock =
        '<div class="product-price"><span class="price-sale">' +
        TKRProducts.formatINR(p.mrp) +
        "</span></div>";
    }

    return (
      '<article class="product-card' +
      (hasDeal ? " has-deal" : "") +
      '" data-gallery-item' +
      ' data-src="' +
      escapeHtml(p.image) +
      '" data-title="' +
      escapeHtml(p.name) +
      '" data-material="' +
      escapeHtml(p.material) +
      '" data-size="' +
      escapeHtml(p.size) +
      '" data-desc="' +
      escapeHtml(desc) +
      '">' +
      '<div class="product-media">' +
      (hasDeal ? '<span class="deal-badge">' + p.discount + "% OFF</span>" : "") +
      '<img src="' +
      escapeHtml(p.image) +
      '" alt="' +
      escapeHtml(p.name) +
      '">' +
      "</div>" +
      '<div class="product-info">' +
      "<h3>" +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="product-spec">' +
      escapeHtml((p.material || "") + (p.material && p.size ? " · " : "") + (p.size || "")) +
      "</p>" +
      priceBlock +
      "</div>" +
      "</article>"
    );
  }

  grid.innerHTML = products.map(cardHTML).join("");
  grid.querySelectorAll(".product-card").forEach(function (el) {
    el.classList.add("in-view");
  });
})();
