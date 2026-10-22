/* Shared product catalog — admin edits save to localStorage */
(function (global) {
  "use strict";

  var PRODUCTS_KEY = "tkr_products_catalog";

  var DEFAULT_PRODUCTS = [
    {
      id: "p10",
      image: "images/product10.jpeg",
      name: "Terra Forma",
      material: "Handcrafted",
      size: "8×10 ft",
      mrp: 170500,
      discount: 50
    },
    {
      id: "p11",
      image: "images/product11.jpeg",
      name: "Imperial Grove",
      material: "Handcrafted",
      size: "9×12 ft",
      mrp: 260000,
      discount: 50
    },
    {
      id: "p12",
      image: "images/product12.jpeg",
      name: "Sahara Curve",
      material: "Handcrafted",
      size: "6×9 ft",
      mrp: 140000,
      discount: 50
    },
    {
      id: "p13",
      image: "images/product13.jpeg",
      name: "Palace Weave",
      material: "Handcrafted",
      size: "10×14 ft",
      mrp: 290900,
      discount: 50
    },
    {
      id: "p14",
      image: "images/product14.jpeg",
      name: "Meadow Arc",
      material: "Handcrafted",
      size: "6×9 ft",
      mrp: 110200,
      discount: 50
    },
    {
      id: "p15",
      image: "images/product15.jpeg",
      name: "Ridge Bloom",
      material: "Handcrafted",
      size: "6×8 ft",
      mrp: 130700,
      discount: 50
    },
    {
      id: "p16",
      image: "images/product16.jpeg",
      name: "Cove Leaf",
      material: "Handcrafted",
      size: "5×8 ft",
      mrp: 68300,
      discount: 50
    },
    {
      id: "p1",
      image: "images/product1.jpeg",
      name: "Autumn",
      material: "Hand knotted",
      size: "5×8 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p2",
      image: "images/product2.jpeg",
      name: "Tradition Star",
      material: "Hand knotted",
      size: "5×7 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p3",
      image: "images/product3.jpeg",
      name: "Mirza",
      material: "100% Woven Dhurries",
      size: "5×8 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p4",
      image: "images/product4.jpeg",
      name: "Spider",
      material: "100% Wool",
      size: "6×8 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p5",
      image: "images/product5.jpeg",
      name: "Pattern",
      material: "100% Natural Jute",
      size: "5×8 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p6",
      image: "images/product6.jpeg",
      name: "Rooft",
      material: "100% Natural Jute",
      size: "5×8 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p7",
      image: "images/product7.jpeg",
      name: "Triangle",
      material: "100% Wool",
      size: "5×5 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p8",
      image: "images/product8.jpeg",
      name: "Flower",
      material: "100% Viscose",
      size: "4×6 ft",
      mrp: 0,
      discount: 0
    },
    {
      id: "p9",
      image: "images/product9.jpeg",
      name: "Zebra",
      material: "100% Wool",
      size: "5×8 ft",
      mrp: 0,
      discount: 0
    }
  ];

  function salePrice(mrp, discount) {
    var m = Number(mrp) || 0;
    var d = Math.min(100, Math.max(0, Number(discount) || 0));
    return Math.round(m * (1 - d / 100));
  }

  function formatINR(n) {
    var num = Math.round(Number(n) || 0);
    return "₹" + num.toLocaleString("en-IN");
  }

  function normalize(list) {
    return (list || []).map(function (p) {
      return {
        id: p.id,
        image: p.image,
        name: (p.name || "").trim(),
        material: (p.material || "").trim(),
        size: (p.size || "").trim(),
        mrp: Number(p.mrp) || 0,
        discount: Math.min(100, Math.max(0, Number(p.discount) || 0))
      };
    });
  }

  function getProducts() {
    try {
      var raw = localStorage.getItem(PRODUCTS_KEY);
      if (!raw) return normalize(DEFAULT_PRODUCTS);
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return normalize(DEFAULT_PRODUCTS);
      return normalize(parsed);
    } catch (e) {
      return normalize(DEFAULT_PRODUCTS);
    }
  }

  function saveProducts(list) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(normalize(list)));
  }

  function resetProducts() {
    localStorage.removeItem(PRODUCTS_KEY);
    return getProducts();
  }

  global.TKRProducts = {
    KEY: PRODUCTS_KEY,
    DEFAULTS: DEFAULT_PRODUCTS,
    get: getProducts,
    save: saveProducts,
    reset: resetProducts,
    salePrice: salePrice,
    formatINR: formatINR
  };
})(window);
