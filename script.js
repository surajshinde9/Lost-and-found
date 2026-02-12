// ─── DATA STORE ───
let reports = [
  { id: 1, type: 'lost', name: 'Riya Sharma', phone: '9876501234', item: 'MacBook Air', category: 'Electronics', desc: 'Silver, 13-inch, sticker on back cover', date: '2025-02-10', location: 'Library Block B', emoji: '💻' },
  { id: 2, type: 'found', name: 'Arjun Mehta', phone: '9988776655', item: 'Blue Backpack', category: 'Bags', desc: 'Blue Jansport bag with a water bottle in side pocket', date: '2025-02-11', location: 'Cafeteria', emoji: '🎒' },
  { id: 3, type: 'lost', name: 'Priya Nair', phone: '9123456789', item: 'Student ID Card', category: 'Keys / ID Cards', desc: 'ID for CS Dept, photo ID', date: '2025-02-09', location: 'Admin Block', emoji: '🪪' },
  { id: 4, type: 'found', name: 'Sameer Khan', phone: '9812345678', item: 'Calculus Textbook', category: 'Books', desc: 'Thomas Calculus 13th Ed, has name "Aditya" inside cover', date: '2025-02-08', location: 'Lab 302', emoji: '📚' },
  { id: 5, type: 'lost', name: 'Ananya Das', phone: '9654321876', item: 'AirPods Pro', category: 'Electronics', desc: 'White AirPods Pro, case has a small crack', date: '2025-02-11', location: 'Sports Complex', emoji: '🎧' },
  { id: 6, type: 'found', name: 'Vikram Rao', phone: '9741258963', item: 'Jacket', category: 'Clothing', desc: 'Grey hoodie, size M, Nike brand', date: '2025-02-07', location: 'Seminar Hall', emoji: '🧥' },
];

let filteredReports = [...reports];
let currentTypeFilter = 'all';
let currentCatFilter = 'all';
let authMode = 'login';
let currentUser = null;

