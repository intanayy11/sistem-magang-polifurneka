const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'figma');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const baseStyle = `
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; }
        .btn-poli-primary { background-color: #E8A800; color: #fff; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; text-align: center; display: inline-block; }
        .card-clean { background-color: #ffffff; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .sidebar-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; color: #64748b; margin-bottom: 0.25rem; }
        .sidebar-item.active { background-color: #fffbeb; color: #b45309; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .status-hadir { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef9c3; color: #854d0e; }
        .status-approve { background-color: #dbeafe; color: #1e40af; }
    </style>
`;

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;

function buildPage(title, role, contentHtml) {
    const menus = {
        'peserta': ['Dashboard', 'Presensi Harian', 'Logbook Kegiatan', 'Pengajuan Izin', 'Tugas Magang'],
        'pembimbing': ['Dashboard', 'Daftar Peserta', 'Review Logbook', 'Verifikasi Izin', 'Review Tugas'],
        'admin': ['Dashboard', 'Manajemen User', 'Plotting Bimbingan']
    };

    let sidebarHtml = '';
    menus[role].forEach(menu => {
        const isActive = title.includes(menu) || (menu === 'Dashboard' && title.includes('Dashboard'));
        sidebarHtml += `<div class="sidebar-item ${isActive ? 'active' : ''}">${svgIcon} <span>${menu}</span></div>`;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Polifurneka</title>
    ${baseStyle}
</head>
<body class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r border-slate-100 flex flex-col">
        <div class="h-16 flex items-center px-6 border-b border-slate-100">
            <div class="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white font-bold mr-3">P</div>
            <span class="font-bold text-slate-800 text-sm">Sistem Magang Polifurneka</span>
        </div>
        <div class="p-4 flex-1 overflow-y-auto">
            <div class="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider ml-2">Menu Utama</div>
            ${sidebarHtml}
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        <!-- Navbar -->
        <div class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
            <h1 class="font-semibold text-lg text-slate-800">${title}</h1>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <div class="text-sm font-bold text-slate-700">Ahmad Rizky</div>
                    <div class="text-xs text-slate-500 capitalize">${role}</div>
                </div>
                <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">A</div>
            </div>
        </div>

        <!-- Page Content -->
        <div class="p-8 flex-1 overflow-y-auto">
            ${contentHtml}
        </div>
    </div>
</body>
</html>`;
}

const pages = [
    {
        filename: 'dashboard-peserta.html',
        title: 'Dashboard Peserta',
        role: 'peserta',
        content: `
            <div class="card-clean p-6 border-l-4 border-amber-500 mb-6 flex justify-between items-center bg-white relative overflow-hidden">
                <div>
                    <h2 class="text-xl font-bold mb-1">Selamat Datang di Dashboard Peserta</h2>
                    <p class="text-sm text-slate-500">Pantau statistik kehadiran dan progres magang Anda.</p>
                </div>
                <button class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">Unduh Rekap PDF</button>
            </div>
            <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Presensi Kehadiran</div><div class="text-3xl font-bold">95%</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Logbook Menunggu</div><div class="text-3xl font-bold">2</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Tugas Selesai</div><div class="text-3xl font-bold">1</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Total Izin</div><div class="text-3xl font-bold">0</div></div>
            </div>
            <div class="card-clean p-6">
                <h3 class="font-bold mb-4">Aksi Presensi Hari Ini</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-amber-50 rounded-xl p-5 border border-amber-100">
                        <div class="text-xs font-bold text-amber-800 uppercase mb-2">Presensi Masuk (Check-In)</div>
                        <div class="text-2xl font-mono font-bold mb-3">07:25:10</div>
                        <button class="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold opacity-50">Sudah Check-In</button>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div class="text-xs font-bold text-slate-600 uppercase mb-2">Presensi Pulang (Check-Out)</div>
                        <div class="text-2xl font-mono font-bold mb-3">--:--:--</div>
                        <button class="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold">Check-Out Sekarang</button>
                    </div>
                </div>
            </div>
        `
    },
    {
        filename: 'presensi-peserta.html',
        title: 'Presensi Harian',
        role: 'peserta',
        content: `
            <div class="card-clean p-6 mb-6">
                <h3 class="font-bold mb-4">Aksi Presensi Hari Ini</h3>
                <p class="text-sm text-slate-500 mb-4">Standar Jam Masuk: 07:30 WIB | Standar Jam Pulang: 16:00 WIB</p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-amber-50 rounded-xl p-5 border border-amber-100"><div class="text-xs font-bold text-amber-800 uppercase mb-2">Check-In</div><div class="text-2xl font-mono font-bold">07:25:10</div></div>
                    <div class="bg-slate-50 rounded-xl p-5 border border-slate-200"><div class="text-xs font-bold text-slate-600 uppercase mb-2">Check-Out</div><div class="text-2xl font-mono font-bold">--:--:--</div></div>
                </div>
            </div>
            <div class="card-clean p-0 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200"><tr class="text-slate-600"><th class="p-4">Tanggal</th><th class="p-4">Jam Masuk</th><th class="p-4">Jam Pulang</th><th class="p-4">Status</th></tr></thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr><td class="p-4">25 Jul 2026</td><td class="p-4">07:25</td><td class="p-4">-</td><td class="p-4"><span class="status-badge status-hadir">Hadir</span></td></tr>
                        <tr><td class="p-4">24 Jul 2026</td><td class="p-4">07:45</td><td class="p-4">16:10</td><td class="p-4"><span class="status-badge status-pending">Terlambat</span></td></tr>
                    </tbody>
                </table>
            </div>
        `
    },
    {
        filename: 'logbook-peserta.html',
        title: 'Logbook Kegiatan',
        role: 'peserta',
        content: `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Daftar Logbook</h2>
                <button class="btn-poli-primary">+ Isi Logbook Hari Ini</button>
            </div>
            <div class="grid gap-4">
                <div class="card-clean p-5 border-l-4 border-amber-500">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold">Mempelajari Laravel API</h3>
                        <span class="status-badge status-pending">Pending</span>
                    </div>
                    <p class="text-sm text-slate-600">Membuat endpoint untuk sistem presensi dengan validasi Sanctum.</p>
                    <div class="text-xs text-slate-400 mt-3">25 Juli 2026</div>
                </div>
                <div class="card-clean p-5 border-l-4 border-blue-500">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold">Setup React Vite</h3>
                        <span class="status-badge status-approve">Approve</span>
                    </div>
                    <p class="text-sm text-slate-600">Inisialisasi frontend dengan tailwind css.</p>
                    <div class="text-xs text-slate-400 mt-3">24 Juli 2026</div>
                </div>
            </div>
        `
    },
    {
        filename: 'izin-peserta.html',
        title: 'Pengajuan Izin',
        role: 'peserta',
        content: `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Daftar Pengajuan Izin</h2>
                <button class="btn-poli-primary">+ Ajukan Izin Baru</button>
            </div>
            <div class="card-clean p-0 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200"><tr class="text-slate-600"><th class="p-4">Tanggal Mulai</th><th class="p-4">Tanggal Selesai</th><th class="p-4">Alasan</th><th class="p-4">Status</th></tr></thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr><td class="p-4">28 Jul 2026</td><td class="p-4">29 Jul 2026</td><td class="p-4">Sakit</td><td class="p-4"><span class="status-badge status-pending">Menunggu Verifikasi</span></td></tr>
                    </tbody>
                </table>
            </div>
        `
    },
    {
        filename: 'tugas-peserta.html',
        title: 'Tugas Magang',
        role: 'peserta',
        content: `
            <div class="grid gap-4">
                <div class="card-clean p-5">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">Modul Authentication</h3>
                        <span class="status-badge bg-rose-100 text-rose-700">Belum Dikerjakan</span>
                    </div>
                    <p class="text-sm text-slate-600 mb-4">Buat login, register, dan middleware sesuai role.</p>
                    <div class="bg-slate-50 p-4 rounded-lg">
                        <label class="block text-sm font-semibold mb-2">Link Hasil Pekerjaan (Google Drive/Github)</label>
                        <div class="flex gap-2">
                            <input type="text" class="flex-1 p-2 border border-slate-200 rounded-lg text-sm" placeholder="https://...">
                            <button class="btn-poli-primary">Kumpulkan Tugas</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        filename: 'dashboard-pembimbing.html',
        title: 'Dashboard Pembimbing',
        role: 'pembimbing',
        content: `
            <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Total Peserta Bimbingan</div><div class="text-3xl font-bold">5</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Logbook Perlu Review</div><div class="text-3xl font-bold text-amber-600">8</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Izin Menunggu</div><div class="text-3xl font-bold text-rose-600">1</div></div>
            </div>
            <div class="card-clean p-6">
                <h3 class="font-bold mb-4">Peserta Bimbingan Terbaru</h3>
                <table class="w-full text-left text-sm border-t border-slate-100">
                    <tbody>
                        <tr class="border-b border-slate-100"><td class="py-3 font-semibold">Ahmad Rizky</td><td class="py-3 text-slate-500">Unsoed</td><td class="py-3"><button class="text-amber-600 text-xs font-bold">Lihat Detail</button></td></tr>
                        <tr class="border-b border-slate-100"><td class="py-3 font-semibold">Budi Santoso</td><td class="py-3 text-slate-500">Undip</td><td class="py-3"><button class="text-amber-600 text-xs font-bold">Lihat Detail</button></td></tr>
                    </tbody>
                </table>
            </div>
        `
    },
    {
        filename: 'review-logbook.html',
        title: 'Review Logbook',
        role: 'pembimbing',
        content: `
            <div class="card-clean p-5 mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="text-xs text-amber-600 font-bold mb-1">Ahmad Rizky</div>
                        <h3 class="font-bold text-lg">Mempelajari Laravel API</h3>
                    </div>
                    <span class="text-sm text-slate-500">25 Jul 2026</span>
                </div>
                <p class="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">Membuat endpoint untuk sistem presensi dengan validasi Sanctum.</p>
                <div class="flex gap-2">
                    <button class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Approve</button>
                    <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject / Revisi</button>
                </div>
            </div>
        `
    },
    {
        filename: 'verifikasi-izin.html',
        title: 'Verifikasi Izin',
        role: 'pembimbing',
        content: `
            <div class="card-clean p-0 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200"><tr class="text-slate-600"><th class="p-4">Peserta</th><th class="p-4">Periode</th><th class="p-4">Alasan</th><th class="p-4">Bukti</th><th class="p-4">Aksi</th></tr></thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr>
                            <td class="p-4 font-semibold">Ahmad Rizky</td>
                            <td class="p-4">28 Jul - 29 Jul</td>
                            <td class="p-4">Sakit</td>
                            <td class="p-4"><a href="#" class="text-blue-600 underline">Lihat File</a></td>
                            <td class="p-4 flex gap-2">
                                <button class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold">Setujui</button>
                                <button class="bg-rose-100 text-rose-700 px-3 py-1 rounded-md text-xs font-bold">Tolak</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `
    },
    {
        filename: 'review-tugas.html',
        title: 'Review Tugas',
        role: 'pembimbing',
        content: `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Daftar Tugas Peserta</h2>
                <button class="btn-poli-primary">+ Beri Tugas Baru</button>
            </div>
            <div class="card-clean p-5">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="text-xs text-slate-500 mb-1">Ditugaskan ke: Ahmad Rizky</div>
                        <h3 class="font-bold text-lg">Modul Authentication</h3>
                    </div>
                    <span class="status-badge bg-blue-100 text-blue-700">Menunggu Review</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg my-3 text-sm">
                    <strong>Link Hasil:</strong> <a href="#" class="text-blue-600 underline">https://github.com/...</a>
                </div>
                <div class="flex gap-2 border-t border-slate-100 pt-3">
                    <button class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Tugas Selesai (Approve)</button>
                    <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Kembalikan (Revisi)</button>
                </div>
            </div>
        `
    },
    {
        filename: 'dashboard-admin.html',
        title: 'Dashboard Admin',
        role: 'admin',
        content: `
            <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Total User</div><div class="text-3xl font-bold">24</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Peserta Aktif</div><div class="text-3xl font-bold">20</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Pembimbing</div><div class="text-3xl font-bold">3</div></div>
                <div class="card-clean p-5"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Belum Diplot</div><div class="text-3xl font-bold text-rose-600">5</div></div>
            </div>
            <div class="card-clean p-6 flex flex-col items-center justify-center h-64 text-slate-400">
                <p>Grafik Aktivitas Sistem</p>
            </div>
        `
    },
    {
        filename: 'manajemen-user.html',
        title: 'Manajemen User',
        role: 'admin',
        content: `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Daftar Pengguna Sistem</h2>
                <button class="btn-poli-primary">+ Tambah User Baru</button>
            </div>
            <div class="card-clean p-0 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200"><tr class="text-slate-600"><th class="p-4">Nama</th><th class="p-4">Email</th><th class="p-4">Role</th><th class="p-4">Status</th><th class="p-4">Aksi</th></tr></thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr><td class="p-4 font-semibold">Ahmad Rizky</td><td class="p-4">peserta@example.com</td><td class="p-4"><span class="bg-slate-100 px-2 py-1 rounded text-xs">Peserta</span></td><td class="p-4"><span class="text-emerald-600 font-bold text-xs">Aktif</span></td><td class="p-4"><button class="text-blue-600 mr-2 text-xs font-bold">Edit</button></td></tr>
                        <tr><td class="p-4 font-semibold">Pak Budi</td><td class="p-4">pembimbing@example.com</td><td class="p-4"><span class="bg-slate-100 px-2 py-1 rounded text-xs">Pembimbing</span></td><td class="p-4"><span class="text-emerald-600 font-bold text-xs">Aktif</span></td><td class="p-4"><button class="text-blue-600 mr-2 text-xs font-bold">Edit</button></td></tr>
                    </tbody>
                </table>
            </div>
        `
    },
    {
        filename: 'plotting-bimbingan.html',
        title: 'Plotting Bimbingan',
        role: 'admin',
        content: `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Manajemen Plotting</h2>
                <button class="btn-poli-primary">+ Tambah Plotting Baru</button>
            </div>
            <div class="card-clean p-0 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200"><tr class="text-slate-600"><th class="p-4">Peserta Magang</th><th class="p-4">Pembimbing Lapangan</th><th class="p-4">Periode</th><th class="p-4">Aksi</th></tr></thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr><td class="p-4 font-semibold">Ahmad Rizky</td><td class="p-4">Pak Budi</td><td class="p-4">25 Jul 26 - 25 Okt 26</td><td class="p-4"><button class="text-rose-600 text-xs font-bold">Hapus Plotting</button></td></tr>
                    </tbody>
                </table>
            </div>
        `
    }
];

pages.forEach(page => {
    const html = buildPage(page.title, page.role, page.content);
    fs.writeFileSync(path.join(outputDir, page.filename), html, 'utf8');
    console.log('Created:', page.filename);
});
