<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RekapitulasiKehadiranExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $rekapList;
    protected $rowNumber = 0;

    public function __construct($rekapList)
    {
        $this->rekapList = $rekapList;
    }

    public function collection()
    {
        return collect($this->rekapList);
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Peserta',
            'NIM/NIS',
            'Jurusan',
            'Total Hari Tercatat',
            'Jumlah Hadir',
            'Jumlah Terlambat/Pulang Cepat',
            'Jumlah Alpha',
            'Jumlah Presensi Kegiatan Luar',
            'Persentase Kehadiran',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        $row = (object)$row;

        return [
            $this->rowNumber,
            $row->nama ?? '-',
            $row->nim_nis ?? '-',
            $row->jurusan ?? '-',
            $row->total_hari ?? 0,
            $row->jumlah_hadir ?? 0,
            $row->jumlah_terlambat_cepat ?? 0,
            $row->jumlah_alpha ?? 0,
            $row->jumlah_kegiatan_luar ?? 0,
            ($row->persentase_kehadiran ?? 0) . '%',
        ];
    }

    public function title(): string
    {
        return 'Rekapitulasi Kehadiran';
    }
}
