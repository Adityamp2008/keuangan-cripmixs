// === CONFIG ===
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwt9TcusOI0hfoUt2d8OF8t0cRBpz9IAk142z_o3sKhZ23SM0ko28Ia7qIvjM6U5nh2/exechttps://script.google.com/macros/s/AKfycby88nwsT7b7wDemTT3HofigsoLM0NaA8jhe1m9TFN7eUoV4ZAAyz1Gkt5LNWg7krC8n/exechttps://script.google.com/macros/s/AKfycbwjo4K05G6OtOcDWLOPdZTTvatNLCfYwKehCEuXL2CgH_xPhRM3_jkiZ_vDQFcRRinv/exec';

// === DOM ===
const totalPemasukanEl = document.getElementById('totalPemasukan');
const totalPengeluaranEl = document.getElementById('totalPengeluaran');
const form = document.getElementById('transactionForm');
const tableBody = document.getElementById('historyTableBody');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const printAllBtn = document.getElementById('printAllBtn');
const logoutBtn = document.getElementById('logoutBtn');
const submitBtnText = document.getElementById('submitBtnText');
const submitSpinner = document.getElementById('submitSpinner');

let transactions = [];

// === Utils ===
const formatCurrency = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n);
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
const showLoading = (state) => {
  submitBtnText.classList.toggle('hidden', state);
  submitSpinner.classList.toggle('hidden', !state);
};

// === Fetch Data ===
async function fetchTransactions() {
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  tableBody.innerHTML = '';
  tableBody.appendChild(loadingState);
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    transactions = data.map(t => ({...t, jumlah: Number(t.jumlah)}))
                       .sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    renderTable(transactions);
    updateSummary();
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 p-6">Gagal memuat data</td></tr>`;
  } finally {
    loadingState.classList.add('hidden');
  }
}

// === Render Table ===
function renderTable(data) {
  tableBody.innerHTML = '';
  if (data.length === 0) {
    emptyState.classList.remove('hidden');
    tableBody.appendChild(emptyState);
    return;
  }
  data.forEach(item => {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';
    row.innerHTML = `
      <td class="px-6 py-3">
        <span class="px-2 py-1 text-xs rounded-full ${item.tipe === 'Pemasukan' ? 'bg-green-100 text-green-800':'bg-red-100 text-red-800'}">
          ${item.tipe}
        </span>
      </td>
      <td class="px-6 py-3 font-medium ${item.tipe === 'Pemasukan' ? 'text-green-600':'text-red-600'}">${formatCurrency(item.jumlah)}</td>
      <td class="px-6 py-3">${item.deskripsi}</td>
      <td class="px-6 py-3 text-gray-500">${formatDate(item.timestamp)}</td>
      <td class="px-6 py-3 text-center">
        <button class="text-blue-600 hover:text-blue-800 print-btn" data-id="${item.id}"><i class="fa fa-print"></i></button>
        <button class="text-red-600 hover:text-red-800 delete-btn ml-3" data-id="${item.id}"><i class="fa fa-trash"></i></button>
      </td>`;
    tableBody.appendChild(row);
  });
}

function updateSummary() {
  const pemasukan = transactions.filter(t=>t.tipe==='Pemasukan').reduce((s,t)=>s+t.jumlah,0);
  const pengeluaran = transactions.filter(t=>t.tipe==='Pengeluaran').reduce((s,t)=>s+t.jumlah,0);
  totalPemasukanEl.textContent = formatCurrency(pemasukan);
  totalPengeluaranEl.textContent = formatCurrency(pengeluaran);
}

// === Form Submit ===
form.addEventListener('submit', async e => {
  e.preventDefault();
  showLoading(true);
  const data = {
    tipe: document.getElementById('type').value,
    jumlah: parseFloat(document.getElementById('amount').value),
    deskripsi: document.getElementById('description').value,
  };
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({action:'add', data})
    });
    form.reset();
    fetchTransactions();
  } catch {
    alert('Gagal menambah transaksi');
  } finally {
    showLoading(false);
  }
});

// === Table Actions ===
tableBody.addEventListener('click', e => {
  const delBtn = e.target.closest('.delete-btn');
  const printBtn = e.target.closest('.print-btn');
  if (delBtn) handleDelete(delBtn.dataset.id);
  if (printBtn) printSingle(printBtn.dataset.id);
});

async function handleDelete(id) {
  if (!confirm('Hapus transaksi ini?')) return;
  await fetch(SCRIPT_URL, {
    method:'POST',
    body: JSON.stringify({action:'delete', id})
  });
  fetchTransactions();
}

// === Print ===
function printSingle(id) {
  const item = transactions.find(t => t.id === id);
  if (!item) return;
  const content = `
    <h1>Struk Transaksi</h1>
    <p><strong>ID:</strong> ${item.id}</p>
    <p><strong>Tipe:</strong> ${item.tipe}</p>
    <p><strong>Deskripsi:</strong> ${item.deskripsi}</p>
    <p><strong>Jumlah:</strong> ${formatCurrency(item.jumlah)}</p>
    <p><strong>Tanggal:</strong> ${formatDate(item.timestamp)}</p>`;
  printContent(content);
}

function printContent(html) {
  const w = window.open('', '', 'height=600,width=800');
  w.document.write(`<html><body>${html}</body></html>`);
  w.document.close();
  w.print();
}

printAllBtn.addEventListener('click', () => {
  const rows = transactions.map(t => `
    <tr><td>${t.tipe}</td><td>${t.deskripsi}</td><td>${formatDate(t.timestamp)}</td><td>${formatCurrency(t.jumlah)}</td></tr>
  `).join('');
  printContent(`<h1>Laporan Keuangan</h1><table border="1" width="100%"><tr><th>Tipe</th><th>Deskripsi</th><th>Tanggal</th><th>Jumlah</th></tr>${rows}</table>`);
});

// === Search ===
searchInput.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderTable(transactions.filter(t => t.deskripsi.toLowerCase().includes(q)));
});

// === Logout ===
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
});

// === Init ===
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "index.html";
} else {
  fetchTransactions();
}

// === PWA Service Worker ===
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
