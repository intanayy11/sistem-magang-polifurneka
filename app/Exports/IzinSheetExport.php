<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class IzinSheetExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $izinList;
    protected $rowNumber = 0;

    public function __construct($izinList)
    {
        $this->izinList = $izinList;
    }

    public function collection()
    {
        return $this->izinList;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Peserta',
            'Jenis (Izin/Sakit)',
            'Tanggal Mulai',
            'Tanggal Selesai',
            'Keterangan',
            'Status',
            'Diverifikasi Oleh',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            $row->peserta?->nama ?? '-',
            $row->jenis,
            $row->tanggal_mulai,
            $row->tanggal_selesai,
            $row->keterangan ?? '-',
            $row->status,
            $row->pembimbing?->nama ?? '-',
        ];
    }

    public function title(): string
    {
        return 'Pengajuan Izin';
    }
}
