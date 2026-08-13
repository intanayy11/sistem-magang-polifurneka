<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class DataPesertaExport implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $pesertaList;
    protected $rowNumber = 0;

    public function __construct($pesertaList)
    {
        $this->pesertaList = $pesertaList;
    }

    public function collection()
    {
        return $this->pesertaList;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Peserta',
            'NIM/NIS',
            'Email',
            'No. HP',
            'Jurusan',
            'Posisi Magang',
            'Nama Pembimbing',
            'Tanggal Mulai Magang',
            'Tanggal Selesai Magang',
            'Status Periode',
            'Status Akun',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            $row->nama,
            $row->nim_nis ?? '-',
            $row->email,
            $row->no_hp ?? '-',
            $row->jurusan ?? '-',
            $row->posisi_magang ?? '-',
            $row->pembimbing_nama ?? ($row->plottingAsPeserta?->pembimbing?->nama ?? 'Belum Diplotting'),
            $row->tanggal_mulai_magang ?? '-',
            $row->tanggal_selesai_magang ?? '-',
            $row->is_magang_selesai ? 'Selesai' : 'Aktif',
            $row->status_aktif ? 'Aktif' : 'Nonaktif',
        ];
    }

    public function title(): string
    {
        return 'Data Peserta Magang';
    }
}