// ─── RENDER REPORTS ───
function renderReports(data) {
  const grid = document.getElementById('reportsGrid');
  if (!data || data.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No reports found matching your criteria.</p></div>`;
    return;
  }
  grid.innerHTML = data.map(r => `
    <div class="report-card">
      <div class="report-img">
        <span style="font-size:48px">${r.emoji}</span>
        <span class="report-tag ${r.type === 'lost' ? 'tag-lost' : 'tag-found'}">${r.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span>
      </div>
      <div class="report-body">
        <h3>${escHtml(r.item)}</h3>
        <div class="report-meta">
          <span>📍 ${escHtml(r.location)}</span>
          <span>📅 ${formatDate(r.date)}</span>
        </div>
        <p class="report-desc">${escHtml(r.desc)}</p>
        <div class="report-footer">
          <span class="report-cat">${escHtml(r.category)}</span>
          <button class="report-contact" onclick="showContact(${r.id})">Contact →</button>
        </div>
      </div>
    </div>
  `).join('');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

// ─── FILTERS ───
function applyFilters() {
  filteredReports = reports.filter(r => {
    const typeOk = currentTypeFilter === 'all' || r.type === currentTypeFilter;
    const catOk = currentCatFilter === 'all' || r.category === currentCatFilter;
    return typeOk && catOk;
  });
  renderReports(filteredReports);
}

function filterType(type, btn) {
  currentTypeFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function filterCategory(cat, btn) {
  currentCatFilter = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
  scrollToSection('recent');
}

function showAllReports() {
  currentTypeFilter = 'all';
  currentCatFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn').classList.add('active');
  document.querySelector('.cat-btn').classList.add('active');
  renderReports(reports);
  scrollToSection('recent');
}

// ─── SEARCH ───
function handleSearch(e, scrollDown) {
  if (e) e.preventDefault();
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!q) { renderReports(reports); scrollToSection('recent'); return; }
  const results = reports.filter(r =>
    r.item.toLowerCase().includes(q) ||
    r.desc.toLowerCase().includes(q) ||
    r.location.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q)
  );
  renderReports(results);
  scrollToSection('recent');
  showToast(`🔍 Found ${results.length} result(s) for "${q}"`, 'info');
}

// ─── MODAL HELPERS ───
function openModal(id) {
  document.getElementById(id).classList.add('show');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
function closeOnBackdrop(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

// ─── AUTH ───
function openAuth(mode) {
  authMode = mode;
  updateAuthUI();
  openModal('authModal');
}
function toggleAuth() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  updateAuthUI();
}
function updateAuthUI() {
  const isLogin = authMode === 'login';
  document.getElementById('authTitle').textContent = isLogin ? 'Log In' : 'Create Account';
  document.getElementById('authSubmitBtn').textContent = isLogin ? 'Log In' : 'Create Account';
  document.getElementById('nameField').style.display = isLogin ? 'none' : 'block';
  document.getElementById('authSwitch').innerHTML = isLogin
    ? `Don't have an account? <span onclick="toggleAuth()">Sign up</span>`
    : `Already have an account? <span onclick="toggleAuth()">Log in</span>`;
}
function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const name = document.getElementById('authName').value || email.split('@')[0];
  currentUser = { name, email };
  closeModal('authModal');
  showToast(authMode === 'login' ? `👋 Welcome back, ${name}!` : `🎉 Account created! Welcome, ${name}!`, 'success');
  document.getElementById('authForm').reset();
}

// ─── SUBMIT FOUND ───
function handleFoundSubmit(e) {
  e.preventDefault();
  const newReport = {
    id: reports.length + 1,
    type: 'found',
    name: document.getElementById('f-name').value,
    phone: document.getElementById('f-phone').value,
    item: document.getElementById('f-item').value,
    category: document.getElementById('f-cat').value,
    desc: document.getElementById('f-desc').value,
    date: document.getElementById('f-date').value,
    location: document.getElementById('f-loc').value,
    emoji: getCategoryEmoji(document.getElementById('f-cat').value),
  };
  reports.unshift(newReport);
  filteredReports = [...reports];
  renderReports(filteredReports);
  closeModal('foundModal');
  document.getElementById('foundForm').reset();
  showToast('✅ Found item reported successfully!', 'success');
  updateStats();
}

// ─── SUBMIT LOST ───
function handleLostSubmit(e) {
  e.preventDefault();
  const newReport = {
    id: reports.length + 1,
    type: 'lost',
    name: document.getElementById('l-name').value,
    phone: document.getElementById('l-phone').value,
    item: document.getElementById('l-item').value,
    category: document.getElementById('l-cat').value,
    desc: document.getElementById('l-desc').value,
    date: document.getElementById('l-date').value,
    location: document.getElementById('l-loc').value,
    emoji: getCategoryEmoji(document.getElementById('l-cat').value),
  };
  reports.unshift(newReport);
  filteredReports = [...reports];
  renderReports(filteredReports);
  closeModal('lostModal');
  document.getElementById('lostForm').reset();
  showToast('📋 Lost item reported successfully!', 'success');
  updateStats();
  checkForMatches(newReport);
}

// ─── CONTACT ───
function showContact(id) {
  const r = reports.find(x => x.id === id);
  if (!r) return;
  document.getElementById('contactDetails').innerHTML = `
    <div style="margin-bottom:12px"><strong style="font-size:17px;font-family:'Syne',sans-serif;">${escHtml(r.item)}</strong></div>
    <div style="font-size:14px;color:var(--muted);margin-bottom:12px;">Reported by <strong style="color:var(--navy)">${escHtml(r.name)}</strong></div>
    <div style="display:flex;align-items:center;gap:10px;padding:12px;background:white;border-radius:10px;border:1.5px solid var(--border)">
      <span style="font-size:20px">📱</span>
      <div>
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Phone</div>
        <div style="font-size:16px;font-weight:700;color:var(--navy)">${escHtml(r.phone)}</div>
      </div>
    </div>
  `;
  openModal('contactModal');
}

// ─── MATCH SUGGESTION ───
function checkForMatches(newReport) {
  const keyword = newReport.item.toLowerCase().split(' ')[0];
  const match = reports.find(r =>
    r.id !== newReport.id &&
    r.type !== newReport.type &&
    (r.item.toLowerCase().includes(keyword) ||
     r.category === newReport.category)
  );
  if (match) {
    setTimeout(() => {
      showToast(`🎯 Possible match found: "${match.item}" reported ${match.type}!`, 'info');
    }, 1500);
  }
}

// ─── HELPERS ───
function getCategoryEmoji(cat) {
  const map = { 'Electronics':'💻','Bags':'🎒','Books':'📚','Clothing':'👕','Keys / ID Cards':'🔑','Others':'📦' };
  return map[cat] || '📦';
}

function updateStats() {
  document.getElementById('statItems').textContent = reports.length + 241;
  document.getElementById('statStudents').textContent = Math.round(reports.length * 1.7) + 410;
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); }, 3500);
}

// Set today as default date for forms
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  ['f-date', 'l-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  renderReports(reports);
  setDefaultDates();
});