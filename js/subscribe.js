// ══════════════════════════════════════════════════
//  subscribe.js · แพ็กเกจสมัครสมาชิกรับอาหารรายวัน
// ══════════════════════════════════════════════════

const SUB_PLANS = [
  { days: 7,  pricePerMealPerDay: 70, discountPct: 0  },
  { days: 15, pricePerMealPerDay: 63, discountPct: 10 },
  { days: 30, pricePerMealPerDay: 56, discountPct: 20 },
];

const MEAL_LABELS = { breakfast: 'มื้อเช้า', lunch: 'มื้อกลางวัน', dinner: 'มื้อเย็น', snack: 'ของว่าง' };
const MEAL_DOTS   = { breakfast: 'var(--amber)', lunch: 'var(--blue)', dinner: 'var(--purple)', snack: 'var(--rose)' };

function getSelectedMealCount() {
  return Object.values(state.subscription.selectedMeals).filter(Boolean).length;
}

function calcSubTotal(days, mealsPerDay) {
  const plan = SUB_PLANS.find(p => p.days === days) || SUB_PLANS[0];
  return Math.round(plan.pricePerMealPerDay * mealsPerDay * days);
}

function calcSubBaselineTotal(days, mealsPerDay) {
  // เทียบราคาถ้าซื้อแพ็กเกจ 7 วันซ้ำ ๆ จนครบจำนวนวันเท่ากัน (ไม่มีส่วนลด)
  const base = SUB_PLANS[0].pricePerMealPerDay;
  return Math.round(base * mealsPerDay * days);
}

function initSubscribePage() {
  renderMealToggles();
  renderPlanCards();
  updateSubSummary();
  renderActiveSubBanner();

  const dateInput = document.getElementById('sub-start-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 10);
    dateInput.min = minDate;
    dateInput.value = state.subscription.startDateISO || minDate;
    state.subscription.startDateISO = dateInput.value;
  }
}

function renderActiveSubBanner() {
  const el = document.getElementById('sub-active-banner');
  if (!el) return;
  const active = state.subscription.active;
  if (!active) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  const mealNames = Object.keys(active.selectedMeals)
    .filter(m => active.selectedMeals[m])
    .map(m => MEAL_LABELS[m]).join(' · ');
  document.getElementById('sub-active-text').textContent =
    `กำลังใช้แพ็กเกจ ${active.durationDays} วัน (${mealNames}) เริ่ม ${active.startDate}`;
}

function renderMealToggles() {
  const wrap = document.getElementById('sub-meal-toggles');
  if (!wrap) return;
  wrap.innerHTML = Object.keys(MEAL_LABELS).map(meal => {
    const selected = state.subscription.selectedMeals[meal];
    return `
      <div class="sub-meal-toggle ${selected ? 'selected' : ''}" onclick="toggleSubMeal('${meal}')">
        <span class="sub-meal-dot" style="background:${MEAL_DOTS[meal]}"></span>
        <span class="sub-meal-name">${MEAL_LABELS[meal]}</span>
      </div>
    `;
  }).join('');
}

function toggleSubMeal(meal) {
  const sel = state.subscription.selectedMeals;
  const activeCount = Object.values(sel).filter(Boolean).length;
  if (sel[meal] && activeCount === 1) {
    showToast('–', 'ต้องเลือกอย่างน้อย 1 มื้อ');
    return;
  }
  sel[meal] = !sel[meal];
  renderMealToggles();
  renderPlanCards();
  updateSubSummary();
  persistState();
}

function renderPlanCards() {
  const wrap = document.getElementById('sub-plan-cards');
  if (!wrap) return;
  const mealsPerDay = getSelectedMealCount();

  wrap.innerHTML = SUB_PLANS.map(p => {
    const total    = calcSubTotal(p.days, mealsPerDay);
    const perDay   = Math.round(total / p.days);
    const selected = state.subscription.durationDays === p.days;
    const best     = p.days === 30;
    return `
      <div class="sub-plan-card ${selected ? 'selected' : ''}" onclick="selectSubPlan(${p.days})">
        ${best ? '<div class="sub-best-badge">คุ้มที่สุด</div>' : ''}
        <div class="sub-plan-days">${p.days} วัน</div>
        ${p.discountPct > 0 ? `<div class="sub-plan-discount">ลด ${p.discountPct}%</div>` : '<div class="sub-plan-discount sub-plan-discount--none">ราคาปกติ</div>'}
        <div class="sub-plan-perday">${perDay.toLocaleString()} <span>บาท/วัน</span></div>
        <div class="sub-plan-total">รวม ${total.toLocaleString()} บาท</div>
      </div>
    `;
  }).join('');
}

