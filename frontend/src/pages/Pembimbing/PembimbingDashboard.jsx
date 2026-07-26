import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, BookOpen, FileCheck, CheckSquare, ArrowRight } from 'lucide-react';

const PembimbingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/pembimbing');
      if (res.data.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const { total_peserta, total_logbook_pending, total_izin_pending, total_tugas_review, peserta_bimbingan } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner - Clean White with Yellow Accent Stripe */}
      <div className="bg-white rounded-[18px] p-6 md:p-7 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#E8A800]" />
        
        <div className="pl-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Pembimbing Lapangan
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola bimbingan, review logbook harian, verifikasi izin, dan berikan evaluasi tugas mahasiswa magang Polifurneka.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta Bimbingan</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_peserta}</div>
            <p className="text-xs text-slate-400 mt-1">Mahasiswa di bawah bimbingan Anda</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logbook Perlu Review</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_logbook_pending}</div>
            <p className="text-xs text-slate-400 mt-1">Status menunggu persetujuan</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Izin Perlu Verifikasi</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_izin_pending}</div>
            <p className="text-xs text-slate-400 mt-1">Pengajuan izin / sakit</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas Perlu Review</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_tugas_review}</div>
            <p className="text-xs text-slate-400 mt-1">Hasil kerja telah dikumpulkan</p>
          </div>
        </div>
      </div>

      {/* Assigned Participants List */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Daftar Mahasiswa Magang Bimbingan</h3>
          <span className="text-xs text-slate-500 font-medium">{peserta_bimbingan.length} Mahasiswa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Nama Peserta</th>
                <th className="px-5 py-3.5">NIM / NIS</th>
                <th className="px-5 py-3.5">Kontak / Email</th>
                <th className="px-5 py-3.5 text-center">Logbook Pending</th>
                <th className="px-5 py-3.5 text-center">Izin Pending</th>
                <th className="px-5 py-3.5 text-center">Tugas Review</th>
                <th className="px-5 py-3.5 text-right">Aksi Quick Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {peserta_bimbingan.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada mahasiswa yang diplotting ke dalam bimbingan Anda.
                  </td>
                </tr>
              ) : (
                peserta_bimbingan.map((p) => (
                  <tr key={p.user_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{p.nama}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{p.nim_nis || '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{p.email}</div>
                      <div className="text-slate-400 text-[11px]">{p.no_hp || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.logbook_pending_count > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.logbook_pending_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.izin_pending_count > 0 ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.izin_pending_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.tugas_review_count > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.tugas_review_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate('/pembimbing/review-logbook')}
                        className="text-xs text-amber-700 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Review Logbook</span>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PembimbingDashboard;
