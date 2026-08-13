<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PresensiSheetExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $presensiList;
    protected $rowNumber = 0;

    public function __construct($presensiList)
    {
        $this->presensiList = $presensiList;
    }

    public function collection()
    {
        return $this->presensiList;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Peserta',
            'Tanggal',
            'Jam Masuk',
            'Jam Pulang',
            'Status',
            'Tipe Lokasi',
            'Keterangan Kegiatan Luar',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            $row->peserta?->nama ?? '-',
            $row->tanggal,
            $row->jam_masuk ? date('H:i', strtotime($row->jam_masuk)) : '-',
            $row->jam_pulang ? date('H:i', strtotime($row->jam_pulang)) : '-',
            $row->status,
            ucfirst($row->lokasi_tipe ?? 'Instansi'),
            $row->lokasi_tipe === 'luar' ? ($row->keterangan_luar ?? '-') : '',
        ];
    }

    public function title(): string
    {
        return 'Presensi';
    }
}
