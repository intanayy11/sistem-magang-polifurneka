<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Presensi & Logbook Magang</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11px;
            color: #000000;
            line-height: 1.4;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .header h2 {
            margin: 0;
            font-size: 15px;
            color: #000000;
            text-transform: uppercase;
            font-weight: bold;
        }
        .header h3 {
            margin: 3px 0 0 0;
            font-size: 12px;
            font-weight: bold;
            color: #000000;
            text-transform: uppercase;
        }
        
        .info-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 3px 4px;
            vertical-align: top;
        }
        .info-label {
            font-weight: bold;
            width: 160px;
            color: #000000;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #000000;
            border-bottom: 1px solid #000000;
            padding-bottom: 3px;
            margin-top: 15px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table th {
            background-color: #ffffff;
            color: #000000;
            text-align: left;
            padding: 5px 6px;
            font-size: 10px;
            border: 1px solid #000000;
            font-weight: bold;
            text-transform: uppercase;
        }
        table.data-table td {
            border: 1px solid #000000;
            padding: 4px 6px;
            vertical-align: top;
            color: #000000;
        }
        
        .footer {
            margin-top: 30px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 220px;
            text-align: center;
        }
    </style>
</head>
<body>

    @if(file_exists(public_path('images/kop.jpg')))
    <div style="text-align: center; margin-bottom: 10px;">
        <img src="{{ public_path('images/kop.jpg') }}" style="width: 100%; max-height: 100px; object-fit: contain;" alt="Kop Surat Polifurneka">
    </div>
    @else
    <div class="header">
        <h2>POLITEKNIK INDUSTRI FURNITUR DAN PENGOLAHAN KAYU KENDAL</h2>
        <h3>LAPORAN REKAP PRESENSI & LOGBOOK MAGANG</h3>
    </div>
    @endif

    <table class="info-table">
        <tr>
            <td class="info-label">Nama Peserta Magang</td>
            <td>: {{ $user->nama }}</td>
        </tr>
        <tr>
            <td class="info-label">NIM / NIS</td>
            <td>: {{ $user->nim_nis ?? '-' }}</td>
        </tr>
        @if($user->asal_instansi)
        <tr>
            <td class="info-label">Asal Sekolah / Instansi</td>
            <td>: {{ $user->asal_instansi }}</td>
        </tr>
        @endif
        <tr>
            <td class="info-label">Pembimbing Lapangan</td>
            <td>: {{ $plotting->pembimbing->nama ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">Email / No. HP</td>
            <td>: {{ $user->email }} @if($user->no_hp) / {{ $user->no_hp }} @endif</td>
        </tr>
        <tr>
            <td class="info-label">Periode Magang</td>
            <td>: {{ $user->tanggal_mulai_magang ? \Carbon\Carbon::parse($user->tanggal_mulai_magang)->translatedFormat('d F Y') : '-' }} s/d {{ $user->tanggal_selesai_magang ? \Carbon\Carbon::parse($user->tanggal_selesai_magang)->translatedFormat('d F Y') : 'Sekarang' }}</td>
        </tr>
        <tr>
            <td class="info-label">Tanggal Cetak Rekap</td>
            <td>: {{ \Carbon\Carbon::parse($generatedAt)->translatedFormat('d F Y H:i') }} WIB</td>
        </tr>
    </table>

    <div class="section-title">I. REKAPITULASI PRESENSI KEHADIRAN</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px; text-align: center;">No</th>
                <th style="width: 100px;">Tanggal</th>
                <th style="width: 90px;">Jam Masuk</th>
                <th style="width: 90px;">Jam Pulang</th>
                <th>Status Kehadiran</th>
            </tr>
        </thead>
        <tbody>
            @forelse($presensiList as $index => $item)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y') }}</td>
                    <td>{{ $item->jam_masuk ?? '-' }}</td>
                    <td>{{ $item->jam_pulang ?? '-' }}</td>
                    <td><strong>{{ $item->status }}</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center;">Belum ada data presensi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">II. LOGBOOK KEGIATAN HARIAN (DISERAHKAN / APPROVED)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px; text-align: center;">No</th>
                <th style="width: 100px;">Tanggal</th>
                <th style="width: 160px;">Judul Kegiatan</th>
                <th>Deskripsi Kegiatan & Kendala</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logbookList as $index => $log)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($log->tanggal)->translatedFormat('d F Y') }}</td>
                    <td><strong>{{ $log->judul_kegiatan }}</strong></td>
                    <td>
                        {{ $log->deskripsi }}
                        @if($log->kendala)
                            <br><em>Kendala: {{ $log->kendala }}</em>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center;">Belum ada logbook yang disetujui (Approve).</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <div class="signature-box">
            @php
                \Carbon\Carbon::setLocale('id');
                $tglTtd = $user->tanggal_selesai_magang 
                    ? \Carbon\Carbon::parse($user->tanggal_selesai_magang)->translatedFormat('d F Y') 
                    : \Carbon\Carbon::now()->translatedFormat('d F Y');
            @endphp
            <p>Kendal, {{ $tglTtd }}</p>
            <p>Pembimbing Lapangan,</p>
            <br><br><br><br>
            <p><strong>( {{ $plotting->pembimbing->nama ?? '..........................' }} )</strong></p>
        </div>
    </div>

</body>
</html>
