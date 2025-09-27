// Cek status login
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// ================== KONFIGURASI ==================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydpxO1Vf7B0bw-BWlpOIE_k0OSHE2BVrs0DHxwrcuxbIA_KQhWooMiMm8HOc-9UQ5J/exec";
// ===============================================

// Elemen DOM
const loader = document.getElementById('loader');
const dataListContainer = document.getElementById('data-list-container'); // Ganti dari dataTableBody
const totalPemasukanEl = document.getElementById('total-pemasukan');
const totalPengeluaranEl = document.getElementById('total-pengeluaran');
const saldoAkhirEl = document.getElementById('saldo-akhir');
const searchInput = document.getElementById('search-input');

// Modal Elements
const modal = document.getElementById('form-modal');
const addDataBtn = document.getElementById('add-data-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const dataForm = document.getElementById('data-form');

// Print & Logout Buttons
const printAllBtn = document.getElementById('print-all-btn');
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
});

let allData = [];

// Fungsi format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// Fungsi loader
const showLoader = (show) => {
    loader.style.display = show ? 'flex' : 'none';
};

// Fungsi Fetch Data (tanpa perubahan)
const fetchData = async () => {
    showLoader(true);
    try {
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) throw new Error("Gagal mengambil data!");
        const data = await response.json();
        allData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        displayData(allData);
    } catch (error) {
        // console.error("Error fetching data:", error);
        // alert("Terjadi kesalahan saat memuat data.");
    } finally {
        showLoader(false);
    }
};

// ==========================================================
// == FUNGSI DISPLAY DATA (DIUBAH TOTAL MENJADI CARD LIST) ==
// ==========================================================
const displayData = (data) => {
    dataListContainer.innerHTML = ""; // Kosongkan container
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    if (data.length === 0) {
        dataListContainer.innerHTML = `<div class="text-center p-8 text-gray-500 bg-white rounded-lg shadow">Belum ada data transaksi.</div>`;
    } else {
        data.forEach(item => {
            const isPemasukan = item.jenis === 'Pemasukan';
            if (isPemasukan) {
                totalPemasukan += Number(item.jumlah);
            } else {
                totalPengeluaran += Number(item.jumlah);
            }

            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col space-y-3';

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="font-bold text-gray-800">${item.kategori}</p>
                        <p class="text-sm text-gray-500">${item.deskripsi || 'Tidak ada deskripsi'}</p>
                    </div>
                    <div class="flex items-center space-x-2 no-print">
                        <button class="print-btn text-blue-500 hover:text-blue-700" data-id="${item.id}" title="Cetak">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </button>
                        <button class="delete-btn text-red-500 hover:text-red-700" data-id="${item.id}" title="Hapus">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>

                <div class="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <div>
                        <p class="text-xs text-gray-500">${new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <span class="px-2 py-0.5 text-xs font-medium rounded-full ${isPemasukan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${item.jenis}
                        </span>
                    </div>
                    <p class="text-lg font-bold ${isPemasukan ? 'text-green-600' : 'text-red-600'}">
                        ${isPemasukan ? '+' : '-'} ${formatRupiah(item.jumlah)}
                    </p>
                </div>
            `;
            dataListContainer.appendChild(card);
        });
    }

    // Update Summary
    totalPemasukanEl.textContent = formatRupiah(totalPemasukan);
    totalPengeluaranEl.textContent = formatRupiah(totalPengeluaran);
    saldoAkhirEl.textContent = formatRupiah(totalPemasukan - totalPengeluaran);
};
// ==========================================================

// Fungsi untuk menghapus data (tanpa perubahan)
const deleteData = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    
    showLoader(true);
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'success') {
            // alert(result.message);
            fetchData();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert("Gagal menghapus data: " + error.message);
    } finally {
        showLoader(false);
    }
};

// Ganti event listener ke container baru
// GANTI BLOK KODE INI:
dataListContainer.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    const id = target.dataset.id;
    if (target.classList.contains('delete-btn')) {
        deleteData(id);
    } else if (target.classList.contains('print-btn')) {
        // FUNGSI PRINT DI SINI KITA UBAH
        printSingle(id); // Kita akan buat fungsi baru bernama printSingle
    }
});

// TAMBAHKAN FUNGSI BARU INI:
const printSingle = (id) => {
    const itemToPrint = allData.find(d => d.id === id);
    if (itemToPrint) {
        // Simpan hanya satu item ini ke session storage
        sessionStorage.setItem('printData', JSON.stringify([itemToPrint]));
        // Buka halaman print.html di tab baru
        window.open('print.html', '_blank');
    }
};

// Event listener untuk search (tanpa perubahan)
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = allData.filter(item => 
        item.deskripsi.toLowerCase().includes(searchTerm) ||
        item.kategori.toLowerCase().includes(searchTerm)
    );
    displayData(filteredData);
});

// Modal logic (tanpa perubahan)
addDataBtn.addEventListener('click', () => {
    dataForm.reset();
    document.getElementById('tanggal').valueAsDate = new Date();
    modal.classList.add('flex');
    modal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
});

// Form submission logic (tanpa perubahan)
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    const formData = new FormData(dataForm);
    formData.append('action', 'add');
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'success') {
            // alert(result.message);
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            fetchData();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert("Gagal menambah data: " + error.message);
    } finally {
        showLoader(false);
    }
});

// Print logic
// GANTI BLOK KODE INI:
printAllBtn.addEventListener('click', () => {
    // Cek jika ada data yang bisa di print
    if (allData.length > 0) {
        // Simpan semua data ke session storage
        sessionStorage.setItem('printData', JSON.stringify(allData));
        // Buka halaman print.html di tab baru
        window.open('print.html', '_blank');
    } else {
        alert('Tidak ada data untuk dicetak.');
    }
});
// (Fungsi printSingle tidak dihapus, tapi tidak dipanggil lagi di layout baru ini untuk simplisitas)

// Inisialisasi
document.addEventListener('DOMContentLoaded', fetchData);