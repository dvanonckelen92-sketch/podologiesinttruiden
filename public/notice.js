// Mededelingsbalk (zie `notice` in src/data/site.ts). Wordt synchroon geladen
// direct na de balk, zodat een verlopen of weggeklikte melding verdwijnt vóór
// de eerste paint (geen layout shift). Apart bestand omdat de CSP in
// netlify.toml geen inline scripts toelaat.
(function () {
  var n = document.getElementById('notice');
  if (!n) return;
  var key = 'notice-closed:' + n.dataset.id;
  var closed = false;
  try { closed = localStorage.getItem(key) === '1'; } catch (e) {}
  var today = new Date();
  var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  if (closed || iso > n.dataset.until) { n.hidden = true; return; }
  n.querySelector('.notice-close').addEventListener('click', function () {
    n.hidden = true;
    try { localStorage.setItem(key, '1'); } catch (e) {}
  });
})();
