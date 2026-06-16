// ══════════════════════════════════════════════════
//  modal.js · Food Search Modal
// ══════════════════════════════════════════════════

function openModal(meal) {
  state.currentMeal = meal;
  const labels = { breakfast:'มื้อเช้า', lunch:'มื้อกลางวัน', dinner:'มื้อเย็น', snack:'ของว่าง' };
  document.getElementById('modal-title').textContent = 'เพิ่ม' + labels[meal];
  document.getElementById('modal-search-input').value = '';
  renderModalFoods('');
  document.getElementById('food-modal').classList.add('open');
  setTimeout(() => document.getElementById('modal-search-input').focus(), 200);
}

function closeModal() {
  document.getElementById('food-modal').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('food-modal')) closeModal();
}

function filterFoods() {
  const q = document.getElementById('modal-search-input').value.toLowerCase();
  renderModalFoods(q);
}

function renderModalFoods(query) {
  const meal = state.currentMeal;
  const goal = state.goal;
  let pool = FOODS.filter(f => f.meal === meal && f.name.toLowerCase().includes(query));
  pool.sort((a, b) => (b.tags.includes(goal) ? 1 : 0) - (a.tags.includes(goal) ? 1 : 0));

  const tagLabel = { lose:'แคลต่ำ', muscle:'โปรตีนสูง', healthy:'สุขภาพดี', balance:'ขับถ่ายดี' };
  const tagClass = { lose:'tag-green', muscle:'tag-blue', healthy:'tag-amber', balance:'tag-purple' };

  document.getElementById('modal-food-list').innerHTML = pool.length === 0
    ? `<div class="empty-state" style="padding:40px 0"><div class="empty-state-icon">—</div>ไม่พบเมนูที่ตรงกัน</div>`
    : pool.map(f => {
        const isRec = f.tags.includes(goal);
        const tags  = f.tags.map(t => `<span class="tag ${tagClass[t]}">${tagLabel[t]}</span>`).join('');
        return `
          <div class="food-card ${isRec ? 'recommended' : ''}" onclick="addFood(${f.id})">
            ${isRec ? `<div class="rec-badge">แนะนำสำหรับเป้าหมายของคุณ</div>` : ''}
            <div class="food-card-top">
              <div class="food-card-name">${f.name}</div>
              <div class="food-card-kcal">${f.cal} kcal</div>
            </div>
            <div class="food-card-macros">คาร์บ ${f.carb}g · โปรตีน ${f.prot}g · ไขมัน ${f.fat}g</div>
            <div class="food-card-tags">${tags}</div>
          </div>
        `;
      }).join('');
}

function addFood(id) {
  const food = FOODS.find(f => f.id === id);
  if (!food) return;
  state.plan[state.currentMeal].push({ ...food });
  renderPlan();
  persistState();
  closeModal();
  showToast('✓', `เพิ่ม "${food.name}" แล้ว`);
}
