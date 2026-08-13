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
  Calendar as CalendarIcon,
  Plus,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle
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
    total_plotting = 0,
    presensi_hari_ini = 0,
    logbook_hari_ini = 0,
    izin_pending = 0,
    tugas_aktif = 0,
    recent_activities = []
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── HEADER CLEAN SAPAAN & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sapaan tanpa Card Besar */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {user?.nama || 'Administrator'}!
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Selamat datang di SIMONIKA.
          </p>
        </div>

        {/* Akses Kanan: Tombol + Tambah User & Card Calendar Mini */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={() => navigate('/admin/kelola-user/tambah')}
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

      <DovetailDivider />

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
              <span>Mahasiswa / Siswa</span>
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
              <span>Staff / Mentor instansi</span>
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
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plotting Pasangan</span>
            <div className="p-2.5 rounded-2xl bg-indigo-100/80 text-indigo-700 group-hover:scale-110 transition-transform">
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

      {/* ── SECTION MANAGEMENT & MONITORING BENTO GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* KOLOM KIRI (2/3): MODUL UTAMA MANAGEMENT */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Module 1: Master User Management */}
            <div className="card-bento p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-amber-100/80 text-amber-900 rounded-xl border border-amber-200 group-hover:scale-105 transition-transform">
                    <UserPlus size={20} />
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Kelola Data User</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Manajemen pengguna (Peserta, Pembimbing, Admin), tambah pengguna baru, reset password, dan status keaktifan.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => navigate('/admin/kelola-user')}
                  className="btn-poli-primary px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-extrabold flex items-center gap-1 shadow-2xs"
                >
                  <span>Kelola</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Module 2: Plotting Bimbingan */}
            <div className="card-bento p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-indigo-100/80 text-indigo-800 rounded-xl border border-indigo-200 group-hover:scale-105 transition-transform">
                    <Link2 size={20} />
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Plotting Bimbingan Magang</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pemetaan hubungan pembimbing lapangan instansi dengan mahasiswa/siswa peserta magang Polifurneka.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => navigate('/admin/plotting')}
                  className="btn-poli-primary px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-extrabold flex items-center gap-1 shadow-2xs"
                >
                  <span>Plotting</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Module 3: Laporan Program Magang (Span 2 Columns on MD) */}
            <div className="md:col-span-2 card-bento p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 hover:border-amber-300 transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300/80 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Rekapitulasi & Laporan </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                    Pusat rekapitulasi data magang (Presensi, Logbook, Penugasan, Pengajuan Izin) yang siap diunduh dalam format dokumen resmi PDF & Excel.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/laporan?kategori=laporan_program_magang')}
                className="btn-poli-primary px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-2xs shrink-0 self-end sm:self-auto"
              >
                <span>Buka Laporan</span>
                <ArrowUpRight size={15} />
              </button>
            </div>

          </div>
        </div>

        {/* KOLOM KANAN (1/3): SIDE WIDGET AKTIVITAS HARI INI FULL HEIGHT */}
        <div className="h-full flex flex-col">

          {/* Widget Feed Aktivitas User Terbaru (Full Height) */}
          <div className="card-bento p-5 space-y-4 bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-200/80 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-amber-100/80 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={15} className="text-amber-600" />
                  <span>Aktivitas Terbaru User</span>
                </h4>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Real-Time
                </span>
              </div>

              <div className="space-y-3 pt-3">
                {recent_activities && recent_activities.length > 0 ? (
                  recent_activities.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs shadow-2xs hover:border-amber-300 transition-all flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 mt-0.5">
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
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    Belum ada riwayat aktivitas user hari ini.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
