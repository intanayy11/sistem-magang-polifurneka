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
  Settings
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
              {getGreeting()}, {user?.nama || 'Administrator'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed font-medium">
              Pusat kendali master data akun pengguna, peran aktor, serta manajemen pemetaan (plotting) pembimbing & peserta magang Polifurneka.
            </p>
          </div>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      {/* ── BENTO CARD 2: SUMMARY METRICS GRID (4 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pengguna */}
        <div
          onClick={() => navigate('/admin/kelola-user')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-purple-50/40 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform">
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
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta Magang</span>
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 group-hover:scale-110 transition-transform">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_peserta}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Mahasiswa / Siswa</span>
              <ArrowUpRight size={13} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 3: Pembimbing Lapangan */}
        <div
          onClick={() => navigate('/admin/kelola-user?role=pembimbing')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/40 hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pembimbing Lapangan</span>
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_pembimbing}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Staff / Mentor instansi</span>
              <ArrowUpRight size={13} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

        {/* Card 4: Plotting Pasangan */}
        <div
          onClick={() => navigate('/admin/plotting')}
          className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-indigo-50/40 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plotting Pasangan</span>
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 group-hover:scale-110 transition-transform">
              <Link2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{total_plotting}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Pemetaan bimbingan aktif</span>
              <ArrowUpRight size={13} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>

      </div>

      {/* ── BENTO CARD 3: INTERACTIVE MANAGEMENT MODULES (3 CARDS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        
        {/* Module 1: Master User Management */}
        <div className="card-bento p-6 flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300/80 group-hover:scale-105 transition-transform">
                <UserPlus size={22} />
              </div>
              <span className="text-[11px] font-bold font-mono text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                {total_users} Akun User
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Kelola Master Data User</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Manajemen akun pengguna (Peserta, Pembimbing, Admin), tambah pengguna baru, reset kata sandi, serta kontrol status keaktifan akun.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {total_peserta} Peserta • {total_pembimbing} Pembimbing
            </span>
            <button
              onClick={() => navigate('/admin/kelola-user')}
              className="btn-poli-primary px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <span>Manajer User</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Module 2: Plotting Bimbingan */}
        <div className="card-bento p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl border border-indigo-200 group-hover:scale-105 transition-transform">
                <Link2 size={22} />
              </div>
              <span className="text-[11px] font-bold font-mono text-indigo-900 bg-indigo-100/70 px-2.5 py-1 rounded-lg">
                {total_plotting} Pasangan Active
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Plotting Bimbingan Magang</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Atur dan petakan hubungan pasangan bimbingan antara mahasiswa peserta magang dengan pembimbing lapangan instansi Polifurneka.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Pemetaan Bimbingan Aktif
            </span>
            <button
              onClick={() => navigate('/admin/plotting')}
              className="btn-poli-primary px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <span>Kelola Plotting</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Module 3: Laporan Program Magang */}
        <div className="card-bento p-6 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300/80 group-hover:scale-105 transition-transform">
                <Settings size={22} />
              </div>
              <span className="text-[11px] font-bold font-mono text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                Laporan Central
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Laporan Program Magang</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Ringkasan statistik eksekutif dan rekapitulasi lengkap pelaksanaan program magang Polifurneka Kendal.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Rekapitulasi Kehadiran & Tugas
            </span>
            <button
              onClick={() => navigate('/admin/laporan?kategori=laporan_program_magang')}
              className="btn-poli-primary px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <span>Buka Laporan</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
