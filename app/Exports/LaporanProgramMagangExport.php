<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class LaporanProgramMagangExport implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        $cards = $this->data['summary_cards'] ?? [];
        $tugas = $cards['tugas_stats'] ?? [];
        $logbook = $cards['logbook_stats'] ?? [];

        return collect([
            ['Metrik Program Magang', 'Nilai'],
            ['Periode Data', $this->data['periode_teks'] ?? 'Semua Periode'],
            ['Total Peserta Magang Aktif', $cards['total_peserta_aktif'] ?? 0],
            ['Total Peserta Magang Selesai', $cards['total_peserta_selesai'] ?? 0],
            ['Total Pembimbing Lapangan Aktif', $cards['total_pembimbing_aktif'] ?? 0],
            ['Rata-rata Kehadiran Peserta (%)', ($cards['rata_kehadiran'] ?? 0) . '%'],
            ['---------------------------------', '------------------'],
            ['Statistik Penugasan Magang', ''],
            ['Tugas Selesai', $tugas['selesai'] ?? 0],
            ['Tugas Menunggu Review', $tugas['menunggu_review'] ?? 0],
            ['Tugas Perlu Revisi', $tugas['perlu_revisi'] ?? 0],
            ['Tugas Belum Dikerjakan', $tugas['belum_dikerjakan'] ?? 0],
            ['Total Penugasan Diberikan', $tugas['total'] ?? 0],
            ['---------------------------------', '------------------'],
            ['Statistik Logbook Kegiatan', ''],
            ['Logbook Disetujui (Approve)', $logbook['approve'] ?? 0],
            ['Logbook Menunggu Verifikasi', $logbook['menunggu'] ?? 0],
            ['Logbook Perlu Revisi', $logbook['revisi'] ?? 0],
            ['Total Logbook Ter catat', $logbook['total'] ?? 0],
        ]);
    }

    public function headings(): array
    {
        return [
            'Ringkasan Laporan Program Magang Resmi Polifurneka',
            ''
        ];
    }

    public function title(): string
    {
        return 'Ringkasan Program Magang';
    }
}
