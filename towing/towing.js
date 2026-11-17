/*
 * KLN Towing — request form behaviour.
 * Sends the form as JSON to the KLN Dispatch endpoint set in /towing/config.js.
 */
(function () {
  "use strict";
  var PHONE = "204-899-6955";
  // Built-in default so the form still works if config.js is cached, blocked or loads late.
  var DEFAULT_ENDPOINT = "https://kln-dispatch.pages.dev/api/public/tow-request";
  var cfg = window.KLN_TOW_CONFIG || {};
  var endpoint = (cfg.endpoint === undefined ? DEFAULT_ENDPOINT : String(cfg.endpoint)).trim();

  document.querySelectorAll("[data-tow-form-wrap]").forEach(function (wrap) {
    var form = wrap.querySelector("form");
    var offline = wrap.querySelector(".tow-form-offline");
    var success = wrap.querySelector(".tow-success");
    if (!form) return;

    // No endpoint yet -> show the "call us" panel instead of a form that cannot send
    if (!endpoint) {
      form.hidden = true;
      if (offline) offline.hidden = false;
      return;
    }

    var errBox = form.querySelector(".tow-error");
    var submit = form.querySelector(".tow-submit");
    var service = form.elements["service"];
    var dest = form.elements["destination"];
    var destHint = form.querySelector("[data-dest-hint]");
    var scheduleBox = form.querySelector("[data-schedule]");
    var scheduleInput = form.elements["scheduled_for"];
    var startedAt = Date.now();

    // Pre-select the service from ?service=...
    try {
      var qs = new URLSearchParams(window.location.search).get("service");
      if (qs && service && Array.prototype.some.call(service.options, function (o) { return o.value === qs; })) {
        service.value = qs;
      }
    } catch (e) {}

    function syncService() {
      var needsDest = service.value === "towing";
      dest.required = needsDest;
      if (destHint) destHint.textContent = needsDest ? "(required for towing)" : "(if we are taking it somewhere)";
    }
    service.addEventListener("change", syncService);
    syncService();

    form.querySelectorAll('input[name="when"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var scheduled = form.elements["when"].value === "scheduled";
        scheduleBox.hidden = !scheduled;
        scheduleInput.required = scheduled;
      });
    });

    // Each time the pop-up opens: restart the "form opened" timer and clear a previous result
    document.addEventListener("tow:opened", function () {
      startedAt = Date.now();
      errBox.hidden = true;
      if (success && !success.hidden) {
        success.hidden = true;
        form.hidden = false;
        form.reset();
        scheduleBox.hidden = true;
        scheduleInput.required = false;
        syncService();
      }
    });

    form.addEventListener("input", function () { errBox.hidden = true; });

    function showError(msg) {
      errBox.textContent = msg;
      errBox.hidden = false;
      errBox.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    function validate() {
      var problems = [];
      form.querySelectorAll(".is-invalid").forEach(function (el) { el.classList.remove("is-invalid"); });
      function need(el, label) {
        if (!el.value || !el.value.trim()) { el.classList.add("is-invalid"); problems.push(label); }
      }
      need(form.elements["name"], "your name");
      need(form.elements["service"], "the service you need");
      need(form.elements["vehicle"], "your vehicle");
      need(form.elements["pickup"], "where the vehicle is");
      if (dest.required) need(dest, "where we should take it");
      if (scheduleInput.required) need(scheduleInput, "a preferred date and time");
      var digits = (form.elements["phone"].value || "").replace(/\D/g, "");
      if (digits.length < 10) { form.elements["phone"].classList.add("is-invalid"); problems.push("a phone number with area code"); }
      var email = (form.elements["email"].value || "").trim();
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { form.elements["email"].classList.add("is-invalid"); problems.push("a valid email (or leave it empty)"); }
      if (!form.elements["consent"].checked) problems.push("agreement to the Terms and Privacy Policy");
      return problems;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errBox.hidden = true;
      var problems = validate();
      if (problems.length) {
        showError("Please check: " + problems.join(", ") + ".");
        return;
      }
      var conditions = Array.prototype.map.call(form.querySelectorAll('input[name="conditions"]:checked'), function (c) { return c.value; });
      var payload = {
        source: "website-towing",
        page: window.location.pathname,
        submitted_at: new Date().toISOString(),
        form_open_ms: Date.now() - startedAt,
        name: form.elements["name"].value.trim(),
        phone: form.elements["phone"].value.trim(),
        email: form.elements["email"].value.trim(),
        service: form.elements["service"].value,
        vehicle: form.elements["vehicle"].value.trim(),
        vehicle_color: form.elements["vehicle_color"].value.trim(),
        drivetrain: form.elements["drivetrain"].value,
        pickup: form.elements["pickup"].value.trim(),
        destination: form.elements["destination"].value.trim(),
        when: form.elements["when"].value,
        scheduled_for: form.elements["when"].value === "scheduled" ? scheduleInput.value : "",
        conditions: conditions,
        notes: form.elements["notes"].value.trim(),
        consent: true,
        website: form.elements["website"].value // honeypot: must stay empty
      };

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = "Sending…";

      var controller = ("AbortController" in window) ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.hidden = true;
        success.hidden = false;
        try { success.focus({ preventScroll: true }); } catch (e) { success.focus(); }
        if (!success.closest("#tow-modal")) { success.scrollIntoView({ block: "center", behavior: "smooth" }); }
      }).catch(function () {
        showError("We couldn’t send your request. Please call " + PHONE + " and we’ll get a truck on the way.");
      }).then(function () {
        if (timer) clearTimeout(timer);
        submit.disabled = false;
        submit.textContent = label;
      });
    });
  });

  // ---------- Request form pop-up ----------
  var modal = document.getElementById("tow-modal");
  if (modal) {
    var openModal = function (svc) {
      document.dispatchEvent(new CustomEvent("tow:opened"));
      var f = modal.querySelector("form");
      if (svc && f && f.elements["service"]) {
        var sel = f.elements["service"];
        var ok = Array.prototype.some.call(sel.options, function (o) { return o.value === svc; });
        if (ok) { sel.value = svc; sel.dispatchEvent(new Event("change")); }
      }
      if (typeof modal.showModal === "function") { if (!modal.open) modal.showModal(); }
      else { modal.setAttribute("open", ""); }
      document.documentElement.classList.add("tow-modal-open");
      var first = modal.querySelector("form:not([hidden]) input, .tow-success:not([hidden])");
      if (first && first.focus) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    };
    var closeModal = function () {
      if (typeof modal.close === "function") { if (modal.open) modal.close(); }
      else { modal.removeAttribute("open"); }
      document.documentElement.classList.remove("tow-modal-open");
    };
    modal.addEventListener("close", function () { document.documentElement.classList.remove("tow-modal-open"); });
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); }); // click on the dark backdrop
    modal.querySelectorAll("[data-tow-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href="#request"], a[href$="request.html"], a[href*="request.html?"], [data-tow-open]') : null;
      if (!a || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (a.closest("#tow-modal")) return;
      e.preventDefault();
      var svc = "";
      try { svc = new URL(a.getAttribute("href") || "", window.location.href).searchParams.get("service") || ""; } catch (err) {}
      openModal(svc);
    });
    if (window.location.hash === "#request") { openModal(""); }
  }

  // ---------- Photo viewer ----------
  var box = document.getElementById("tow-lightbox");
  if (box) {
    var boxImg = box.querySelector("img");
    var closeBox = function () { if (typeof box.close === "function") { if (box.open) box.close(); } else { box.removeAttribute("open"); } };
    document.querySelectorAll("[data-lightbox]").forEach(function (b) {
      b.addEventListener("click", function () {
        boxImg.src = b.getAttribute("data-lightbox");
        boxImg.alt = b.getAttribute("data-alt") || "";
        if (typeof box.showModal === "function") { if (!box.open) box.showModal(); } else { box.setAttribute("open", ""); }
      });
    });
    box.addEventListener("click", closeBox);
  }
})();
