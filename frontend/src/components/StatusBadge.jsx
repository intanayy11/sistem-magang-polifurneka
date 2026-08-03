import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyle = (val) => {
    switch (val) {
      // Presensi Status
      case 'Hadir':
        return 'text-emerald-700 font-bold';
      case 'Terlambat':
        return 'text-amber-800 font-bold';
      case 'Pulang Cepat':
        return 'text-amber-900 font-bold';
      case 'Alpha':
        return 'text-rose-700 font-bold';

      // Izin & Logbook Status
      case 'Menunggu':
        return 'text-amber-800 font-bold';
      case 'Disetujui':
      case 'Approve':
      case 'Selesai':
        return 'text-emerald-700 font-bold';
      case 'Ditolak':
        return 'text-rose-700 font-bold';
      case 'Revisi':
      case 'Perlu Revisi':
        return 'text-amber-900 font-bold';

      // Tugas Status
      case 'Belum Dikerjakan':
        return 'text-slate-500 font-bold';
      case 'Menunggu Review':
        return 'text-indigo-700 font-bold';

      default:
        return 'text-slate-600 font-bold';
    }
  };

  return (
    <span className={`inline-flex items-center text-xs ${getStyle(status)}`}>
      {status || '-'}
    </span>
  );
};

export default StatusBadge;
