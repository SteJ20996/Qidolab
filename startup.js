// Hide only unmeasured content, with a fail-open fallback if a module cannot load.
document.documentElement.dataset.orbitPending = 'true';
window.setTimeout(() => { delete document.documentElement.dataset.orbitPending; }, 3000);
