(function () {
  "use strict";

  // PBKDF2-SHA256 of "username:password" — plain credentials are never stored here
  var CRED_HASH = "ad069753ba68c075644110ac688a530671290c785468412bfc236994c0c14da0";
  var CRED_SALT = "tkr-admin-salt-v1";
  var CRED_ITERATIONS = 200000;
  var SESSION_KEY = "tkr_admin_logged_in";
  var SESSION_AT_KEY = "tkr_admin_login_at";
  var SESSION_MS = 5 * 60 * 1000;

  var loginView = document.getElementById("login-view");
  var dashboardView = document.getElementById("dashboard-view");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var logoutBtn = document.getElementById("logout-btn");
  var userInput = document.getElementById("username");
  var passInput = document.getElementById("password");
  var productsBody = document.getElementById("products-admin-body");
  var saveProductsBtn = document.getElementById("save-products-btn");
  var resetProductsBtn = document.getElementById("reset-products-btn");
  var saveMsg = document.getElementById("products-save-msg");

  var logoutTimer = null;
  var draftProducts = [];

  function clearLoginFields() {
    userInput.value = "";
    passInput.value = "";
    userInput.setAttribute("value", "");
    passInput.setAttribute("value", "");
  }

  var SESSION_SIG_KEY = "tkr_admin_sig";

  function randomToken() {
    var bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  function signToken(token, at) {
    var input = token + "|" + at + "|" + CRED_HASH;
    var hash = 5381;
    for (var i = 0; i < input.length; i++) {
      hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
    }
    return String(hash >>> 0);
  }

  function isLoggedIn() {
    var token = sessionStorage.getItem(SESSION_KEY);
    var at = sessionStorage.getItem(SESSION_AT_KEY);
    var sig = sessionStorage.getItem(SESSION_SIG_KEY);
    if (!token || !at || !sig || sig !== signToken(token, at)) {
      setLoggedIn(false);
      return false;
    }
    if (Date.now() - Number(at) > SESSION_MS) {
      setLoggedIn(false);
      return false;
    }
    return true;
  }

  function setLoggedIn(value) {
    if (value) {
      var token = randomToken();
      var at = String(Date.now());
      sessionStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem(SESSION_AT_KEY, at);
      sessionStorage.setItem(SESSION_SIG_KEY, signToken(token, at));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_AT_KEY);
      sessionStorage.removeItem(SESSION_SIG_KEY);
    }
  }

  function clearLogoutTimer() {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }
  }

  function startLogoutTimer() {
    clearLogoutTimer();
    var at = Number(sessionStorage.getItem(SESSION_AT_KEY) || Date.now());
    var remaining = SESSION_MS - (Date.now() - at);
    if (remaining <= 0) {
      autoLogout();
      return;
    }
    logoutTimer = setTimeout(autoLogout, remaining);
  }

  function autoLogout() {
    clearLogoutTimer();
    setLoggedIn(false);
    showLogin();
    loginError.textContent = "Session expired. Please login again.";
    loginError.classList.remove("d-none");
  }

  function showLogin() {
    clearLogoutTimer();
    loginView.classList.remove("d-none");
    dashboardView.classList.add("d-none");
    clearLoginFields();
    setTimeout(clearLoginFields, 50);
    setTimeout(clearLoginFields, 300);
  }

  function showDashboard() {
    loginView.classList.add("d-none");
    dashboardView.classList.remove("d-none");
    clearLoginFields();
    renderProductsAdmin();
    startLogoutTimer();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  /* ----- Products admin ----- */
  function imgPath(image) {
    var path = location.pathname || "";
    var inAdminFolder = /\/admin(\/|\/index\.html)?$/i.test(path) || path.indexOf("/admin/") !== -1;
    if (inAdminFolder && image.indexOf("../") !== 0 && image.indexOf("images/") === 0) {
      return "../" + image;
    }
    return image;
  }

  function renderProductsAdmin() {
    if (!window.TKRProducts || !productsBody) return;
    draftProducts = TKRProducts.get().map(function (p) {
      return Object.assign({}, p);
    });
    productsBody.innerHTML = "";

    draftProducts.forEach(function (p, index) {
      var sale = TKRProducts.salePrice(p.mrp, p.discount);
      var tr = document.createElement("tr");
      tr.setAttribute("data-index", String(index));
      tr.innerHTML =
        "<td class=\"admin-serial\">" +
        (index + 1) +
        "</td>" +
        '<td><img class="admin-prod-thumb" src="' +
        escapeAttr(imgPath(p.image)) +
        '" alt=""></td>' +
        '<td><input type="text" class="form-control form-control-sm" data-field="name" value="' +
        escapeAttr(p.name) +
        '"></td>' +
        '<td><input type="text" class="form-control form-control-sm" data-field="material" value="' +
        escapeAttr(p.material) +
        '"></td>' +
        '<td><input type="text" class="form-control form-control-sm" data-field="size" value="' +
        escapeAttr(p.size) +
        '" placeholder="8×10 ft"></td>' +
        '<td><input type="number" min="0" step="100" class="form-control form-control-sm" data-field="mrp" value="' +
        (p.mrp || "") +
        '" placeholder="0"></td>' +
        '<td><input type="number" min="0" max="100" step="1" class="form-control form-control-sm" data-field="discount" value="' +
        (p.discount || 0) +
        '"></td>' +
        '<td><strong class="admin-sale" data-sale>' +
        (p.mrp > 0 ? TKRProducts.formatINR(sale) : "—") +
        "</strong></td>";
      productsBody.appendChild(tr);
    });
  }

  function syncDraftFromRow(tr) {
    var index = Number(tr.getAttribute("data-index"));
    if (!draftProducts[index]) return;
    tr.querySelectorAll("[data-field]").forEach(function (input) {
      var field = input.getAttribute("data-field");
      var val = input.value;
      if (field === "mrp" || field === "discount") {
        draftProducts[index][field] = Number(val) || 0;
      } else {
        draftProducts[index][field] = val;
      }
    });
    var saleEl = tr.querySelector("[data-sale]");
    var p = draftProducts[index];
    if (saleEl) {
      saleEl.textContent =
        p.mrp > 0
          ? TKRProducts.formatINR(TKRProducts.salePrice(p.mrp, p.discount))
          : "—";
    }
  }

  productsBody.addEventListener("input", function (e) {
    var tr = e.target.closest("tr");
    if (!tr) return;
    syncDraftFromRow(tr);
  });

  saveProductsBtn.addEventListener("click", function () {
    productsBody.querySelectorAll("tr").forEach(syncDraftFromRow);
    TKRProducts.save(draftProducts);
    saveMsg.textContent = "Products saved. Open Products page to see updates.";
    saveMsg.classList.remove("d-none");
    setTimeout(function () {
      saveMsg.classList.add("d-none");
    }, 3500);
  });

  resetProductsBtn.addEventListener("click", function () {
    if (!confirm("Reset all products to default name, size, price and discount?")) return;
    draftProducts = TKRProducts.reset();
    renderProductsAdmin();
    saveMsg.textContent = "Defaults restored.";
    saveMsg.classList.remove("d-none");
  });

  /* ----- Auth ----- */
  [userInput, passInput].forEach(function (el) {
    el.addEventListener("focus", function () {
      el.removeAttribute("readonly");
    });
  });

  function hashCredentials(user, pass) {
    var enc = new TextEncoder();
    return window.crypto.subtle
      .importKey("raw", enc.encode(user + ":" + pass), "PBKDF2", false, ["deriveBits"])
      .then(function (key) {
        return window.crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: enc.encode(CRED_SALT), iterations: CRED_ITERATIONS, hash: "SHA-256" },
          key,
          256
        );
      })
      .then(function (bits) {
        return Array.from(new Uint8Array(bits), function (b) {
          return b.toString(16).padStart(2, "0");
        }).join("");
      });
  }

  var loginBusy = false;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (loginBusy) return;
    var user = userInput.value.trim();
    var pass = passInput.value;

    if (!window.crypto || !window.crypto.subtle) {
      loginError.textContent = "Secure login needs HTTPS. Open the live site to log in.";
      loginError.classList.remove("d-none");
      return;
    }

    loginBusy = true;
    hashCredentials(user, pass)
      .then(function (hash) {
        if (hash === CRED_HASH) {
          loginError.classList.add("d-none");
          setLoggedIn(true);
          clearLoginFields();
          showDashboard();
        } else {
          loginError.textContent = "Wrong username or password.";
          loginError.classList.remove("d-none");
          clearLoginFields();
        }
      })
      .catch(function () {
        loginError.textContent = "Login failed. Please try again.";
        loginError.classList.remove("d-none");
      })
      .then(function () {
        loginBusy = false;
      });
  });

  logoutBtn.addEventListener("click", function () {
    clearLogoutTimer();
    setLoggedIn(false);
    loginError.classList.add("d-none");
    showLogin();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && sessionStorage.getItem(SESSION_KEY)) {
      if (!isLoggedIn()) autoLogout();
    }
  });

  if (isLoggedIn()) showDashboard();
  else showLogin();
})();
