<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AktivitasMagangMultiSheetExport implements WithMultipleSheets
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        return [
            new PresensiSheetExport($this->data['presensi'] ?? collect()),
            new LogbookSheetExport($this->data['logbook'] ?? collect()),
            new PenugasanSheetExport($this->data['tugas'] ?? collect()),
            new IzinSheetExport($this->data['izin'] ?? collect()),
        ];
    }
}
