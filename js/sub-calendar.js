// ══════════════════════════════════════════════════
//  sub-calendar.js · ปฏิทินเมนูล่วงหน้าของแพ็กเกจสมาชิก
//  ผูกแผนอาหารแต่ละวันเข้ากับวันที่ปฏิทินจริง (ISO date)
// ══════════════════════════════════════════════════

const CAL_MEAL_LABELS = { breakfast: 'มื้อเช้า', lunch: 'มื้อกลางวัน', dinner: 'มื้อเย็น', snack: 'ของว่าง' };
const CAL_MEAL_DOTS   = { breakfast: 'var(--amber)', lunch: 'var(--blue)', dinner: 'var(--purple)', snack: 'var(--rose)' };
const CAL_DOW_LABELS  = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

function ensureSubCalendar() {
  const active = state.subscription.active;
  if (!active || !active.startDateISO) return;

  for (let i = 0; i < active.durationDays; i++) {
    const dateKey = addDays(active.startDateISO, i);
    if (!state.subCalendar[dateKey]) {
      state.subCalendar[dateKey] = { breakfast: [], lunch: [], dinner: [], snack: [], skipped: false };
    }
  }
  persistState();
}

function getActiveDateRange() {
  const active = state.subscription.active;
  if (!active || !active.startDateISO) return [];
  const dates = [];
  for (let i = 0; i < active.durationDays; i++) dates.push(addDays(active.startDateISO, i));
  return dates;
}

function initSubCalendarPage() {
  if (!state.subscription.active) {
    showToast('–', 'กรุณาสมัครสมาชิกก่อนตั้งเมนูล่วงหน้า');
    const subTab = Array.from(document.querySelectorAll('.subnav-tab')).find(t => t.textContent.trim() === 'สมัครสมาชิก');
    showPage('subscribe', subTab || null);
    return;
  }
  ensureSubCalendar();
  renderSubCalendar();
}

function renderSubCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const dates = getActiveDateRange();
  const today = isoDate(new Date());
  const active = state.subscription.active;
  const selectedMeals = Object.keys(active.selectedMeals).filter(m => active.selectedMeals[m]);

  const rangeLabel = dates.length
    ? `${formatThaiDate(dates[0])} – ${formatThaiDate(dates[dates.length - 1])} · ${dates.length} วัน`
    : '';
  const rangeEl = document.getElementById('cal-range-sub');
  if (rangeEl) rangeEl.textContent = rangeLabel;

  grid.innerHTML = dates.map(dateKey => {
    const day = state.subCalendar[dateKey] || { breakfast: [], lunch: [], dinner: [], snack: [], skipped: false };
    const d = new Date(dateKey + 'T00:00:00');
    const isToday = dateKey === today;

    const mealsHtml = selectedMeals.map(meal => {
      const items = day[meal] || [];
      const names = items.map(f => f.name).join(', ');
      return `
        <div class="cal-meal-row">
          <span class="cal-meal-dot" style="background:${CAL_MEAL_DOTS[meal]}"></span>
          <span class="cal-meal-name">${names || `<span class="cal-meal-empty">ยังไม่เลือก${CAL_MEAL_LABELS[meal]}</span>`}</span>
        </div>`;
    }).join('');

    return `
      <div class="cal-day-card ${isToday ? 'is-today' : ''} ${day.skipped ? 'is-skipped' : ''}">
        <div class="cal-day-head">
          <span class="cal-day-num">${d.getDate()}/${d.getMonth() + 1}</span>
          <span class="cal-day-dow">${CAL_DOW_LABELS[d.getDay()]}</span>
        </div>
        ${day.skipped ? '<div class="cal-skip-label">หยุดส่งวันนี้</div>' : `<div class="cal-day-meals">${mealsHtml}</div>`}
        <div class="cal-day-foot">
          <button class="cal-day-btn" onclick="openCalDayEditor('${dateKey}')" ${day.skipped ? 'disabled' : ''}>แก้เมนู</button>
          <button class="cal-day-btn cal-day-btn--skip ${day.skipped ? 'active' : ''}" onclick="toggleSkipDay('${dateKey}')">
            ${day.skipped ? 'เริ่มส่งต่อ' : 'หยุดส่ง'}
          </button>
        </div>
      </div>`;
  }).join('');
}

function formatThaiDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

// สุ่มเมนูให้ทุกวันในรอบสัญญา (เว้นวันที่หยุดส่งไว้)
function calAutoFillAll() {
  const active = state.subscription.active;
  if (!active) return;
  const selectedMeals = Object.keys(active.selectedMeals).filter(m => active.selectedMeals[m]);

  getActiveDateRange().forEach(dateKey => {
    const day = state.subCalendar[dateKey];
    if (!day || day.skipped) return;
    selectedMeals.forEach(meal => {
      const pool = FOODS.filter(f => f.meal === meal);
      if (pool.length === 0) return;
      day[meal] = [{ ...pool[Math.floor(Math.random() * pool.length)] }];
    });
  });
  renderSubCalendar();
  persistState();
  showToast('✓', 'สุ่มเมนูให้ทุกวันแล้ว');
}

