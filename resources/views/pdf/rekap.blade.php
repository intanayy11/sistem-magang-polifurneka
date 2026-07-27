<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Presensi & Logbook Magang</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 16px; color: #1e3a8a; text-transform: uppercase; }
        .header h3 { margin: 3px 0 0 0; font-size: 13px; font-weight: normal; color: #475569; }
        .header p { margin: 2px 0 0 0; font-size: 10px; color: #64748b; }
        
        .info-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; }
        .info-table td { padding: 4px 6px; }
        .info-label { font-weight: bold; width: 140px; color: #334155; }
        
        .section-title { font-size: 13px; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px; }
        
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.data-table th { background-color: #1e3a8a; color: #ffffff; text-align: left; padding: 6px; font-size: 10px; }
        table.data-table td { border-bottom: 1px solid #e2e8f0; padding: 5px 6px; vertical-align: top; }
        table.data-table tr:nth-child(even) { background-color: #f8fafc; }
        
        .badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; display: inline-block; }
        .badge-hadir { background-color: #dcfce7; color: #15803d; }
        .badge-terlambat { background-color: #fef3c7; color: #b45309; }
        .badge-pulangcepat { background-color: #ffedd5; color: #c2410c; }
        
        .footer { margin-top: 30px; width: 100%; }
        .signature-box { float: right; width: 220px; text-align: center; }
    </style>
</head>
<body>

    <div class="header">
        <h2>POLITEKNIK INDUSTRI FURNITUR DAN PENGOLAHAN KAYU KENDAL</h2>
        <h3>LAPORAN REKAP PRESENSI & LOGBOOK MAGANG</h3>
        <p>Universitas Jenderal Soedirman - Jurusan Informatika</p>
    </div>

    <table class="info-table">
        <tr>
            <td class="info-label">Nama Peserta</td>
            <td>: {{ $user->nama }}</td>
            <td class="info-label">Pembimbing Lapangan</td>
            <td>: {{ $plotting->pembimbing->nama ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">NIM / NIS</td>
            <td>: {{ $user->nim_nis ?? '-' }}</td>
            <td class="info-label">Email / No HP</td>
            <td>: {{ $user->email }} / {{ $user->no_hp ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">Tanggal Cetak</td>
            <td>: {{ $generatedAt }}</td>
            <td class="info-label">Periode Magang</td>
            <td>: {{ $user->tanggal_mulai_magang ? \Carbon\Carbon::parse($user->tanggal_mulai_magang)->format('d-m-Y') : '-' }} s/d {{ $user->tanggal_selesai_magang ? \Carbon\Carbon::parse($user->tanggal_selesai_magang)->format('d-m-Y') : 'Sekarang' }}</td>
        </tr>
    </table>

    <div class="section-title">I. REKAPITULASI PRESENSI</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th style="width: 90px;">Tanggal</th>
                <th style="width: 80px;">Jam Masuk</th>
                <th style="width: 80px;">Jam Pulang</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($presensiList as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($item->tanggal)->format('d-m-Y') }}</td>
                    <td>{{ $item->jam_masuk ?? '-' }}</td>
                    <td>{{ $item->jam_pulang ?? '-' }}</td>
                    <td>
                        @if($item->status == 'Hadir')
                            <span class="badge badge-hadir">Hadir</span>
                        @elseif($item->status == 'Terlambat')
                            <span class="badge badge-terlambat">Terlambat</span>
                        @elseif($item->status == 'Pulang Cepat')
                            <span class="badge badge-pulangcepat">Pulang Cepat</span>
                        @else
                            {{ $item->status }}
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #94a3b8;">Belum ada data presensi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">II. LOGBOOK KEGIATAN HARIAN (APPROVED)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th style="width: 80px;">Tanggal</th>
                <th style="width: 150px;">Judul Kegiatan</th>
                <th>Deskripsi Kegiatan & Kendala</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logbookList as $index => $log)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($log->tanggal)->format('d-m-Y') }}</td>
                    <td><strong>{{ $log->judul_kegiatan }}</strong></td>
                    <td>
                        {{ $log->deskripsi }}
                        @if($log->kendala)
                            <br><em style="color: #64748b;">Kendala: {{ $log->kendala }}</em>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #94a3b8;">Belum ada logbook yang disetujui (Approve).</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <div class="signature-box">
            <p>Kendal, {{ \Carbon\Carbon::now()->format('d F Y') }}</p>
            <p>Pembimbing Lapangan,</p>
            <br><br><br>
            <p><strong>( {{ $plotting->pembimbing->nama ?? '..........................' }} )</strong></p>
        </div>
    </div>

</body>
</html>
