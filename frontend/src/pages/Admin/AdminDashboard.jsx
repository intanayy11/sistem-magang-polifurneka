import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserCheck,
  UserPlus,
  Link2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  Settings,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  UserCog
} from 'lucide-react';
import DovetailDivider from '../../components/DovetailDivider';

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

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  const {
    total_users = 0,
    total_peserta = 0,
    total_pembimbing = 0,
    total_admin = 0,
    total_plotting = 0
  } = stats || {};

  // Percentages for visual progress bars
  const pesertaPercent = total_users > 0 ? Math.round((total_peserta / total_users) * 100) : 0;
  const pembimbingPercent = total_users > 0 ? Math.round((total_pembimbing / total_users) * 100) : 0;
  const plottingPercent = total_peserta > 0 ? Math.min(100, Math.round((total_plotting / total_peserta) * 100)) : 0;

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* ── EDUMATE HERO BANNER (Glassmorphic Rounded Float Card) ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/10 via-white to-amber-100/40 p-6 sm:p-8 border border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-md overflow-hidden">
        {/* Soft Background Blurs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 shadow-xs">
                <Sparkles size={12} />
                <span>Admin Central Portal</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-600 border border-slate-200/80 shadow-2xs font-mono">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.nama || 'Administrator'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Pusat kendali master data akun pengguna, peran sistem, serta manajemen pemetaan (plotting) pembimbing & peserta magang Polifurneka Kendal.
            </p>
          </div>

          {/* Quick Stat Counter Widget */}
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/90 shadow-sm flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-sm">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Sistem</div>
              <div className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Aktif & Sinkron</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EDUMATE SUMMARY METRICS GRID (4 FLOAT CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Pengguna */}
        <div
          onClick={() => navigate('/admin/kelola-user')}
          className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(232,168,0,0.15)] hover:border-amber-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{total_users}</div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                System Users
              </span>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Semua role terdaftar</span>
              <ArrowUpRight size={14} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Card 2: Peserta Magang */}
        <div
          onClick={() => navigate('/admin/kelola-user?role=peserta')}
          className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(232,168,0,0.15)] hover:border-amber-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Peserta Magang</span>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 group-hover:scale-110 transition-transform">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{total_peserta}</div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                {pesertaPercent}% dari User
              </span>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pesertaPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Mahasiswa / Siswa aktif</span>
              <ArrowUpRight size={14} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Card 3: Pembimbing Lapangan */}
        <div
          onClick={() => navigate('/admin/kelola-user?role=pembimbing')}
          className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(232,168,0,0.15)] hover:border-amber-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pembimbing Lapangan</span>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{total_pembimbing}</div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {pembimbingPercent}% dari User
              </span>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pembimbingPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Mentor & Staff instansi</span>
              <ArrowUpRight size={14} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Card 4: Plotting Pasangan */}
        <div
          onClick={() => navigate('/admin/plotting')}
          className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(232,168,0,0.15)] hover:border-amber-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Plotting Pasangan</span>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:scale-110 transition-transform">
              <Link2 size={20} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{total_plotting}</div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                {plottingPercent}% Terplotting
              </span>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${plottingPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Pasangan bimbingan aktif</span>
              <ArrowUpRight size={14} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

      </div>

      {/* ── EDUMATE DASHBOARD TABLE LIST VIEW (DISTRIBUSI SYSTEM USERS) ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>Distribusi Peran Pengguna & Pemetaan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Status ringkasan kelompok pengguna dan rasio plotting bimbingan aktif
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              {total_users} Total Akun
            </span>
          </div>
        </div>

        {/* Table List Items */}
        <div className="space-y-3">
          
          {/* Row 1: Peserta Magang */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50 hover:bg-slate-100/60 transition-all">
            <div className="flex items-center gap-3.5 min-w-[200px]">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Peserta Magang (Mahasiswa/Siswa)</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pengisi presensi, logbook, & pengumpul tugas</p>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end flex-1">
              <div className="w-32 sm:w-44 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Rasio User</span>
                  <span>{pesertaPercent}% ({total_peserta})</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pesertaPercent}%` }} />
                </div>
              </div>

              {/* Stacked Avatar Preview Accent */}
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-900">M1</div>
                <div className="w-7 h-7 rounded-full bg-amber-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-900">M2</div>
                <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-950 font-mono">+{total_peserta}</div>
              </div>

              <button
                onClick={() => navigate('/admin/kelola-user?role=peserta')}
                className="px-4 py-2 rounded-full bg-[#E8A800] hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition-all shadow-2xs whitespace-nowrap"
              >
                Kelola Peserta
              </button>
            </div>
          </div>

          {/* Row 2: Pembimbing Lapangan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50 hover:bg-slate-100/60 transition-all">
            <div className="flex items-center gap-3.5 min-w-[200px]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <UserCog size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Pembimbing Lapangan (Instansi)</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Penilai logbook, tugas, & verifikator izin</p>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end flex-1">
              <div className="w-32 sm:w-44 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Rasio User</span>
                  <span>{pembimbingPercent}% ({total_pembimbing})</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pembimbingPercent}%` }} />
                </div>
              </div>

              {/* Stacked Avatar Preview Accent */}
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-900">P1</div>
                <div className="w-7 h-7 rounded-full bg-emerald-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-900">P2</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white font-mono">+{total_pembimbing}</div>
              </div>

              <button
                onClick={() => navigate('/admin/kelola-user?role=pembimbing')}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-2xs whitespace-nowrap"
              >
                Kelola Pembimbing
              </button>
            </div>
          </div>

          {/* Row 3: Admin Instansi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50 hover:bg-slate-100/60 transition-all">
            <div className="flex items-center gap-3.5 min-w-[200px]">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Admin Instansi (Super User)</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pengelola master data, plotting, & laporan central</p>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end flex-1">
              <div className="w-32 sm:w-44 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Jumlah Akun</span>
                  <span>{total_admin} Admin</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-purple-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-950">A</div>
              </div>

              <button
                onClick={() => navigate('/admin/kelola-user')}
                className="px-4 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs transition-all shadow-2xs whitespace-nowrap"
              >
                Semua User
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── EDUMATE INTERACTIVE MANAGEMENT MODULE CARDS (2 COLUMNS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Master User Management Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(232,168,0,0.12)] hover:border-amber-300 transition-all duration-300 flex flex-col justify-between space-y-5 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300/80 group-hover:scale-105 transition-transform">
                <UserPlus size={24} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                {total_users} Akun Sistem
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Kelola Master Data User</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Manajemen akun pengguna (Peserta, Pembimbing, Admin), tambah pengguna baru, reset kata sandi, serta kontrol status keaktifan akun.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              {total_peserta} Peserta • {total_pembimbing} Pembimbing
            </span>
            <button
              onClick={() => navigate('/admin/kelola-user')}
              className="px-5 py-2.5 rounded-full bg-[#E8A800] hover:bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Buka Manajer User</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Module 2: Plotting Bimbingan Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(99,102,241,0.12)] hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between space-y-5 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl border border-indigo-200 group-hover:scale-105 transition-transform">
                <Link2 size={24} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-200">
                {total_plotting} Pasangan Aktif
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Plotting Bimbingan Magang</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Atur dan petakan hubungan pasangan bimbingan antara mahasiswa peserta magang dengan pembimbing lapangan instansi Polifurneka.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Rasio Plotting {plottingPercent}%
            </span>
            <button
              onClick={() => navigate('/admin/plotting')}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Kelola Plotting</span>
              <ArrowUpRight size={15} className="text-amber-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
