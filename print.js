document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('print-table-body');
    const reportDateEl = document.getElementById('report-date');
    
    // Elemen Ringkasan
    const summarySection = document.getElementById('summary-section');
    const totalPemasukanEl = document.getElementById('total-pemasukan');
    const totalPengeluaranEl = document.getElementById('total-pengeluaran');
    const saldoAkhirEl = document.getElementById('saldo-akhir');

    // Fungsi format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    // Ambil data dari session storage
    const dataToPrintJSON = sessionStorage.getItem('printData');
    
    if (!dataToPrintJSON) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada data untuk dicetak. Silakan kembali ke dashboard.</td></tr>';
        summarySection.style.display = 'none'; // Sembunyikan ringkasan jika tidak ada data
        return;
    }

    const dataToPrint = JSON.parse(dataToPrintJSON);

    // Set tanggal laporan
    const today = new Date();
    reportDateEl.textContent = `Dicetak pada: ${today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    // Isi tabel dengan data
    dataToPrint.forEach(item => {
        const isPemasukan = item.jenis === 'Pemasukan';
        if (isPemasukan) {
            totalPemasukan += Number(item.jumlah);
        } else {
            totalPengeluaran += Number(item.jumlah);
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
            <td>${item.kategori}</td>
            <td>${item.deskripsi || '-'}</td>
            <td>
                <span style="color: ${isPemasukan ? '#28a745' : '#dc3545'};">
                    ${item.jenis}
                </span>
            </td>
            <td style="text-align: right; font-weight: 500;">${formatRupiah(item.jumlah)}</td>
        `;
        tableBody.appendChild(row);
    });

    // Isi bagian ringkasan
    totalPemasukanEl.textContent = formatRupiah(totalPemasukan);
    totalPengeluaranEl.textContent = formatRupiah(totalPengeluaran);
    saldoAkhirEl.textContent = formatRupiah(totalPemasukan - totalPengeluaran);
    
    // Jika hanya satu item, sembunyikan ringkasan total
    if (dataToPrint.length === 1) {
        summarySection.style.display = 'none';
    }

    // Secara otomatis buka dialog print setelah halaman siap
    window.print();
});