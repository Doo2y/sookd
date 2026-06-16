// ══════════════════════════════════════════════════
//  nav.js · Page navigation with HTML partials
// ══════════════════════════════════════════════════

const _pageCache = {};

const PAGE_CONFIG = {
  home:       { container: 'container',      partial: 'pages/home.html' },
  calc:       { container: 'container',      partial: 'pages/calc.html' },
  foods:      { container: 'container',      partial: 'pages/foods.html' },
  macro:      { container: 'container',      partial: 'pages/macro.html' },
  plan:       { container: 'container-wide', partial: 'pages/plan.html' },
  history:    { container: 'container',      partial: 'pages/history.html' },
  activities: { container: 'container',      partial: 'pages/activities.html' },
  articles:   { container: 'container',      partial: 'pages/articles.html' },
  about:      { container: 'container',      partial: 'pages/about.html' },
};

async function showPage(name, btn) {
  // อัปเดต subnav active tab
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
    calc:    () => { syncCalcForm(); updateCalcResults(); },
    foods:   () => { renderFoodsList(); },
    macro:   () => { updateMacroUI(); },
    plan:    () => { renderPlan(); updatePlanSummary(); syncMealToggle(); },
    history: () => { renderHistory(); },
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
