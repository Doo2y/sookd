// ══════════════════════════════════════════════════
//  history.js · Daily History (Page 4)
// ══════════════════════════════════════════════════

function saveDay() {
  const history = JSON.parse(localStorage.getItem('sookd_history') || '[]');
  let totalCal = 0, totalCarb = 0, totalProt = 0, totalFat = 0;
  ['breakfast','lunch','dinner','snack'].forEach(m => {
    state.plan[m].forEach(f => { totalCal += f.cal; totalCarb += f.carb; totalProt += f.prot; totalFat += f.fat; });
  });
  if (totalCal === 0) { showToast('–', 'ยังไม่มีอาหารในแผน'); return; }

  const today = new Date().toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' });
  const entry = { date: today, ts: Date.now(), cal: totalCal, carb: totalCarb, prot: totalProt, fat: totalFat };
  const filtered = history.filter(h => h.date !== today);
  filtered.unshift(entry);
  localStorage.setItem('sookd_history', JSON.stringify(filtered.slice(0, 30)));
  renderHistory();
  persistState();
  showToast('✓', 'บันทึกข้อมูลวันนี้แล้ว');
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('sookd_history') || '[]');
  const el = document.getElementById('history-list');

  if (history.length === 0) {
    el.innerHTML = `<div class="empty-state" style="padding:40px 0"><div class="empty-state-icon">—</div>ยังไม่มีประวัติ กด "บันทึกวันนี้" เพื่อเริ่มต้น</div>`;
    document.getElementById('hist-days').textContent = '0';
    document.getElementById('hist-avg').innerHTML    = '–<span class="s-unit">kcal</span>';
    document.getElementById('hist-max').innerHTML    = '–<span class="s-unit">kcal</span>';
    return;
  }

  el.innerHTML = history.map((h, i) => `
    <div class="history-row">
      <div>
        <div class="history-date">${h.date}</div>
        <div class="history-meta">คาร์บ ${h.carb}g · โปรตีน ${h.prot}g · ไขมัน ${h.fat}g</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="text-align:right">
          <div class="history-kcal" style="color:var(--accent)">${h.cal.toLocaleString()}</div>
          <div style="font-size:11px;color:var(--text3)">kcal</div>
        </div>
        <button class="del-history-btn" onclick="deleteHistory(${i})">✕</button>
      </div>
    </div>
  `).join('');

  const total = history.reduce((a, h) => a + h.cal, 0);
  const max   = Math.max(...history.map(h => h.cal));
  document.getElementById('hist-days').textContent = history.length;
  document.getElementById('hist-avg').innerHTML    = `${Math.round(total / history.length).toLocaleString()}<span class="s-unit">kcal</span>`;
  document.getElementById('hist-max').innerHTML    = `${max.toLocaleString()}<span class="s-unit">kcal</span>`;
}

function deleteHistory(idx) {
  const history = JSON.parse(localStorage.getItem('sookd_history') || '[]');
  history.splice(idx, 1);
  localStorage.setItem('sookd_history', JSON.stringify(history));
  renderHistory();
  showToast('✓', 'ลบรายการแล้ว');
}
