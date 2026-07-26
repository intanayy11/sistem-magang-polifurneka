<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\PlottingBimbingan;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function exportRekapPdf(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'peserta') {
            return response()->json([
                'status' => 'error',
                'message' => 'Export PDF rekap hanya tersedia untuk Peserta Magang.'
            ], 403);
        }

        $plotting = PlottingBimbingan::where('peserta_id', $user->user_id)
            ->with('pembimbing:user_id,nama')
            ->first();

        $presensiList = Presensi::where('peserta_id', $user->user_id)
            ->orderBy('tanggal', 'asc')
            ->get();

        $logbookList = Logbook::where('peserta_id', $user->user_id)
            ->where('status', 'Approve')
            ->orderBy('tanggal', 'asc')
            ->get();

        $pdf = Pdf::loadView('pdf.rekap', [
            'user' => $user,
            'plotting' => $plotting,
            'presensiList' => $presensiList,
            'logbookList' => $logbookList,
            'generatedAt' => now()->format('d F Y H:i:s'),
        ]);

        return $pdf->download('Rekap_Magang_' . str_replace(' ', '_', $user->nama) . '.pdf');
    }
}
