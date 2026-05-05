/* ═══════════════════════════════════════
   PENNY WISE — Navigation
   Tab switching between views
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.action-tab[data-view]');
  const views = document.querySelectorAll('.view');

  function switchView(viewId) {
    // Hide all views
    views.forEach(v => v.classList.remove('active'));

    // Deactivate all tabs
    tabs.forEach(t => t.classList.remove('active'));

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }

    // Activate matching tab
    tabs.forEach(t => {
      if (t.dataset.view === viewId) {
        t.classList.add('active');
      }
    });
  }

  // Click handlers for tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchView(tab.dataset.view);
    });
  });

  // Toggle switches (autopay etc.)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle')) {
      e.target.classList.toggle('on');
    }
  });
});
