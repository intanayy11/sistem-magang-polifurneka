import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getStorageUrl } from '../../utils/url';
import {
  Users,
  Link2,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  Calendar as CalendarIcon,
  Plus,
  BarChart3,
  BookOpen,
  CheckSquare,
  Search
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/admin/kelola-user?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getAvatar = (userObj, sizeClass = 'h-10 w-10 text-sm font-bold', roundClass = 'rounded-full') => {
    if (userObj?.foto_profil) {
      return (
        <img
          src={getStorageUrl(userObj.foto_profil)}
          alt={userObj?.nama}
          className={`${sizeClass} ${roundClass} object-cover border-2 border-white shadow-2xs shrink-0`}
        />
      );
    }
    return (
      <div className={`${sizeClass} ${roundClass} bg-amber-100 text-amber-900 font-bold flex items-center justify-center border border-amber-200 shadow-2xs shrink-0`}>
        {userObj?.nama ? userObj.nama.charAt(0).toUpperCase() : 'A'}
      </div>
    );
  };

  const {
    total_users = 0,
    total_peserta = 0,
    total_pembimbing = 0,
    total_plotting = 0,
    presensi_stats = { total: 0, hadir_tepat_waktu: 0, terlambat: 0, izin_sakit: 0, alpha: 0, persentase_kehadiran: 0 },
    logbook_stats = { total: 0, disetujui: 0, menunggu: 0, revisi: 0 },
    tugas_stats = { total: 0, selesai: 0, menunggu_review: 0, perlu_revisi: 0, belum_dikerjakan: 0 }
  } = stats || {};

  const today = new Date();
  const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Helper persentase aman
  const calcPercent = (val, total) => {
    if (!total || total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── HEADER DASHBOARD: GREETING & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {user?.nama || 'Administrator'}
          </h1>
        </div>

        {/* Akses Kanan: Tombol + Tambah User & Card Calendar Mini */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            onClick={() => navigate('/admin/tambah-user')}
            className="btn-poli-primary px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 shadow-xs"
          >
            <Plus size={16} />
            <span>Tambah User</span>
          </button>

          {/* Card Calendar Mini Widget */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-900">
              <CalendarIcon size={16} className="text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">{dayName}</div>
              <div className="text-[11px] font-semibold text-slate-500">{dateStr}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP SECTION: 2x2 SUMMARY METRICS (LEFT) & TINGKAT KEHADIRAN (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: 4 SUMMARY METRICS CARDS (2x2 GRID - COMPACT) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Card 1: Total Pengguna */}
          <div
            onClick={() => navigate('/admin/kelola-user')}
            className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Users size={20} className="text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {total_users}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Total Pengguna
              </p>
            </div>
          </div>

          {/* Card 2: Peserta Magang */}
          <div
            onClick={() => navigate('/admin/kelola-user?role=peserta')}
            className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {total_peserta}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Peserta Magang
              </p>
            </div>
          </div>

          {/* Card 3: Pembimbing Lapangan */}
          <div
            onClick={() => navigate('/admin/kelola-user?role=pembimbing')}
            className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {total_pembimbing}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Pembimbing Lapangan
              </p>
            </div>
          </div>

          {/* Card 4: Plotting Pasangan */}
          <div
            onClick={() => navigate('/admin/plotting')}
            className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Link2 size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {total_plotting}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Plotting Bimbingan
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT: TINGKAT KEHADIRAN & KEDISIPLINAN (EXPANDED TO LEFT) */}
        <div className="lg:col-span-7 card-clean p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Tingkat Kehadiran & Kedisiplinan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Statistik akumulasi presensi peserta
                  </p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                {presensi_stats.persentase_kehadiran}%
              </span>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${calcPercent(presensi_stats.hadir_tepat_waktu, presensi_stats.total)}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Hadir Tepat Waktu: ${presensi_stats.hadir_tepat_waktu}`}
                />
                <div
                  style={{ width: `${calcPercent(presensi_stats.terlambat, presensi_stats.total)}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`Terlambat: ${presensi_stats.terlambat}`}
                />
                <div
                  style={{ width: `${calcPercent(presensi_stats.izin_sakit, presensi_stats.total)}%` }}
                  className="bg-sky-400 transition-all duration-500"
                  title={`Izin/Sakit: ${presensi_stats.izin_sakit}`}
                />
                <div
                  style={{ width: `${calcPercent(presensi_stats.alpha, presensi_stats.total)}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Alpha: ${presensi_stats.alpha}`}
                />
              </div>
            </div>

            {/* Grid 4 Kartu Status Presensi (2x2) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-left">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Tepat Waktu</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1">{presensi_stats.hadir_tepat_waktu}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.hadir_tepat_waktu, presensi_stats.total)}% dari total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-left">
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Terlambat</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1">{presensi_stats.terlambat}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.terlambat, presensi_stats.total)}% dari total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-left">
                <div className="flex items-center gap-1.5 text-sky-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Izin & Sakit</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1">{presensi_stats.izin_sakit}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.izin_sakit, presensi_stats.total)}% dari total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-left">
                <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Alpha</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1">{presensi_stats.alpha}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.alpha, presensi_stats.total)}% dari total
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 2. STATISTIK PROGRES AKTIVITAS (LOGBOOK & PENUGASAN) (2 EQUAL COLUMNS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box A: Progres Logbook Kegiatan */}
        <div className="card-clean p-5 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80">
                <BookOpen size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Status Logbook Kegiatan</h4>
                <span className="text-xs text-slate-400 font-medium">{logbook_stats.total} total logbook diinput</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/laporan?kategori=aktivitas_magang')}
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Disetujui</span>
                <span className="text-emerald-700 font-bold">{logbook_stats.disetujui} ({calcPercent(logbook_stats.disetujui, logbook_stats.total)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${calcPercent(logbook_stats.disetujui, logbook_stats.total)}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Menunggu Review</span>
                <span className="text-amber-700 font-bold">{logbook_stats.menunggu} ({calcPercent(logbook_stats.menunggu, logbook_stats.total)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${calcPercent(logbook_stats.menunggu, logbook_stats.total)}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Perlu Revisi</span>
                <span className="text-rose-700 font-bold">{logbook_stats.revisi} ({calcPercent(logbook_stats.revisi, logbook_stats.total)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${calcPercent(logbook_stats.revisi, logbook_stats.total)}%` }}
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Box B: Progres Penugasan Magang */}
        <div className="card-clean p-5 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200/80">
                <CheckSquare size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Status Penugasan Magang</h4>
                <span className="text-xs text-slate-400 font-medium">{tugas_stats.total} total tugas diberikan</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/laporan?kategori=aktivitas_magang')}
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Selesai Dinilai</span>
                <span className="text-emerald-700 font-bold">{tugas_stats.selesai} ({calcPercent(tugas_stats.selesai, tugas_stats.total)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${calcPercent(tugas_stats.selesai, tugas_stats.total)}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Menunggu Review</span>
                <span className="text-indigo-700 font-bold">{tugas_stats.menunggu_review} ({calcPercent(tugas_stats.menunggu_review, tugas_stats.total)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${calcPercent(tugas_stats.menunggu_review, tugas_stats.total)}%` }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Belum / Perlu Revisi</span>
                <span className="text-slate-700 font-bold">
                  {tugas_stats.belum_dikerjakan + tugas_stats.perlu_revisi} ({calcPercent(tugas_stats.belum_dikerjakan + tugas_stats.perlu_revisi, tugas_stats.total)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${calcPercent(tugas_stats.belum_dikerjakan + tugas_stats.perlu_revisi, tugas_stats.total)}%` }}
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
