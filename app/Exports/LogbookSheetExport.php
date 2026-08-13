<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class LogbookSheetExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $logbookList;
    protected $rowNumber = 0;

    public function __construct($logbookList)
    {
        $this->logbookList = $logbookList;
    }

    public function collection()
    {
        return $this->logbookList;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Peserta',
            'Tanggal',
            'Judul Kegiatan',
            'Deskripsi',
            'Kendala',
            'Status',
            'Catatan Pembimbing',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            $row->peserta?->nama ?? '-',
            $row->tanggal,
            $row->judul_kegiatan,
            $row->deskripsi ?? '-',
            $row->kendala ?? '-',
            $row->status,
            $row->catatan_pembimbing ?? '-',
        ];
    }

    public function title(): string
    {
        return 'Logbook';
    }
}
