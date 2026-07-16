// /assets/js/cookies.js
(function(){
  const KEY = 'klnConsentV1';
  const DEFAULTS = { essential: true, analytics: false, marketing: false, ts: null };
  const AUTO_OPEN_DELAY_MS = 400; // pequeño delay para evitar salto visual

  // Utils
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn) => el.addEventListener(ev, fn, false);

  function getConsent(){
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch(_) { return null; }
  }
  function setConsent(c){
    c.ts = Date.now();
    localStorage.setItem(KEY, JSON.stringify(c));
    applyConsent(c);
  }

  function applyConsent(c){
    // Ejecuta/inyecta scripts marcados con data-consent cuando su categoría esté permitida
    $$('script[data-consent]').forEach(function(s){
      const cat = s.getAttribute('data-consent');
      const allowed = (cat === 'essential') ? true : !!c[cat];
      if (allowed && !s.getAttribute('data-loaded')) {
        if (s.src) {
          const clone = document.createElement('script');
          clone.type = 'text/javascript';
          clone.src = s.src;
          clone.async = s.async;
          clone.defer = s.defer;
          s.parentNode.insertBefore(clone, s.nextSibling);
        } else {
          const inline = document.createElement('script');
          inline.type = 'text/javascript';
          inline.textContent = s.textContent;
          s.parentNode.insertBefore(inline, s.nextSibling);
        }
        s.setAttribute('data-loaded','1');
      }
    });
    window.dispatchEvent(new CustomEvent('kln:consent-applied', { detail: c }));
  }

  function showBanner(){ const b = $('#cookie-banner'); if (b) b.classList.remove('hidden'); }
  function hideBanner(){ const b = $('#cookie-banner'); if (b) b.classList.add('hidden'); }
  function openModal(e){
    if(e) e.preventDefault();
    const m = $('#cookie-modal');
    if(m){ m.classList.remove('hidden'); m.setAttribute('aria-hidden','false'); }
  }
  function closeModal(){
    const m = $('#cookie-modal');
    if(m){ m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); }
  }
  function syncTogglesFromConsent(){
    const c = getConsent() || DEFAULTS;
    $$('.cookie-modal [data-consent-toggle]').forEach(chk => {
      chk.checked = !!c[chk.getAttribute('data-consent-toggle')];
    });
  }

  // Estado inicial
  const existing = getConsent();
  if (existing) {
    applyConsent(existing);
    hideBanner();
  } else {
    // No hay consentimiento -> mostrar banner y abrir modal automáticamente
    showBanner();
    // Esperar a que exista el modal en el DOM (por si el tema monta tarde)
    let tries = 30;
    (function waitAndOpen(){
      if ($('#cookie-modal')) {
        setTimeout(function(){
          syncTogglesFromConsent();
          openModal();
        }, AUTO_OPEN_DELAY_MS);
      } else if (tries-- > 0) {
        setTimeout(waitAndOpen, 100);
      }
    })();
  }

  // Delegación de clics (un solo listener para todos los botones relevantes)
  on(document, 'click', function(e){
    const t = e.target.closest('[data-open-preferences],[data-close-preferences],[data-accept-all],[data-reject-all],[data-save-preferences]');
    if (!t) return;

    if (t.hasAttribute('data-open-preferences')) {
      e.preventDefault();
      syncTogglesFromConsent();
      openModal();
      return;
    }
    if (t.hasAttribute('data-close-preferences')) {
      e.preventDefault();
      closeModal();
      return;
    }
    if (t.hasAttribute('data-accept-all')) {
      setConsent({ essential:true, analytics:true, marketing:true });
      closeModal(); hideBanner();
      return;
    }
    if (t.hasAttribute('data-reject-all')) {
      setConsent({ essential:true, analytics:false, marketing:false });
      closeModal(); hideBanner();
      return;
    }
    if (t.hasAttribute('data-save-preferences')) {
      const c = { essential:true, analytics:false, marketing:false };
      $$('.cookie-modal [data-consent-toggle]').forEach(chk => {
        c[chk.getAttribute('data-consent-toggle')] = chk.checked;
      });
      setConsent(c); closeModal(); hideBanner();
      return;
    }
  });

  // Si el banner/modal aparecen tarde, asegura visibilidad correcta
  let retries = 30;
  (function waitForUI(){
    const hasBanner = !!$('#cookie-banner');
    const hasModal  = !!$('#cookie-modal');
    if (hasBanner && hasModal) {
      if (existing) { hideBanner(); } else { showBanner(); }
      return;
    }
    if (retries-- > 0) setTimeout(waitForUI, 100);
  })();
})();
