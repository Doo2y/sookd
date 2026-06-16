// ══════════════════════════════════════════════════
//  macro.js · Macro Nutrient Planner (Page 2)
// ══════════════════════════════════════════════════

function nudgeCal(delta) {
  const cur  = parseInt(document.getElementById('macro-cal-slider').value);
  const next = Math.max(1000, Math.min(4000, cur + delta));
  document.getElementById('macro-cal-slider').value = next;
  onCalSlider(next);
}

function onCalSlider(val) {
  state.targetCal = parseInt(val);
  document.getElementById('macro-cal-val').textContent   = parseInt(val).toLocaleString();
  document.getElementById('ring-cal-center').textContent = parseInt(val).toLocaleString();
  updateMacroGrams();
  updatePlanSummary();
}

function resetCalToTDEE() {
  const v = state.tdee || 2000;
  state.targetCal = v;
  document.getElementById('macro-cal-slider').value      = v;
  document.getElementById('macro-cal-val').textContent   = v.toLocaleString();
  document.getElementById('ring-cal-center').textContent = v.toLocaleString();
  updateMacroGrams();
}

function onMacroSlider(changed) {
  let c = parseInt(document.getElementById('sl-carb').value);
  let p = parseInt(document.getElementById('sl-prot').value);
  let f = parseInt(document.getElementById('sl-fat').value);
  const diff = 100 - (c + p + f);
  if (diff !== 0) {
    if (changed === 'carb')       f = Math.max(10, f + diff);
    else if (changed === 'prot')  c = Math.max(10, c + diff);
    else                          c = Math.max(10, c + diff);
  }
  document.getElementById('sl-carb').value = c;
  document.getElementById('sl-prot').value = p;
  document.getElementById('sl-fat').value  = f;
  state.macros = { carb: c, prot: p, fat: f };
  updateMacroUI();
}

function updateMacroGrams() {
  const cal = state.targetCal || 2000;
  const { carb, prot, fat } = state.macros;
  state.carbG = Math.round((cal * carb / 100) / 4);
  state.protG = Math.round((cal * prot / 100) / 4);
  state.fatG  = Math.round((cal * fat  / 100) / 9);
  updateMacroUI();
}

function updateMacroUI() {
  // ถ้าไม่ได้อยู่หน้า macro DOM จะไม่มี element — ออกได้เลย
  if (!document.getElementById('sl-carb')) return;
  const { carb, prot, fat } = state.macros;
  const cal = state.targetCal || 2000;
  state.carbG = Math.round((cal * carb / 100) / 4);
  state.protG = Math.round((cal * prot / 100) / 4);
  state.fatG  = Math.round((cal * fat  / 100) / 9);
  const total = carb + prot + fat;

  document.getElementById('sl-carb').value = carb;
  document.getElementById('sl-prot').value = prot;
  document.getElementById('sl-fat').value  = fat;
  document.getElementById('sl-carb').style.setProperty('--pct', carb + '%');
  document.getElementById('sl-prot').style.setProperty('--pct', prot + '%');
  document.getElementById('sl-fat').style.setProperty('--pct', fat + '%');

  document.getElementById('m-carb-g').textContent   = state.carbG + 'g';
  document.getElementById('m-prot-g').textContent   = state.protG + 'g';
  document.getElementById('m-fat-g').textContent    = state.fatG  + 'g';
  document.getElementById('m-carb-pct').textContent = ' ' + carb + '%';
  document.getElementById('m-prot-pct').textContent = ' ' + prot + '%';
  document.getElementById('m-fat-pct').textContent  = ' ' + fat  + '%';
  document.getElementById('m-total-pct').textContent = total + '%';
  document.getElementById('m-note').textContent     = total === 100 ? 'สัดส่วนสมบูรณ์' : `ยังเหลืออีก ${100 - total}%`;

  // Donut ring
  const circ    = 439.82;
  const carbArc = circ * (carb / 100);
  const protArc = circ * (prot / 100);
  const fatArc  = circ * (fat  / 100);
  document.getElementById('ring-carb').setAttribute('stroke-dashoffset', circ - carbArc);
  document.getElementById('ring-prot').setAttribute('stroke-dashoffset', circ - protArc);
  document.getElementById('ring-fat').setAttribute('stroke-dashoffset',  circ - fatArc);

  const carbDeg = -90;
  const protDeg = -90 + (carb / 100 * 360);
  const fatDeg  = -90 + ((carb + prot) / 100 * 360);
  document.getElementById('ring-carb').setAttribute('transform', `rotate(${carbDeg} 90 90)`);
  document.getElementById('ring-prot').setAttribute('transform', `rotate(${protDeg} 90 90)`);
  document.getElementById('ring-fat').setAttribute('transform',  `rotate(${fatDeg} 90 90)`);

  document.getElementById('pill-carb').textContent = `${carb}% · ${state.carbG}g`;
  document.getElementById('pill-prot').textContent = `${prot}% · ${state.protG}g`;
  document.getElementById('pill-fat').textContent  = `${fat}%  · ${state.fatG}g`;

  updatePlanSummary();
}

function setPreset(name) {
  const presets = {
    lose:     { carb: 35, prot: 40, fat: 25 },
    muscle:   { carb: 40, prot: 35, fat: 25 },
    keto:     { carb: 10, prot: 25, fat: 65 },
    balanced: { carb: 50, prot: 25, fat: 25 },
  };
  state.macros = { ...presets[name] };
  updateMacroUI();
  const labels = { lose:'ลดไขมัน', muscle:'สร้างกล้าม', keto:'คีโต', balanced:'สมดุล' };
  showToast('✓', 'ตั้ง Preset: ' + labels[name]);
}

async function applyMacro() {
  persistState();
  showToast('✓', 'บันทึก Macro เรียบร้อย');
  // ไปหน้าแผนอาหาร
  await showPage('plan', null);
}
