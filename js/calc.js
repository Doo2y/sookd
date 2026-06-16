// ══════════════════════════════════════════════════
//  calc.js · BMI + Calorie Calculator (Page 1)
// ══════════════════════════════════════════════════

function selectGender(g, silent) {
  state.gender = g;
  const m = document.getElementById('rb-male');
  const f = document.getElementById('rb-female');
  if (m) m.classList.toggle('selected', g === 'male');
  if (f) f.classList.toggle('selected', g === 'female');
  if (!silent) onCalcInput();
}

function selectGoal(g, silent) {
  state.goal = g;
  ['lose', 'healthy', 'muscle', 'balance'].forEach(x => {
    const el = document.getElementById('goal-' + x);
    if (el) el.classList.toggle('selected', x === g);
  });
  if (!silent) onCalcInput();
}

function onCalcInput() {
  state.weight   = parseFloat(document.getElementById('inp-weight').value) || 65;
  state.height   = parseFloat(document.getElementById('inp-height').value) || 170;
  state.age      = parseInt(document.getElementById('inp-age').value) || 25;
  state.activity = parseFloat(document.getElementById('inp-activity').value);
  updateCalcResults();
}

function updateCalcResults() {
  const { weight, height, age, gender, activity, goal } = state;
  if (weight <= 0 || height <= 0 || age <= 0) return;

  const bmi  = weight / ((height / 100) ** 2);
  const bmr  = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
  const tdee = bmr * activity;
  let target = tdee;
  if (goal === 'lose')         target -= 400;
  else if (goal === 'muscle')  target += 300;
  else if (goal === 'balance') target -= 100;

  state.bmr       = Math.round(bmr);
  state.tdee      = Math.round(tdee);
  state.targetCal = Math.round(target);

  let bmiColor = 'var(--accent)', bmiLabel = 'น้ำหนักปกติ', barPct = 0;
  if (bmi < 18.5)    { bmiColor = 'var(--blue)';   bmiLabel = 'น้ำหนักน้อย';         barPct = (bmi / 18.5) * 20; }
  else if (bmi < 23) { bmiColor = 'var(--accent)'; bmiLabel = 'น้ำหนักปกติ';         barPct = 20 + ((bmi - 18.5) / 4.5) * 25; }
  else if (bmi < 25) { bmiColor = 'var(--amber)';  bmiLabel = 'ท้วม / น้ำหนักเกิน'; barPct = 45 + ((bmi - 23) / 2) * 20; }
  else if (bmi < 30) { bmiColor = 'var(--rose)';   bmiLabel = 'อ้วนระดับ 1';         barPct = 65 + ((bmi - 25) / 5) * 25; }
  else               { bmiColor = '#e03c5a';        bmiLabel = 'อ้วนมาก';             barPct = 90; }
  barPct = Math.min(barPct, 100);

  // inline BMI line: "BMI: 21.0 (น้ำหนักปกติ)"
  const bmiEl     = document.getElementById('res-bmi');
  const bmiStatus = document.getElementById('res-bmi-status-inline');
  const bmiBar    = document.getElementById('res-bmi-bar');
  if (bmiEl)     { bmiEl.textContent = bmi.toFixed(1); bmiEl.style.color = bmiColor; }
  if (bmiStatus) bmiStatus.textContent = bmiLabel;
  if (bmiBar)    { bmiBar.style.width = barPct + '%'; bmiBar.style.background = bmiColor; }

  // person icon color hint via CSS filter based on bmi category
  const person = document.querySelector('.bmi-person-icon');
  if (person) {
    person.style.color = bmiColor;
    person.style.filter = bmi < 18.5 ? 'hue-rotate(200deg) saturate(2)'
                        : bmi < 23   ? 'hue-rotate(100deg) saturate(2)'
                        : bmi < 25   ? 'hue-rotate(30deg) saturate(2)'
                        : 'hue-rotate(330deg) saturate(2)';
  }

  // sync macro slider if already loaded
  const calSlider = document.getElementById('macro-cal-slider');
  if (calSlider) calSlider.value = state.targetCal;
  const calVal = document.getElementById('macro-cal-val');
  if (calVal) calVal.textContent = state.targetCal.toLocaleString();

  updateMacroGrams();
  updatePlanSummary();
}

async function applyCalc() {
  onCalcInput();
  persistState();
  showToast('✓', 'บันทึกและตั้งค่าแล้ว');
  // ไปหน้าปรับสัดส่วนโภชนาการ
  await showPage('macro', null);
}
