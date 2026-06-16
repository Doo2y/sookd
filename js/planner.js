// ══════════════════════════════════════════════════
//  planner.js · Meal Planner (Page 3)
// ══════════════════════════════════════════════════

function toggleMeal(meal) {
  state.openMeals[meal] = !state.openMeals[meal];
  const body = document.getElementById('body-' + meal);
  const chev = document.getElementById('chevron-' + meal);
  body.style.display = state.openMeals[meal] ? 'block' : 'none';
  chev.textContent   = state.openMeals[meal] ? '▼' : '▶';
}

function renderPlan() {
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
    const list  = document.getElementById('list-' + meal);
    const items = state.plan[meal];
    const labels = { breakfast:'มื้อเช้า', lunch:'มื้อกลางวัน', dinner:'มื้อเย็น', snack:'ของว่าง' };

    if (items.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">—</div>ยังไม่มีรายการ${labels[meal]}</div>`;
    } else {
      list.innerHTML = items.map((f, i) => `
        <div class="food-item-row">
          <div>
            <div class="food-item-name">${f.name}</div>
            <div class="food-item-macros">คาร์บ ${f.carb}g · โปรตีน ${f.prot}g · ไขมัน ${f.fat}g</div>
          </div>
          <div class="food-item-right">
            <span class="food-kcal">${f.cal} kcal</span>
            <button class="del-btn" onclick="removeFood('${meal}',${i})">✕</button>
          </div>
        </div>
      `).join('');
    }

    const sub = items.reduce((a, f) => a + f.cal, 0);
    document.getElementById('sub-cal-' + meal).textContent = sub + ' kcal';
  });
  updatePlanSummary();
}

function updatePlanSummary() {
  if (!document.getElementById('plan-curr-cal')) return;
  let totalCal = 0, totalCarb = 0, totalProt = 0, totalFat = 0;
  ['breakfast','lunch','dinner','snack'].forEach(m => {
    state.plan[m].forEach(f => { totalCal += f.cal; totalCarb += f.carb; totalProt += f.prot; totalFat += f.fat; });
  });
  const tgt    = state.targetCal || 2000;
  const pct    = Math.min((totalCal / tgt) * 100, 100);
  const remain = tgt - totalCal;

  document.getElementById('plan-curr-cal').textContent    = totalCal.toLocaleString() + ' kcal';
  document.getElementById('plan-tgt-cal').textContent     = '/ ' + tgt.toLocaleString() + ' kcal';
  document.getElementById('plan-ring-cal').textContent    = totalCal.toLocaleString();
  document.getElementById('plan-ring-remain').textContent = remain >= 0
    ? 'เหลืออีก ' + remain + ' kcal'
    : 'เกิน ' + Math.abs(remain) + ' kcal';

  const bar = document.getElementById('plan-bar');
  bar.style.width      = pct + '%';
  bar.style.background = totalCal > tgt ? 'var(--rose)' : 'var(--accent)';

  const ring = document.getElementById('plan-ring');
  const circ = 376.99;
  ring.setAttribute('stroke-dashoffset', circ - (circ * pct / 100));
  ring.setAttribute('stroke', totalCal > tgt ? 'var(--rose)' : 'var(--accent)');

  const statusEl = document.getElementById('plan-status-text');
  if (totalCal === 0) {
    statusEl.textContent = 'ยังไม่ได้เลือกเมนู';
  } else if (totalCal > tgt) {
    statusEl.innerHTML = `<span style="color:var(--rose)">พลังงานเกินเป้าหมาย</span>`;
  } else {
    statusEl.innerHTML = `<span style="color:var(--accent)">เหลือ ${remain} kcal</span>`;
  }

  document.getElementById('plan-carb').textContent = `${totalCarb}g / ${state.carbG || 283}g`;
  document.getElementById('plan-prot').textContent = `${totalProt}g / ${state.protG || 247}g`;
  document.getElementById('plan-fat').textContent  = `${totalFat}g / ${state.fatG  || 78}g`;
}

function removeFood(meal, idx) {
  state.plan[meal].splice(idx, 1);
  renderPlan();
  persistState();
}

function clearPlan() {
  if (!confirm('ล้างแผนอาหารทั้งหมด?')) return;
  state.plan = { breakfast: [], lunch: [], dinner: [], snack: [] };
  renderPlan();
  persistState();
  showToast('✓', 'ล้างแผนอาหารแล้ว');
}

function autoFill() {
  state.plan = { breakfast: [], lunch: [], dinner: [], snack: [] };
  const goal = state.goal;
  ['breakfast','lunch','dinner','snack'].forEach(meal => {
    const pool    = FOODS.filter(f => f.meal === meal);
    const matched = pool.filter(f => f.tags.includes(goal));
    const pick    = matched.length > 0 ? matched : pool;
    const rand    = pick[Math.floor(Math.random() * pick.length)];
    if (rand) state.plan[meal].push({ ...rand });
  });
  renderPlan();
  persistState();
  showToast('✓', 'จัดเซ็ตเมนูอัตโนมัติแล้ว');
}
