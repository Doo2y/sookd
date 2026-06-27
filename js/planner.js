// ══════════════════════════════════════════════════
//  planner.js · Meal Planner (วางแผนเมนู "วันนี้" แบบอิสระ)
//  หน้านี้ใช้สำหรับลองจัดเมนูก่อนสมัครสมาชิก — การวางแผนแบบ
//  หลายวันจริง ๆ (ตามรอบแพ็กเกจ) อยู่ที่หน้า "ปฏิทินเมนู" แทน
//  เพื่อไม่ให้ซ้ำซ้อนกัน และรองรับรอบยาว ๆ (15/30 วัน) ได้ดีกว่า
// ══════════════════════════════════════════════════

// แสดง UI ของหน้าแผนอาหารให้ตรงกับโหมดที่ใช้งานอยู่:
// 1) กำลังแก้เมนูวันใดวันหนึ่งจากปฏิทินสมาชิก -> โชว์แบนเนอร์เด่น ๆ พร้อมปุ่มบันทึก/ยกเลิก
// 2) ใช้งานปกติ (วางแผน "วันนี้") -> โชว์แบนเนอร์สถานะสมาชิกแบบเดิม
function renderPlanModeUI() {
  const editBanner = document.getElementById('plan-cal-edit-banner');
  const editDateEl = document.getElementById('plan-cal-edit-date');
  const subBanner  = document.getElementById('plan-sub-banner');
  const cta        = document.getElementById('plan-sub-cta');
  const saveProfileBtn = document.getElementById('plan-save-profile-btn');

  if (typeof _calEditingDate !== 'undefined' && _calEditingDate) {
    // โหมดแก้เมนูจากปฏิทิน — ซ่อนปุ่ม/แบนเนอร์ที่ไม่เกี่ยวกับสมาชิก แล้วโชว์แบนเนอร์แก้ไขแทน
    if (cta) cta.style.display = 'none';
    if (saveProfileBtn) saveProfileBtn.style.display = 'none';
    if (subBanner) { subBanner.style.display = 'none'; subBanner.innerHTML = ''; }

    if (editBanner) {
      editBanner.style.display = 'flex';
      if (editDateEl) {
        const d = new Date(_calEditingDate + 'T00:00:00');
        const dow = (typeof CAL_DOW_LABELS !== 'undefined') ? CAL_DOW_LABELS[d.getDay()] : '';
        editDateEl.textContent = `${dow} ${d.getDate()}/${d.getMonth() + 1}`;
      }
    }
  } else {
    // โหมดปกติ
    if (editBanner) editBanner.style.display = 'none';
    if (cta) cta.style.display = '';
    if (saveProfileBtn) saveProfileBtn.style.display = '';

    if (subBanner) {
      const active = state.subscription.active;
      if (active) {
        subBanner.style.display = 'flex';
        subBanner.innerHTML = `
          <span class="sub-active-dot"></span>
          <span>คุณมีแพ็กเกจสมาชิกอยู่ (${active.durationDays} วัน) — ตั้งเมนูล่วงหน้าทั้งรอบได้ที่ปฏิทินเมนู</span>
          <button class="btn-secondary" style="margin-left:auto" onclick="goToSubCalFromPlan()">ไปที่ปฏิทินเมนู</button>
        `;
        if (cta) { cta.textContent = 'ไปจัดเมนูล่วงหน้า'; cta.onclick = goToSubCalFromPlan; }
      } else {
        subBanner.style.display = 'none';
        subBanner.innerHTML = '';
        if (cta) { cta.textContent = 'สมัครรับแผนนี้เป็นชุด'; cta.onclick = goToSubscribeWithPlan; }
      }
    }
  }
}

async function goToSubCalFromPlan() {
  const calTab = Array.from(document.querySelectorAll('.subnav-tab'))
    .find(t => t.textContent.trim() === 'ปฏิทินเมนู');
  await showPage('subcal', calTab || null);
}

function toggleMeal(meal) {
  state.openMeals[meal] = !state.openMeals[meal];
  const body = document.getElementById('body-' + meal);
  const chev = document.getElementById('chevron-' + meal);
  if (body) body.style.display = state.openMeals[meal] ? 'block' : 'none';
  if (chev) chev.textContent = state.openMeals[meal] ? '▼' : '▶';
}

// ═════ CORE RENDERING ═════

// ═════ CORE RENDERING ═════

