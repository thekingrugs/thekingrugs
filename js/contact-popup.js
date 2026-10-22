/* Contact form: show a popup pointing to WhatsApp, email or phone */
(function () {
  "use strict";

  var PHONE = "918853152715";
  var EMAIL = "thekingrugs@gmail.com";

  var form = document.querySelector(".contact-form");
  var modalEl = document.getElementById("sendModal");
  if (!form || !modalEl || !window.bootstrap) return;

  var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  var whatsappLink = document.getElementById("send-whatsapp");
  var emailLink = document.getElementById("send-email");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var message = document.getElementById("message").value.trim();
    var text = "Hello The King Rugs,\n\n" + message + "\n\n— " + name + (email ? "\n" + email : "");

    whatsappLink.href = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
    emailLink.href =
      "mailto:" +
      EMAIL +
      "?subject=" +
      encodeURIComponent("Enquiry from " + (name || "website")) +
      "&body=" +
      encodeURIComponent(text);

    modal.show();
  });

  [whatsappLink, emailLink].forEach(function (link) {
    link.addEventListener("click", function () {
      form.reset();
      setTimeout(function () {
        modal.hide();
      }, 400);
    });
  });
})();
