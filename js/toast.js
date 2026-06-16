// ══════════════════════════════════════════════════
//  toast.js · Toast Notification Utility
// ══════════════════════════════════════════════════

let toastTimer = null;

function showToast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent  = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
