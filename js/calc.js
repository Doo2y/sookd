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

  // ── BMI Gauge SVG ──
  updateBMIGauge(bmi, bmiColor, bmiLabel, barPct);

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
  const nextSection = document.getElementById('foods'); 
  if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── BMI Gauge: วาด arc + หมุน needle ──
function updateBMIGauge(bmi, color, label, barPct) {
  const cx = 110, cy = 115, r = 90;
  // semi-circle: 180° from left (180°) to right (0°) going counter-clockwise
  // In SVG coords: start at left = 180+90=270° from east... easier to parameterise:
  // angle 0% = -180deg (left), 100% = 0deg (right), center at top = -90deg

  function polarToXY(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // pct → angle: 0%=180° left, 100%=0° right (going CCW from left through top to right)
  function pctToAngle(pct) { return 180 - pct * 1.8; } // 0→180, 100→0

  function arcPath(pct1, pct2) {
    const a1 = pctToAngle(pct1);
    const a2 = pctToAngle(pct2);
    const p1 = polarToXY(a1);
    const p2 = polarToXY(a2);
    // always large-arc=0 since each zone < 90deg
    const large = Math.abs(pct2 - pct1) > 50 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 0 ${p2.x} ${p2.y}`;
  }

  // zone boundaries in pct
  const zones = [
    { id:'bmi-arc-thin',   p1:0,  p2:20 },
    { id:'bmi-arc-normal', p1:20, p2:45 },
    { id:'bmi-arc-chubby', p1:45, p2:65 },
    { id:'bmi-arc-fat',    p1:65, p2:90 },
    { id:'bmi-arc-obese',  p1:90, p2:100},
  ];
  zones.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) el.setAttribute('d', arcPath(z.p1, z.p2));
  });

  // track (full arc, behind zones)
  const track = document.getElementById('bmi-gauge-track');
  if (track) track.setAttribute('d', arcPath(0, 100));

  // needle: pct → rotation around center
  // needle rests pointing UP (−90deg from SVG east = 12 o'clock)
  // we rotate it from there: -90 + barPct*1.8 deg
  const needleAngle = -90 + barPct * 1.8;   // relative to east
  // but SVG rotate() reference is around cx,cy with 0=right
  // our needle element goes from cy to cy-80 (straight up at rotate 0)
  // so at rotate=0 needle points up → pct=50 should rotate 0, pct=0 should rotate -90, pct=100=+90
  const needleRot = (barPct - 50) * 1.8;    // -90 … +90
  const needle = document.getElementById('bmi-needle');
  if (needle) needle.setAttribute('transform', `rotate(${needleRot} ${cx} ${cy})`);

  // update needle color
  if (needle) needle.setAttribute('stroke', color);
  const dot = document.querySelector('#bmi-gauge-svg circle');
  if (dot) dot.setAttribute('fill', color);

  // center text
  const valEl   = document.getElementById('bmi-gauge-val');
  const lblEl   = document.getElementById('bmi-gauge-label');
  if (valEl)  { valEl.textContent = bmi.toFixed(1); valEl.setAttribute('fill', color); }
  if (lblEl)  lblEl.textContent = label;
}
