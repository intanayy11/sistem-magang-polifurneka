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
        <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0; text-decoration: underline; letter-spacing: 0.5px;">
            LAPORAN REKAPITULASI {{ strtoupper(str_replace('_', ' ', $kategori_laporan ?? 'aktivitas_magang')) }}
        </h3>
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
            <td class="filter-label">Kategori Laporan</td>
            <td>: <strong>{{ strtoupper(str_replace('_', ' ', $kategori_laporan ?? 'aktivitas_magang')) }}</strong></td>
            <td class="filter-label">Tanggal Cetak</td>
            <td>: {{ $generatedAt }} WIB</td>
        </tr>
        @if(isset($peserta_info) && $peserta_info)
        <tr>
            <td class="filter-label">Peserta Spesifik</td>
            <td colspan="3">: {{ $peserta_info->nama }} ({{ $peserta_info->nim_nis ?? '-' }})</td>
        </tr>
        @endif
        @if(isset($jurusan_filter) || isset($posisi_filter) || isset($jabatan_filter))
        <tr>
            <td class="filter-label">Filter Tambahan</td>
            <td colspan="3">: {{ $jurusan_filter ?? '' }} {{ $posisi_filter ?? '' }} {{ $jabatan_filter ?? '' }}</td>
        </tr>
        @endif
    </table>

    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    {{-- KATEGORI 1: AKTIVITAS MAGANG                                         --}}
    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    @if(($kategori_laporan ?? 'aktivitas_magang') === 'aktivitas_magang')
        <!-- 1. SECTION PRESENSI -->
        @if($include_presensi)
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
        @if($include_logbook)
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
        @if($include_tugas)
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

        <!-- 4. SECTION IZIN -->
        @if(isset($include_izin) && $include_izin)
        <div class="section-title">IV. REKAPITULASI PENGAJUAN IZIN / SAKIT (Total: {{ $totals['izin'] }})</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25px; text-align: center;">No</th>
                    <th style="width: 100px;">Jenis & Status</th>
                    @if(!$peserta_info)
                    <th style="width: 120px;">Peserta</th>
                    @endif
                    <th style="width: 140px;">Rentang Tanggal</th>
                    <th>Keterangan / Alasan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($izin as $index => $iz)
                    <tr>
                        <td style="text-align: center;">{{ $index + 1 }}</td>
                        <td><strong>{{ $iz->jenis }}</strong> ({{ $iz->status }})</td>
                        @if(!$peserta_info)
                        <td>{{ $iz->peserta->nama ?? '-' }}</td>
                        @endif
                        <td>
                            {{ \Carbon\Carbon::parse($iz->tanggal_mulai)->translatedFormat('d F Y') }} s/d<br>
                            {{ \Carbon\Carbon::parse($iz->tanggal_selesai)->translatedFormat('d F Y') }}
                        </td>
                        <td>{{ $iz->keterangan ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ !$peserta_info ? 5 : 4 }}" style="text-align: center;">Belum ada pengajuan izin.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        @endif
    @endif

    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    {{-- KATEGORI 2: DATA PESERTA                                             --}}
    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    @if(($kategori_laporan ?? '') === 'data_peserta')
        @if(($mode_tampilan ?? 'daftar') === 'rekap_kategori')
            <div class="section-title">REKAPITULASI PESERTA PER {{ strtoupper(str_replace('_', ' ', $rekap_by ?? 'jurusan')) }} (Total: {{ $totals['total_peserta'] }})</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 30px; text-align: center;">No</th>
                        <th>Kelompok / Kategori ({{ ucfirst(str_replace('_', ' ', $rekap_by ?? 'jurusan')) }})</th>
                        <th style="width: 120px; text-align: center;">Jumlah Peserta</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($rekap_grouped as $index => $group)
                        <tr>
                            <td style="text-align: center;">{{ $index + 1 }}</td>
                            <td><strong>{{ $group['kategori_label'] }}</strong></td>
                            <td style="text-align: center;"><strong>{{ $group['total_peserta'] }} Peserta</strong></td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" style="text-align: center;">Tidak ada data peserta.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        @else
            <div class="section-title">BIODATA SELURUH PESERTA MAGANG (Total: {{ $totals['total_peserta'] }})</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 25px; text-align: center;">No</th>
                        <th style="width: 110px;">Nama Peserta</th>
                        <th style="width: 80px;">NIM / NIS</th>
                        <th style="width: 100px;">Jurusan</th>
                        <th style="width: 90px;">Posisi</th>
                        <th style="width: 100px;">Pembimbing</th>
                        <th style="width: 130px;">Periode Magang</th>
                        <th style="width: 60px;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($peserta_list as $index => $p)
                        <tr>
                            <td style="text-align: center;">{{ $index + 1 }}</td>
                            <td><strong>{{ $p->nama }}</strong><br><small>{{ $p->email }}</small></td>
                            <td>{{ $p->nim_nis ?? '-' }}</td>
                            <td>{{ $p->jurusan ?? '-' }}</td>
                            <td>{{ $p->posisi_magang ?? '-' }}</td>
                            <td>{{ $p->pembimbing_nama }}</td>
                            <td>
                                {{ $p->tanggal_mulai_magang ? \Carbon\Carbon::parse($p->tanggal_mulai_magang)->translatedFormat('d F Y') : '-' }} s/d<br>
                                {{ $p->tanggal_selesai_magang ? \Carbon\Carbon::parse($p->tanggal_selesai_magang)->translatedFormat('d F Y') : '-' }}
                            </td>
                            <td><strong>{{ $p->is_magang_selesai ? 'Selesai' : 'Aktif' }}</strong></td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" style="text-align: center;">Tidak ada data peserta.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        @endif
    @endif

    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    {{-- KATEGORI 3: DATA PEMBIMBING                                          --}}
    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    @if(($kategori_laporan ?? '') === 'data_pembimbing')
        <div class="section-title">BIODATA PEMBIMBING LAPANGAN (Total: {{ $totals['total_pembimbing'] }})</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px; text-align: center;">No</th>
                    <th>Nama Pembimbing</th>
                    <th>Email Terdaftar</th>
                    <th>Jabatan</th>
                    <th style="width: 120px; text-align: center;">Jumlah Bimbingan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($pembimbing_list as $index => $pem)
                    <tr>
                        <td style="text-align: center;">{{ $index + 1 }}</td>
                        <td><strong>{{ $pem->nama }}</strong></td>
                        <td>{{ $pem->email }}</td>
                        <td>{{ $pem->jabatan ?? '-' }}</td>
                        <td style="text-align: center;"><strong>{{ $pem->total_bimbingan }} Peserta</strong></td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center;">Tidak ada data pembimbing.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    {{-- KATEGORI 4: REKAPITULASI KEHADIRAN                                   --}}
    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    @if(($kategori_laporan ?? '') === 'rekapitulasi_kehadiran')
        <div class="section-title">STATISTIK REKAPITULASI KEHADIRAN PESERTA (Total: {{ $totals['total_peserta'] }})</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25px; text-align: center;">No</th>
                    <th style="width: 130px;">Nama Peserta</th>
                    <th style="width: 80px;">NIM / NIS</th>
                    <th style="width: 100px;">Jurusan</th>
                    <th style="width: 60px; text-align: center;">Total Hari</th>
                    <th style="width: 50px; text-align: center;">Hadir</th>
                    <th style="width: 70px; text-align: center;">Telat/Cepat</th>
                    <th style="width: 50px; text-align: center;">Alpha</th>
                    <th style="width: 70px; text-align: center;">Persentase</th>
                </tr>
            </thead>
            <tbody>
                @forelse($rekap_kehadiran as $index => $rk)
                    <tr>
                        <td style="text-align: center;">{{ $index + 1 }}</td>
                        <td><strong>{{ $rk['nama'] }}</strong></td>
                        <td>{{ $rk['nim_nis'] }}</td>
                        <td>{{ $rk['jurusan'] }}</td>
                        <td style="text-align: center;">{{ $rk['total_hari'] }}</td>
                        <td style="text-align: center;">{{ $rk['jumlah_hadir'] }}</td>
                        <td style="text-align: center;">{{ $rk['jumlah_terlambat_cepat'] }}</td>
                        <td style="text-align: center;">{{ $rk['jumlah_alpha'] }}</td>
                        <td style="text-align: center;"><strong>{{ $rk['persentase_kehadiran'] }}%</strong></td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="9" style="text-align: center;">Tidak ada data statistik kehadiran.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    {{-- KATEGORI 5: LAPORAN PROGRAM MAGANG                                   --}}
    {{-- ═════════════════════════════════════════════════════════════════════ --}}
    @if(($kategori_laporan ?? '') === 'laporan_program_magang')
        <div class="section-title">RINGKASAN LINTAS DOMAIN PROGRAM MAGANG</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 250px;">Nama Indikator / Metrik Program</th>
                    <th>Nilai Akumulasi Laporan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Total Peserta Magang Aktif</strong></td>
                    <td>{{ $summary_cards['total_peserta_aktif'] }} Peserta</td>
                </tr>
                <tr>
                    <td><strong>Total Peserta Selesai Magang</strong></td>
                    <td>{{ $summary_cards['total_peserta_selesai'] }} Peserta</td>
                </tr>
                <tr>
                    <td><strong>Total Pembimbing Lapangan Aktif</strong></td>
                    <td>{{ $summary_cards['total_pembimbing_aktif'] }} Pembimbing</td>
                </tr>
                <tr>
                    <td><strong>Rata-Rata Kehadiran Seluruh Peserta</strong></td>
                    <td><strong>{{ $summary_cards['rata_kehadiran'] }}%</strong></td>
                </tr>
                <tr>
                    <td><strong>Akumulasi Tugas Magang</strong></td>
                    <td>
                        Selesai: <strong>{{ $summary_cards['tugas_stats']['selesai'] }}</strong> | 
                        Perlu Revisi: <strong>{{ $summary_cards['tugas_stats']['perlu_revisi'] }}</strong> | 
                        Belum Dikerjakan: <strong>{{ $summary_cards['tugas_stats']['belum_dikerjakan'] }}</strong> | 
                        Menunggu Review: <strong>{{ $summary_cards['tugas_stats']['menunggu_review'] }}</strong> 
                        (Total: {{ $summary_cards['tugas_stats']['total'] }})
                    </td>
                </tr>
                <tr>
                    <td><strong>Akumulasi Logbook Kegiatan</strong></td>
                    <td>
                        Disetujui (Approve): <strong>{{ $summary_cards['logbook_stats']['approve'] }}</strong> | 
                        Menunggu: <strong>{{ $summary_cards['logbook_stats']['menunggu'] }}</strong> | 
                        Revisi: <strong>{{ $summary_cards['logbook_stats']['revisi'] }}</strong> 
                        (Total: {{ $summary_cards['logbook_stats']['total'] }})
                    </td>
                </tr>
            </tbody>
        </table>
    @endif

    <div class="footer">
        <div class="signature-box">
            <p>Kendal, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
            <p>Penanggung Jawab / Admin Instansi,</p>
            <br><br><br>
            <p><strong>( ........................................ )</strong></p>
        </div>
        <div class="clear"></div>
    </div>

</body>
</html>
