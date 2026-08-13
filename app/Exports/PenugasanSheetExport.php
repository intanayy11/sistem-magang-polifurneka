<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PenugasanSheetExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $tugasList;
    protected $rowNumber = 0;

    public function __construct($tugasList)
    {
        $this->tugasList = $tugasList;
    }

    public function collection()
    {
        return $this->tugasList;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Peserta',
            'Judul Tugas',
            'Deskripsi Tugas',
            'Pembimbing',
            'Tanggal Dibuat',
            'Deadline',
            'Status',
            'Jumlah Pengumpulan/Revisi',
            'Catatan Revisi Terakhir',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        $pengumpulan = $row->pengumpulanTerakhir;
        $catatanRevisi = $pengumpulan?->catatan_revisi ?? '-';
        $jumlahPengumpulan = $row->pengumpulan_tugas_count ?? ($row->pengumpulan_count ?? 0);

        return [
            $this->rowNumber,
            $row->peserta?->nama ?? '-',
            $row->judul,
            $row->deskripsi ?? '-',
            $row->pembimbing?->nama ?? '-',
            $row->created_at ? date('Y-m-d H:i', strtotime($row->created_at)) : '-',
            $row->deadline ? date('Y-m-d H:i', strtotime($row->deadline)) : '-',
            $row->status,
            $jumlahPengumpulan,
            $catatanRevisi,
        ];
    }

    public function title(): string
    {
        return 'Penugasan';
    }
}
