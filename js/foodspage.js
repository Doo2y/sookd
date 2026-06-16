// ══════════════════════════════════════════════════
//  foodspage.js · Foods List Page Logic
// ══════════════════════════════════════════════════

function renderFoodsList() {
  const search = (document.getElementById('foods-search').value || '').toLowerCase();
  const mealF  = document.getElementById('foods-meal-filter').value;
  const goalF  = document.getElementById('foods-goal-filter').value;

  const mealNames  = { breakfast:'มื้อเช้า', lunch:'มื้อกลางวัน', dinner:'มื้อเย็น', snack:'ของว่าง' };
  const goalColors = { lose:'var(--rose)', muscle:'var(--blue)', healthy:'var(--accent)', balance:'var(--amber)' };
  const goalLabels = { lose:'ลดน้ำหนัก', muscle:'สร้างกล้าม', healthy:'สุขภาพดี', balance:'สมดุล' };

  let filtered = FOODS.filter(f => {
    if (search && !f.name.toLowerCase().includes(search)) return false;
    if (mealF && f.meal !== mealF) return false;
    if (goalF && !f.tags.includes(goalF)) return false;
    return true;
  });

  const container = document.getElementById('foods-list-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div>ไม่พบรายการอาหารที่ตรงกับเงื่อนไข</div>';
    return;
  }

  const groups = {};
  filtered.forEach(f => {
    if (!groups[f.meal]) groups[f.meal] = [];
    groups[f.meal].push(f);
  });

  let html = '';
  ['breakfast','lunch','dinner','snack'].forEach(meal => {
    if (!groups[meal]) return;
    html += `<div class="card" style="margin-bottom:16px">
      <div class="card-title">${mealNames[meal] || meal}</div>
      <div style="display:flex;flex-direction:column;gap:10px">`;
    groups[meal].forEach(f => {
      const tagHtml = f.tags.map(t =>
        `<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:color-mix(in srgb,${goalColors[t]} 15%,transparent);color:${goalColors[t]};border:1px solid color-mix(in srgb,${goalColors[t]} 40%,transparent)">${goalLabels[t]||t}</span>`
      ).join(' ');
      html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);gap:10px">
        <div style="flex:1">
          <div style="font-weight:600;color:var(--text);margin-bottom:4px">${f.name}</div>
          <div style="display:flex;gap:12px;font-size:12px;color:var(--text2);margin-bottom:6px">
            <span>🔥 ${f.cal} kcal</span>
            <span style="color:var(--amber)">คาร์บ ${f.carb}g</span>
            <span style="color:var(--blue)">โปรตีน ${f.prot}g</span>
            <span style="color:var(--rose)">ไขมัน ${f.fat}g</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${tagHtml}</div>
        </div>
        <button class="btn-secondary" style="white-space:nowrap;font-size:13px" onclick="openModal('${f.meal}')">+ เพิ่ม</button>
      </div>`;
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
}
