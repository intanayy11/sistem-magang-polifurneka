import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserCheck,
  Link2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  Calendar as CalendarIcon,
  Plus,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const {
    total_users = 0,
    total_peserta = 0,
    total_pembimbing = 0,
    total_plotting = 0,
    recent_activities = [],
    presensi_stats = { total: 0, hadir_tepat_waktu: 0, terlambat: 0, izin_sakit: 0, alpha: 0, persentase_kehadiran: 0 },
    logbook_stats = { total: 0, disetujui: 0, menunggu: 0, revisi: 0 },
    tugas_stats = { total: 0, selesai: 0, menunggu_review: 0, perlu_revisi: 0, belum_dikerjakan: 0 },
    mentor_workload = { rata_rata: 0, peserta_belum_plotting: 0, list: [] }
  } = stats || {};

  const getActivityIcon = (tipe) => {
    switch (tipe) {
      case 'presensi':
        return <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />;
      case 'logbook':
        return <FileText size={15} className="text-amber-600 shrink-0" />;
      case 'izin':
        return <AlertCircle size={15} className="text-rose-500 shrink-0" />;
      case 'tugas':
        return <Sparkles size={15} className="text-indigo-600 shrink-0" />;
      default:
        return <Activity size={15} className="text-slate-500 shrink-0" />;
    }
  };

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

      {/* ── HEADER SAPAAN & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {user?.nama || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Ringkasan statistik dan monitoring program magang Polifurneka.
          </p>
        </div>

        {/* Akses Kanan: Tombol + Tambah User & Card Calendar Mini */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
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

      {/* ── SUMMARY METRICS GRID (4 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pengguna */}
        <div
          onClick={() => navigate('/admin/kelola-user')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
            <div className="p-2.5 rounded-2xl bg-purple-100/80 text-purple-700 group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_users}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Akun terdaftar</span>
              <ArrowUpRight size={13} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 2: Peserta Magang */}
        <div
          onClick={() => navigate('/admin/kelola-user?role=peserta')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta Magang</span>
            <div className="p-2.5 rounded-2xl bg-amber-100/80 text-amber-900 group-hover:scale-110 transition-transform">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_peserta}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Mahasiswa magang</span>
              <ArrowUpRight size={13} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 3: Pembimbing Lapangan */}
        <div
          onClick={() => navigate('/admin/kelola-user?role=pembimbing')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pembimbing Lapangan</span>
            <div className="p-2.5 rounded-2xl bg-emerald-100/80 text-emerald-700 group-hover:scale-110 transition-transform">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_pembimbing}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Mentor instansi</span>
              <ArrowUpRight size={13} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 4: Plotting Pasangan */}
        <div
          onClick={() => navigate('/admin/plotting')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plotting Bimbingan</span>
            <div className="p-2.5 rounded-2xl bg-indigo-100/80 text-indigo-700 group-hover:scale-110 transition-transform">
              <Link2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_plotting}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Pasangan bimbingan</span>
              <ArrowUpRight size={13} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

      </div>

      {/* ── STATISTIK & MONITORING UTAMA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* KOLOM KIRI (2/3): STATISTIK KEHADIRAN & AKTIVITAS MAGANG */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. STATISTIK TINGKAT KEHADIRAN & KEDISIPLINAN */}
          <div className="card-clean p-5 sm:p-6 bg-white space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Tingkat Kehadiran & Kedisiplinan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statistik akumulasi seluruh riwayat presensi peserta magang
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-500">Tingkat Kehadiran:</span>
                <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {presensi_stats.persentase_kehadiran}%
                </span>
              </div>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
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

            {/* Grid 4 Kartu Status Presensi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-left">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Tepat Waktu</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1.5">{presensi_stats.hadir_tepat_waktu}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.hadir_tepat_waktu, presensi_stats.total)}% dari total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-left">
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Terlambat</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1.5">{presensi_stats.terlambat}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.terlambat, presensi_stats.total)}% dari total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-left">
                <div className="flex items-center gap-1.5 text-sky-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Izin & Sakit</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1.5">{presensi_stats.izin_sakit}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.izin_sakit, presensi_stats.total)}% dari total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-left">
                <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Alpha</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-1.5">{presensi_stats.alpha}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {calcPercent(presensi_stats.alpha, presensi_stats.total)}% dari total
                </span>
              </div>
            </div>
          </div>


          {/* 2. STATISTIK PROGRES AKTIVITAS (LOGBOOK & PENUGASAN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 2A: Progres Logbook Kegiatan */}
            <div className="card-clean p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Status Logbook</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{logbook_stats.total} total logbook</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/laporan?kategori=aktivitas_magang')}
                  className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-0.5"
                >
                  <span>Lihat</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Disetujui</span>
                    <span className="text-emerald-700 font-bold">{logbook_stats.disetujui} ({calcPercent(logbook_stats.disetujui, logbook_stats.total)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${calcPercent(logbook_stats.disetujui, logbook_stats.total)}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Menunggu Review</span>
                    <span className="text-amber-700 font-bold">{logbook_stats.menunggu} ({calcPercent(logbook_stats.menunggu, logbook_stats.total)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${calcPercent(logbook_stats.menunggu, logbook_stats.total)}%` }}
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Perlu Revisi</span>
                    <span className="text-rose-700 font-bold">{logbook_stats.revisi} ({calcPercent(logbook_stats.revisi, logbook_stats.total)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${calcPercent(logbook_stats.revisi, logbook_stats.total)}%` }}
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2B: Progres Penugasan Magang */}
            <div className="card-clean p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200/80">
                    <CheckSquare size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Status Tugas Magang</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{tugas_stats.total} total tugas</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/laporan?kategori=aktivitas_magang')}
                  className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-0.5"
                >
                  <span>Lihat</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Selesai Dinilai</span>
                    <span className="text-emerald-700 font-bold">{tugas_stats.selesai} ({calcPercent(tugas_stats.selesai, tugas_stats.total)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${calcPercent(tugas_stats.selesai, tugas_stats.total)}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Menunggu Review</span>
                    <span className="text-indigo-700 font-bold">{tugas_stats.menunggu_review} ({calcPercent(tugas_stats.menunggu_review, tugas_stats.total)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${calcPercent(tugas_stats.menunggu_review, tugas_stats.total)}%` }}
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Belum / Perlu Revisi</span>
                    <span className="text-slate-700 font-bold">
                      {tugas_stats.belum_dikerjakan + tugas_stats.perlu_revisi} ({calcPercent(tugas_stats.belum_dikerjakan + tugas_stats.perlu_revisi, tugas_stats.total)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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

        {/* KOLOM KANAN (1/3): BEBAN BIMBINGAN & FEED AKTIVITAS REAL-TIME */}
        <div className="space-y-6">

          {/* 3. BEBAN BIMBINGAN PER PEMBIMBING (MENTOR WORKLOAD) */}
          <div className="card-clean p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Beban Bimbingan Pembimbing</h4>
                <p className="text-[11px] text-slate-500">
                  Rata-rata: <span className="font-bold text-slate-900">{mentor_workload.rata_rata} peserta / pembimbing</span>
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/plotting')}
                className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-0.5"
              >
                <span>Kelola</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {/* Alert jika ada peserta belum diplotting */}
            {mentor_workload.peserta_belum_plotting > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span className="font-semibold">{mentor_workload.peserta_belum_plotting} peserta belum diplotting</span>
                </div>
                <button
                  onClick={() => navigate('/admin/plotting')}
                  className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider hover:bg-amber-400 transition-all shrink-0"
                >
                  Plotting
                </button>
              </div>
            )}

            {/* Daftar Pembimbing & Jumlah Peserta Bimbingan */}
            <div className="space-y-2.5">
              {mentor_workload.list && mentor_workload.list.length > 0 ? (
                mentor_workload.list.map((m) => (
                  <div
                    key={m.user_id}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-all flex items-center justify-between gap-2 border border-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{m.nama}</p>
                      <p className="text-[10px] text-slate-500 truncate">{m.jabatan || 'Pembimbing Lapangan'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                        {m.total_bimbingan} peserta
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Belum ada data pembimbing terdaftar.
                </div>
              )}
            </div>
          </div>

          {/* 4. FEED AKTIVITAS REAL-TIME USER */}
          <div className="card-clean p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={15} className="text-amber-600" />
                <span>Aktivitas Terbaru</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Real-Time
              </span>
            </div>

            <div className="space-y-2.5">
              {recent_activities && recent_activities.length > 0 ? (
                recent_activities.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs shadow-2xs hover:border-amber-300 transition-all flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 mt-0.5">
                      {getActivityIcon(item.tipe)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {item.judul}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {item.waktu}
                        </span>
                      </div>
                      {item.sub && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate leading-tight">
                          {item.sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Belum ada aktivitas user hari ini.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
