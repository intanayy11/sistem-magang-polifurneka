import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyle = (val) => {
    switch (val) {
      // Presensi Status
      case 'Hadir':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Terlambat':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pulang Cepat':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Alpha':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // Izin & Logbook Status
      case 'Menunggu':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'Disetujui':
      case 'Approve':
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Revisi':
      case 'Perlu Revisi':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      // Tugas Status
      case 'Belum Dikerjakan':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Menunggu Review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle(status)}`}>
      {status || '-'}
    </span>
  );
};

export default StatusBadge;
