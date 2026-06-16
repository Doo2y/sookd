// ══════════════════════════════════════════════════
//  state.js · Global state & persistence
// ══════════════════════════════════════════════════

let state = {
  gender: 'male',
  weight: 65, height: 170, age: 25,
  activity: 1.55,
  goal: 'muscle',
  bmr: 0, tdee: 0, targetCal: 0,
  macros: { carb: 40, prot: 35, fat: 25 },
  carbG: 0, protG: 0, fatG: 0,
  plan: { breakfast: [], lunch: [], dinner: [], snack: [] },
  openMeals: { breakfast: true, lunch: true, dinner: true, snack: true },
  currentMeal: '',
  currentPage: 'calc',
};

function persistState() {
  localStorage.setItem('sookd_state', JSON.stringify(state));
}
