<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class DataPembimbingExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $pembimbingList;
    protected $rowNumber = 0;

    public function __construct($pembimbingList)
    {
        $this->pembimbingList = $pembimbingList;
    }

    public function collection()
    {
        return $this->pembimbingList;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Pembimbing',
            'Email',
            'No. HP',
            'Jabatan',
            'Jumlah Peserta Bimbingan',
            'Daftar Nama Peserta Bimbingan',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        $pesertaNames = $row->daftar_peserta_bimbingan ?? ($row->plottingAsPembimbing?->map(fn($p) => $p->peserta?->nama)->filter()->implode(', ') ?? '-');
        if (empty($pesertaNames)) $pesertaNames = '-';

        return [
            $this->rowNumber,
            $row->nama,
            $row->email,
            $row->no_hp ?? '-',
            $row->jabatan ?? '-',
            $row->total_bimbingan ?? ($row->plotting_as_pembimbing_count ?? 0),
            $pesertaNames,
        ];
    }

    public function title(): string
    {
        return 'Data Pembimbing';
    }
}
