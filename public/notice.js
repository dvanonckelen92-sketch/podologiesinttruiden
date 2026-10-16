// Mededelingsbalk (zie `notice` in src/data/site.ts). Staat in de <head>,
// zodat een verlopen of weggeklikte melding al verborgen is vóór de eerste
// paint: geen flits bij het navigeren en geen layout shift. Apart bestand
// omdat de CSP in netlify.toml geen inline scripts toelaat.
(function () {
  var s = document.currentScript;
  var key = 'notice-closed:' + s.dataset.id;
  var root = document.documentElement;
  var closed = false;
  try { closed = localStorage.getItem(key) === '1'; } catch (e) {}
  var today = new Date();
  var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  if (closed || iso > s.dataset.until) { root.classList.add('notice-off'); return; }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.notice-close')) return;
    root.classList.add('notice-off');
    try { localStorage.setItem(key, '1'); } catch (e) {}
  });
})();
