<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Rekapitulasi Magang Polifurneka</title>
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
        
        .filter-box {
            width: 100%;
            border: 1px solid #000000;
            background-color: #fcfcfc;
            padding: 8px 10px;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .filter-box td {
            padding: 3px 4px;
            vertical-align: top;
            font-size: 10.5px;
        }
        .filter-label {
            font-weight: bold;
            width: 130px;
            color: #000000;
        }
        
        .section-title {
            font-size: 11.5px;
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
            background-color: #f2f2f2;
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
            margin-top: 25px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 220px;
            text-align: center;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>

    @if(file_exists(public_path('images/kop_header.jpg')))
    <div style="text-align: center; margin-bottom: 12px;">
        <img src="{{ public_path('images/kop_header.jpg') }}" style="width: 100%; height: auto; display: block;" alt="Kop Surat Polifurneka">
    </div>
    @elseif(file_exists(public_path('images/kop.jpg')))
    <div style="text-align: center; margin-bottom: 12px;">
        <img src="{{ public_path('images/kop.jpg') }}" style="width: 100%; height: auto; display: block;" alt="Kop Surat Polifurneka">
    </div>
    @else
    <div class="header" style="text-align: center; border-bottom: 3px double #000000; padding-bottom: 8px; margin-bottom: 15px;">
        @if(file_exists(public_path('images/logo-polifurneka.png')))
        <img src="{{ public_path('images/logo-polifurneka.png') }}" style="height: 48px; width: auto; vertical-align: middle; margin-right: 10px;" alt="Logo Polifurneka">
        @endif
        <div style="display: inline-block; vertical-align: middle;">
            <h2 style="font-size: 14px; font-weight: bold; margin: 0;">POLITEKNIK INDUSTRI FURNITUR DAN PENGOLAHAN KAYU KENDAL</h2>
            <p style="font-size: 10px; margin: 3px 0 0 0; font-style: italic;">Jl. Wanamarta Raya No. 20, Kawasan Industri Kendal, Jawa Tengah 51371</p>
        </div>
    </div>
    @endif

    <div style="text-align: center; margin-bottom: 12px;">
        <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0; text-decoration: underline; letter-spacing: 0.5px;">LAPORAN REKAPITULASI MAGANG POLIFURNEKA</h3>
    </div>

    <!-- Ringkasan Filter PDF -->
    <table class="filter-box">
        <tr>
            <td class="filter-label">Periode Laporan</td>
            <td>: {{ $periode_teks }}</td>
            <td class="filter-label">Dicetak Oleh</td>
            <td>: {{ $user->nama }} ({{ ucfirst($user->role) }})</td>
        </tr>
        <tr>
            <td class="filter-label">Filter Peserta</td>
            <td>: {{ $peserta_info ? $peserta_info->nama . ' (' . ($peserta_info->nim_nis ?? '-') . ')' : 'Semua Peserta' }}</td>
            <td class="filter-label">Tanggal Cetak</td>
            <td>: {{ $generatedAt }} WIB</td>
        </tr>
        @if($jurusan_filter || $posisi_filter)
        <tr>
            <td class="filter-label">Jurusan / Posisi</td>
            <td colspan="3">: {{ $jurusan_filter ?? 'Semua Jurusan' }} / {{ $posisi_filter ?? 'Semua Posisi' }}</td>
        </tr>
        @endif
        <tr>
            <td class="filter-label">Kategori Data</td>
            <td colspan="3">: <strong>{{ strtoupper($jenis_data) }}</strong> (Total Data: {{ $totals['total'] }} Record)</td>
        </tr>
    </table>

    <!-- 1. SECTION PRESENSI -->
    @if(in_array($jenis_data, ['semua', 'presensi']))
    <div class="section-title">I. REKAPITULASI PRESENSI KEHADIRAN (Total: {{ $totals['presensi'] }})</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 80px;">Tanggal</th>
                @if(!$peserta_info)
                <th style="width: 120px;">Peserta</th>
                @endif
                <th style="width: 65px;">Masuk</th>
                <th style="width: 65px;">Pulang</th>
                <th style="width: 100px;">Tipe Lokasi</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($presensi as $index => $item)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y') }}</td>
                    @if(!$peserta_info)
                    <td>{{ $item->peserta->nama ?? '-' }}</td>
                    @endif
                    <td>{{ $item->jam_masuk ?? '-' }}</td>
                    <td>{{ $item->jam_pulang ?? '-' }}</td>
                    <td>
                        {{ ucfirst($item->lokasi_tipe ?? 'instansi') }}
                        @if($item->lokasi_tipe === 'luar' && $item->keterangan_luar)
                            <br><small style="color: #444;">({{ $item->keterangan_luar }})</small>
                        @endif
                    </td>
                    <td><strong>{{ $item->status }}</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ !$peserta_info ? 7 : 6 }}" style="text-align: center;">Belum ada data presensi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    @endif

    <!-- 2. SECTION LOGBOOK -->
    @if(in_array($jenis_data, ['semua', 'logbook']))
    <div class="section-title">II. REKAPITULASI LOGBOOK KEGIATAN (Total: {{ $totals['logbook'] }})</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 80px;">Tanggal</th>
                @if(!$peserta_info)
                <th style="width: 120px;">Peserta</th>
                @endif
                <th style="width: 140px;">Judul Kegiatan</th>
                <th>Deskripsi & Kendala</th>
                <th style="width: 70px;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logbook as $index => $log)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($log->tanggal)->translatedFormat('d F Y') }}</td>
                    @if(!$peserta_info)
                    <td>{{ $log->peserta->nama ?? '-' }}</td>
                    @endif
                    <td><strong>{{ $log->judul_kegiatan }}</strong></td>
                    <td>
                        {{ $log->deskripsi }}
                        @if($log->kendala)
                            <br><em>Kendala: {{ $log->kendala }}</em>
                        @endif
                    </td>
                    <td>{{ $log->status }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ !$peserta_info ? 6 : 5 }}" style="text-align: center;">Belum ada logbook.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    @endif

    <!-- 3. SECTION TUGAS -->
    @if(in_array($jenis_data, ['semua', 'tugas']))
    <div class="section-title">III. REKAPITULASI TUGAS MAGANG (Total: {{ $totals['tugas'] }})</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 85px;">Deadline</th>
                @if(!$peserta_info)
                <th style="width: 120px;">Peserta</th>
                @endif
                <th style="width: 150px;">Judul Tugas</th>
                <th style="width: 90px;">Status</th>
                <th>Terakhir Submit / Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($tugas as $index => $tg)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $tg->deadline ? \Carbon\Carbon::parse($tg->deadline)->translatedFormat('d F Y') : '-' }}</td>
                    @if(!$peserta_info)
                    <td>{{ $tg->peserta->nama ?? '-' }}</td>
                    @endif
                    <td><strong>{{ $tg->judul }}</strong></td>
                    <td><strong>{{ $tg->status }}</strong></td>
                    <td>
                        @if($tg->pengumpulanTerakhir)
                            Submit: {{ \Carbon\Carbon::parse($tg->pengumpulanTerakhir->tanggal_submit)->translatedFormat('d F Y H:i') }} WIB
                            @if($tg->pengumpulanTerakhir->catatan_revisi)
                                <br><em>Catatan: {{ $tg->pengumpulanTerakhir->catatan_revisi }}</em>
                            @endif
                        @else
                            Belum Mengumpulkan
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ !$peserta_info ? 6 : 5 }}" style="text-align: center;">Belum ada tugas magang.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    @endif

    <div class="footer">
        <div class="signature-box">
            <p>Kendal, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
            <p>Penanggung Jawab / Pembimbing,</p>
            <br><br><br>
            <p><strong>( ........................................ )</strong></p>
        </div>
        <div class="clear"></div>
    </div>

</body>
</html>
