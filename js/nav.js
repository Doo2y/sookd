// nav.js - Page navigation with HTML partials

const _pageCache = {};

const PAGE_CONFIG = {
  home:      { container: 'container-wide', partial: 'pages/home.html' },
  calc:      { container: 'container',      partial: 'pages/calc.html' },
  foods:     { container: 'container',      partial: 'pages/foods.html' },
  macro:     { container: 'container',      partial: 'pages/macro.html' },
  plan:      { container: 'container-wide', partial: 'pages/plan.html' },
  subscribe: { container: 'container-wide', partial: 'pages/subscribe.html' },
  subcal:    { container: 'container-wide', partial: 'pages/sub-calendar.html' },
  history:   { container: 'container',      partial: 'pages/history.html' },
  activity:  { container: 'container',      partial: 'pages/activity.html' },
  article:   { container: 'container',      partial: 'pages/article.html' },
  about:     { container: 'container',      partial: 'pages/about.html' },
};

async function showPage(name, btn) {
  // ถ้ากำลังแก้เมนูวันใดวันหนึ่งจากปฏิทินสมาชิกอยู่ แล้วผู้ใช้กดออกไปหน้าอื่นโดยไม่ได้กดบันทึก/ยกเลิกเอง
  // ให้ทิ้งการแก้ไขนั้นไปอัตโนมัติ (กันไม่ให้สถานะค้างและสับสน)
  if (typeof _calEditingDate !== 'undefined' && _calEditingDate && name !== 'plan' && name !== 'subcal') {
    if (typeof discardCalDayEdit === 'function') discardCalDayEdit();
  }

  document.querySelectorAll('.subnav-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cfg = PAGE_CONFIG[name] || PAGE_CONFIG['home'];

  let html = _pageCache[cfg.partial];
  if (!html) {
    try {
      const res = await fetch(cfg.partial);
      html = await res.text();
      _pageCache[cfg.partial] = html;
    } catch(e) {
      console.error('Failed to load partial:', cfg.partial, e);
      return;
    }
  }

  const wrapper = document.getElementById('page-content');
  wrapper.className = cfg.container;
  wrapper.innerHTML = html;

  const inits = {
    calc:      () => { syncCalcForm(); updateCalcResults(); },
    foods:     () => { renderFoodsList(); },
    macro:     () => { updateMacroUI(); },
    plan:      () => { renderPlanModeUI(); renderPlan(); updatePlanSummary(); syncMealToggle(); },
    subscribe: () => { initSubscribePage(); },
    subcal:    () => { initSubCalendarPage(); },
    history:   () => { renderHistory(); },
  };

  if (inits[name]) inits[name]();
  state.currentPage = name;
}

function syncCalcForm() {
  const w = document.getElementById('inp-weight');
  const h = document.getElementById('inp-height');
  const a = document.getElementById('inp-age');
  const act = document.getElementById('inp-activity');
  if (w) w.value = state.weight;
  if (h) h.value = state.height;
  if (a) a.value = state.age;
  if (act) act.value = state.activity;
  selectGender(state.gender, true);
  selectGoal(state.goal, true);
}

function syncMealToggle() {
  Object.keys(state.openMeals).forEach(meal => {
    const body = document.getElementById('body-' + meal);
    const chev = document.getElementById('chevron-' + meal);
    if (body) body.style.display = state.openMeals[meal] ? 'block' : 'none';
    if (chev) chev.textContent   = state.openMeals[meal] ? '▼' : '▶';
  });
}