function selectSubPlan(days) {
  state.subscription.durationDays = days;
  renderPlanCards();
  updateSubSummary();
  persistState();
}

function updateSubSummary() {
  const totalEl = document.getElementById('sub-summary-total');
  if (!totalEl) return;

  const days        = state.subscription.durationDays;
  const mealsPerDay = getSelectedMealCount();
  const total       = calcSubTotal(days, mealsPerDay);
  const baseline    = calcSubBaselineTotal(days, mealsPerDay);
  const savings     = baseline - total;

  document.getElementById('sub-summary-days').textContent  = days + ' วัน';
  document.getElementById('sub-summary-meals').textContent = mealsPerDay + ' มื้อ/วัน';
  document.getElementById('sub-summary-total').textContent = total.toLocaleString() + ' บาท';

  const savingsEl = document.getElementById('sub-summary-savings');
  if (savings > 0) {
    savingsEl.style.display = 'block';
    savingsEl.textContent = `ประหยัด ${savings.toLocaleString()} บาท เทียบกับซื้อแพ็กเกจ 7 วันซ้ำ ๆ`;
  } else {
    savingsEl.style.display = 'none';
  }
}

function cancelSubscription() {
  if (!state.subscription.active) return;
  const ok = confirm('ยืนยันยกเลิกแพ็กเกจสมาชิก? เมนูล่วงหน้าที่ตั้งไว้ในปฏิทินจะถูกล้างทั้งหมด และจะไม่มีการเรียกเก็บเงินรอบต่อไป');
  if (!ok) return;

  state.subscription.active = null;
  state.subCalendar = {};
  persistState();

  renderActiveSubBanner();
  if (typeof renderPlanSubBanner === 'function') renderPlanSubBanner();
  showToast('–', 'ยกเลิกสมาชิกแล้ว');

  if (state.currentPage === 'subcal') {
    const subTab = Array.from(document.querySelectorAll('.subnav-tab'))
      .find(t => t.textContent.trim() === 'สมัครสมาชิก');
    showPage('subscribe', subTab || null);
  }
}

async function confirmSubscribe() {
  const mealsPerDay = getSelectedMealCount();
  if (mealsPerDay === 0) {
    showToast('–', 'กรุณาเลือกมื้ออาหารอย่างน้อย 1 มื้อ');
    return;
  }

  const dateInput = document.getElementById('sub-start-date');
  const startDateISO = (dateInput && dateInput.value) || new Date().toISOString().slice(0, 10);

  const days  = state.subscription.durationDays;
  const total = calcSubTotal(days, mealsPerDay);
  const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

  state.subscription.active = {
    durationDays: days,
    selectedMeals: { ...state.subscription.selectedMeals },
    mealsPerDay,
    totalPrice: total,
    startDate: today,
    startDateISO,
  };
  persistState();
  renderActiveSubBanner();
  showToast('✓', `สมัครแพ็กเกจ ${days} วันสำเร็จ ยอดรวม ${total.toLocaleString()} บาท`);

  // พาไปตั้งเมนูล่วงหน้าทันที
  const calTab = Array.from(document.querySelectorAll('.subnav-tab')).find(t => t.textContent.trim() === 'ปฏิทินเมนู');
  await showPage('subcal', calTab || null);
}

async function goToSubscribeWithPlan() {
  const mealsWithFood = {};
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(m => {
    mealsWithFood[m] = state.plan[m].length > 0;
  });
  const anySelected = Object.values(mealsWithFood).some(Boolean);
  state.subscription.selectedMeals = anySelected
    ? mealsWithFood
    : { breakfast: true, lunch: true, dinner: true, snack: false };

  persistState();
  const subTab = Array.from(document.querySelectorAll('.subnav-tab'))
    .find(t => t.textContent.trim() === 'สมัครสมาชิก');
  await showPage('subscribe', subTab || null);
}
