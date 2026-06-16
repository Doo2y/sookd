// ══════════════════════════════════════════════════
//  main.js · App Entry Point
// ══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  // โหลด state จาก localStorage ก่อน
  const saved = localStorage.getItem('sookd_state');
  if (saved) {
    Object.assign(state, JSON.parse(saved));
  }

  // โหลด food modal ไว้เป็น overlay แยกต่างหาก
  const modalRes  = await fetch('pages/modal.html');
  const modalHtml = await modalRes.text();
  document.getElementById('food-modal').innerHTML = modalHtml;

  // โหลดหน้าแรก (home) — ไม่ใช่ calc
  const homeBtn = document.querySelector('.subnav-tab[data-page="home"]');
  await showPage('home', homeBtn);
});
