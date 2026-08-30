import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  BookOpen,
  FileCheck,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

const PembimbingDashboard = () => {
  const { user } = useAuth();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  const {
    total_peserta = 0,
    total_logbook_pending = 0,
    total_izin_pending = 0,
    total_tugas_review = 0,
    peserta_bimbingan = []
  } = data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ── BENTO CARD 1: HERO BANNER ── */}
      <div className="card-bento bg-gradient-to-r from-[#FFFBEB] via-white to-[#FEF9E7] border border-amber-200/70 text-slate-900 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
        {/* Subtle Amber Glow Blur */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E8A800]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-end">
            <span className="text-xs font-semibold text-slate-500 font-mono bg-white/80 backdrop-blur-xs px-3 py-1 rounded-xl border border-slate-200/80">
              {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.nama || 'Pembimbing'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed font-medium">
              Kelola bimbingan, review logbook harian, verifikasi izin, dan evaluasi tugas mahasiswa magang Polifurneka.
            </p>
          </div>
        </div>


      </div>


      {/* ── BENTO CARD 2: SUMMARY METRICS GRID (4 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Peserta */}
        <div
          onClick={() => navigate('/pembimbing/monitor-presensi')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/40 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta Bimbingan</span>
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_peserta}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Mahasiswa bimbingan</span>
              <ArrowUpRight size={13} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 2: Logbook Pending */}
        <div
          onClick={() => navigate('/pembimbing/review-logbook')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Logbook Pending</span>
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 group-hover:scale-110 transition-transform">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_logbook_pending}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Menunggu review</span>
              <ArrowUpRight size={13} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 3: Izin Pending */}
        <div
          onClick={() => navigate('/pembimbing/verifikasi-izin')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-purple-50/40 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Izin Pending</span>
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_izin_pending}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Pengajuan izin / sakit</span>
              <ArrowUpRight size={13} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 4: Tugas Review */}
        <div
          onClick={() => navigate('/pembimbing/kelola-tugas')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/40 hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tugas Review</span>
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_tugas_review}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Perlu dikoreksi</span>
              <ArrowUpRight size={13} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

      </div>

      {/* ── BENTO CARD 3: DAFTAR MAHASISWA BANTUAN BENTO TABLE ── */}
      <div className="card-bento overflow-hidden p-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#E8A800]" />
            <h3 className="font-bold text-slate-900 text-sm">Daftar Mahasiswa Magang Bimbingan</h3>
          </div>
          <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
            {peserta_bimbingan.length} Mahasiswa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Mahasiswa</th>
                <th className="px-5 py-3.5">NIM / NIS</th>
                <th className="px-5 py-3.5">Kontak / Email</th>
                <th className="px-5 py-3.5 text-center">Logbook Pending</th>
                <th className="px-5 py-3.5 text-center">Izin Pending</th>
                <th className="px-5 py-3.5 text-center">Tugas Review</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {peserta_bimbingan.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                    Belum ada mahasiswa yang diplotting ke dalam bimbingan Anda.
                  </td>
                </tr>
              ) : (
                peserta_bimbingan.map((p) => {
                  const initial = p.nama ? p.nama.charAt(0).toUpperCase() : 'M';
                  return (
                    <tr key={p.user_id} className="hover:bg-amber-50/50 transition-colors group">
                      {/* Column 1: Student Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs group-hover:text-amber-900 transition-colors flex items-center gap-1.5 flex-wrap">
                              <span>{p.nama}</span>
                              {p.is_magang_selesai && (
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                  Selesai Magang
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Mahasiswa Magang</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: NIM */}
                      <td className="px-5 py-4 font-mono font-semibold text-slate-700">{p.nim_nis || '-'}</td>

                      {/* Column 3: Contact */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">{p.email}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{p.no_hp || '-'}</div>
                      </td>

                      {/* Column 4: Logbook Pending */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => navigate('/pembimbing/review-logbook')}
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all ${
                            p.logbook_pending_count > 0
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.logbook_pending_count}
                        </button>
                      </td>

                      {/* Column 5: Izin Pending */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => navigate('/pembimbing/verifikasi-izin')}
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all ${
                            p.izin_pending_count > 0
                              ? 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.izin_pending_count}
                        </button>
                      </td>

                      {/* Column 6: Tugas Review */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => navigate('/pembimbing/kelola-tugas')}
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all ${
                            p.tugas_review_count > 0
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.tugas_review_count}
                        </button>
                      </td>

                      {/* Column 7: Quick Link Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate('/pembimbing/review-logbook')}
                          className="inline-flex items-center gap-1 text-xs text-amber-900 bg-amber-100/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl font-bold transition-all"
                        >
                          <span>Review</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PembimbingDashboard;