function renderPlan() {
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
    const list = document.getElementById('list-' + meal);
    if (!list) return;
    const items = state.plan[meal];
    const labels = { breakfast: 'มื้อเช้า', lunch: 'มื้อกลางวัน', dinner: 'มื้อเย็น', snack: 'ของว่าง' };

    if (items.length === 0) {
      list.innerHTML = `<div class="empty-state">ยังไม่มีรายการ${labels[meal]}</div>`;
    } else {
      list.innerHTML = items.map((f, i) => {
        let ingredientUI = '';
        if (f.ingredients) {
          const allNormal = [...(f.ingredients.base || []), ...(f.ingredients.traditional || [])].join(', ');
          const alts = f.ingredients.alternative || [];

          // แยกส่วนปุ่มเลือก และส่วนสรุปการเปลี่ยน
          ingredientUI = `
            <div class="ingredient-display-box">
              <div class="ing-normal"><span class="ing-title">วัตถุดิบปกติ:</span> ${allNormal}</div>
              ${alts.length > 0 ? `
                <div class="ing-alts">
                  <span class="ing-title">ตัวเลือกปรับสูตร:</span>
                  <div class="alt-pill-group">
                    ${alts.map(alt => {
                      const isSelected = f.selectedAlts && f.selectedAlts.includes(alt.name);
                      return `
                        <label class="alt-pill ${isSelected ? 'selected' : ''}">
                          <input type="checkbox" style="display:none;" ${isSelected ? 'checked' : ''} 
                                 onchange="toggleAlternative('${meal}', ${i}, '${alt.name}', this.checked)">
                          ${alt.name}
                        </label>`;
                    }).join('')}
                  </div>
                  
                  ${f.selectedAlts && f.selectedAlts.length > 0 ? `
                    <div class="summary-changes">
                      ${f.selectedAlts.map(name => {
                        const altObj = alts.find(a => a.name === name);
                        return `<div class="change-item">✓ เปลี่ยนจาก ${altObj?.replaces || 'สูตรปกติ'} เป็น ${name}</div>`;
                      }).join('')}
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }

        return `
        <div class="food-item-card">
          <div class="food-item-main">
            <div class="food-item-info">
              <div class="food-item-name">${f.name}</div>
              <div class="food-item-macros">P ${f.prot}g | C ${f.carb}g | F ${f.fat}g</div>
            </div>
            <div class="food-item-actions">
              <span class="food-kcal" style="font-weight:600; margin-right:12px;">${f.cal} kcal</span>
              <button class="btn-swap-meal" onclick="swapMeal('${meal}', ${i})">สลับ</button>
              <button class="del-btn" onclick="removeFood('${meal}', ${i})">✕</button>
            </div>
          </div>
          ${ingredientUI}
        </div>`;
      }).join('');
    }
    const sub = items.reduce((a, f) => a + f.cal, 0);
    const subEl = document.getElementById('sub-cal-' + meal);
    if (subEl) subEl.textContent = sub + ' kcal';
  });
  updatePlanSummary();
}

function updatePlanSummary() {
  let totalCal = 0, totalCarb = 0, totalProt = 0, totalFat = 0;
  
  // 1. คำนวณผลรวม
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(m => {
    state.plan[m].forEach(f => {
      totalCal += f.cal; totalCarb += f.carb; totalProt += f.prot; totalFat += f.fat;
    });
  });

  const tgt = state.targetCal || 2000;
  const remain = tgt - totalCal;
  const isOver = remain < 0;
  const pct = tgt > 0 ? Math.min(totalCal / tgt, 1) : 0;

  const ringCal = document.getElementById('plan-ring-cal');
  if (ringCal) ringCal.textContent = totalCal;

  const ringRemain = document.getElementById('plan-ring-remain');
  if (ringRemain) ringRemain.textContent = isOver ? `เกินไป ${Math.abs(remain)}` : `เหลืออีก ${remain}`;

  // 2. วาดวงแหวนตามสัดส่วนที่กินจริง และเปลี่ยนสีเมื่อเกินงบ
  const ring = document.getElementById('plan-ring');
  if (ring) {
    const circumference = 376.99;
    ring.style.strokeDashoffset = circumference - circumference * pct;
    ring.setAttribute('stroke', isOver ? 'var(--rose)' : 'var(--accent)');
  }

  // 3. แท่งงบประมาณ + สีตามสถานะ
  const bar = document.getElementById('plan-bar');
  if (bar) {
    bar.style.width = (pct * 100) + '%';
    bar.style.background = isOver ? 'var(--rose)' : 'var(--accent)';
  }

  // 4. ข้อความสถานะ
  const statusText = document.getElementById('plan-status-text');
  if (statusText) {
    if (totalCal === 0) {
      statusText.textContent = 'ยังไม่ได้เลือกเมนู';
    } else if (isOver) {
      statusText.textContent = `เกินงบประมาณไป ${Math.abs(remain)} kcal`;
    } else {
      statusText.textContent = `เหลืออีก ${remain} kcal`;
    }
  }

  const currCalEl = document.getElementById('plan-curr-cal');
  if (currCalEl) currCalEl.textContent = totalCal;
  const tgtCalEl = document.getElementById('plan-tgt-cal');
  if (tgtCalEl) tgtCalEl.textContent = '/ ' + tgt + ' kcal';
  const carbEl = document.getElementById('plan-carb');
  if (carbEl) carbEl.textContent = `${totalCarb}g / ${state.carbG || 253}g`;
  const protEl = document.getElementById('plan-prot');
  if (protEl) protEl.textContent = `${totalProt}g / ${state.protG || 126}g`;
  const fatEl = document.getElementById('plan-fat');
  if (fatEl) fatEl.textContent = `${totalFat}g / ${state.fatG || 56}g`;
}

// ═════ ACTIONS ═════

function toggleAlternative(meal, itemIndex, altName, isChecked) {
  const food = state.plan[meal][itemIndex];
  if (!food.selectedAlts) food.selectedAlts = [];

  if (isChecked) {
    if (!food.selectedAlts.includes(altName)) food.selectedAlts.push(altName);
  } else {
    food.selectedAlts = food.selectedAlts.filter(a => a !== altName);
  }

  if (!food.baseStats) {
    food.baseStats = { cal: food.cal, carb: food.carb, prot: food.prot, fat: food.fat };
  }

  let { cal, carb, prot, fat } = food.baseStats;
  food.selectedAlts.forEach(name => {
    const diff = INGREDIENT_DIFF_DB[name];
    if (diff) {
      cal += diff.cal; carb += diff.carb; prot += diff.prot; fat += diff.fat;
    }
  });

  food.cal = Math.round(Math.max(0, cal));
  food.carb = Math.round(Math.max(0, carb));
  food.prot = Math.round(Math.max(0, prot));
  food.fat = Math.round(Math.max(0, fat));

  renderPlan();
  persistState();
}

// จัดเซ็ตเมนูอัตโนมัติ — สุ่มอาหารใส่ทุกมื้อที่ยังว่างของวันที่กำลังดูอยู่
function autoFill() {
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
    if (state.plan[meal].length > 0) return; // ไม่ทับมื้อที่เลือกไว้แล้ว
    const pool = FOODS.filter(f => f.meal === meal);
    if (pool.length === 0) return;
    const pick = { ...pool[Math.floor(Math.random() * pool.length)] };
    state.plan[meal].push(pick);
  });
  renderPlan();
  persistState();
  showToast('✓', 'จัดเซ็ตเมนูอัตโนมัติแล้ว');
}

// ล้างทั้งหมด — เคลียร์ทุกมื้อของวันที่กำลังดูอยู่
function clearPlan() {
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
    state.plan[meal] = [];
  });
  renderPlan();
  persistState();
  showToast('–', 'ล้างแผนอาหารวันนี้แล้ว');
}

// บันทึกเมนู — เก็บแผนปัจจุบันแล้วพาไปหน้าโปรไฟล์
async function saveAndGoToProfile() {
  const totalItems = ['breakfast','lunch','dinner','snack']
    .reduce((sum, m) => sum + (state.plan[m] ? state.plan[m].length : 0), 0);
  if (totalItems === 0) {
    showToast('⚠️', 'ยังไม่มีรายการอาหาร กรุณาเพิ่มเมนูก่อนบันทึก');
    return;
  }
  // บันทึกประวัติรายวันด้วย
  const today = new Date().toISOString().slice(0, 10);
  if (!state.history) state.history = [];
  const existingIdx = state.history.findIndex(h => h.date === today);
  const snapshot = {
    date: today,
    plan: JSON.parse(JSON.stringify(state.plan)),
    totalKcal: state.totalKcal || 0,
  };
  if (existingIdx >= 0) {
    state.history[existingIdx] = snapshot;
  } else {
    state.history.unshift(snapshot);
  }
  persistState();
  showToast('✓', `บันทึกเมนูวันนี้แล้ว (${totalItems} รายการ)`);
}

function removeFood(meal, idx) {
  state.plan[meal].splice(idx, 1);
  renderPlan();
  persistState();
}

function swapMeal(meal, idx) {
  const currentFood = state.plan[meal][idx];
  const pool = FOODS.filter(f => f.meal === meal && f.name !== currentFood.name);
  if (pool.length > 0) {
    const newFood = { ...pool[Math.floor(Math.random() * pool.length)] };
    state.plan[meal][idx] = newFood;
    
    renderPlan();
    persistState();
  }
}