// คัดลอกเมนูของวันแรกไปใช้ซ้ำทุกวัน (เว้นวันที่หยุดส่งไว้)
function calRepeatFirstDay() {
  const dates = getActiveDateRange();
  if (dates.length === 0) return;
  const firstDay = state.subCalendar[dates[0]];
  if (!firstDay) return;

  const hasAny = ['breakfast', 'lunch', 'dinner', 'snack'].some(m => (firstDay[m] || []).length > 0);
  if (!hasAny) {
    showToast('–', 'กรุณาตั้งเมนูวันแรกก่อน');
    return;
  }

  dates.slice(1).forEach(dateKey => {
    const day = state.subCalendar[dateKey];
    if (!day || day.skipped) return;
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(m => {
      day[m] = firstDay[m].map(f => ({ ...f }));
    });
  });
  renderSubCalendar();
  persistState();
  showToast('✓', 'ใช้เมนูวันแรกซ้ำทุกวันแล้ว');
}

// สลับสถานะหยุดส่ง/กลับมาส่งของวันนั้น
function toggleSkipDay(dateKey) {
  const day = state.subCalendar[dateKey];
  if (!day) return;
  day.skipped = !day.skipped;
  renderSubCalendar();
  persistState();
  showToast(day.skipped ? '–' : '✓', day.skipped ? 'หยุดส่งวันนี้แล้ว' : 'เริ่มส่งวันนี้ต่อแล้ว');
}

// แก้เมนูของวันที่เลือก — พาไปแก้ที่หน้า "แผนอาหาร" โดยตรง (ใช้ระบบเพิ่ม/ลบ/สลับอาหารเดิมทั้งหมด)
// ทำงานกับ "สำเนา" ของวันนั้นก่อน จะเขียนกลับเข้าปฏิทินจริงตอนกด "บันทึก" เท่านั้น
let _calEditingDate = null;
let _planBeforeCalEdit = null; // เก็บ reference แผน "วันนี้" ของผู้ใช้ไว้ชั่วคราว เพื่อคืนกลับตอนออกจากการแก้ไข

async function openCalDayEditor(dateKey) {
  _calEditingDate = dateKey;
  if (!state.subCalendar[dateKey]) {
    state.subCalendar[dateKey] = { breakfast: [], lunch: [], dinner: [], snack: [], skipped: false };
  }

  _planBeforeCalEdit = state.plan;
  state.plan = JSON.parse(JSON.stringify(state.subCalendar[dateKey])); // แก้บนสำเนา ยังไม่กระทบของจริง

  const planTab = Array.from(document.querySelectorAll('.subnav-tab')).find(t => t.textContent.trim() === 'แผนอาหาร');
  await showPage('plan', planTab || null);
}

// กด "บันทึกและกลับไปปฏิทิน" — เขียนสำเนาที่แก้แล้วกลับเข้าปฏิทินจริง
async function saveCalDayEditAndReturn() {
  if (!_calEditingDate) return;
  const dateKey = _calEditingDate;
  state.subCalendar[dateKey] = state.plan;
  state.plan = _planBeforeCalEdit || { breakfast: [], lunch: [], dinner: [], snack: [] };
  _calEditingDate = null;
  _planBeforeCalEdit = null;
  persistState();
  showToast('✓', `บันทึกเมนูวันที่ ${formatThaiDate(dateKey)} แล้ว`);

  const calTab = Array.from(document.querySelectorAll('.subnav-tab')).find(t => t.textContent.trim() === 'ปฏิทินเมนู');
  await showPage('subcal', calTab || null);
}

// กด "ยกเลิก" — ทิ้งการแก้ไขทั้งหมด (ไม่เขียนกลับเข้าปฏิทิน) แล้วกลับไปหน้าปฏิทิน
async function cancelCalDayEdit() {
  discardCalDayEdit();
  const calTab = Array.from(document.querySelectorAll('.subnav-tab')).find(t => t.textContent.trim() === 'ปฏิทินเมนู');
  await showPage('subcal', calTab || null);
}

// ทิ้งการแก้ไขโดยไม่เปลี่ยนหน้า — ใช้ตอนผู้ใช้กดออกไปหน้าอื่นโดยไม่ได้กดบันทึก (เรียกจาก nav.js)
function discardCalDayEdit() {
  if (!_calEditingDate) return;
  state.plan = _planBeforeCalEdit || state.plan;
  _calEditingDate = null;
  _planBeforeCalEdit = null;
}

// เรียกจาก input[type=date] ในหน้า subscribe
function onSubStartDateChange(dateStr) {
  state.subscription.startDateISO = dateStr;
  persistState();
}
