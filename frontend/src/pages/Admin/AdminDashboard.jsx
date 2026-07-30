import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, UserCheck, ArrowRight, UserPlus, Link2 } from 'lucide-react';
import DovetailDivider from '../../components/DovetailDivider';

const AdminDashboard = () => {
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const { total_users, total_peserta, total_pembimbing, total_admin, total_plotting } = stats;

  return (
    <div className="space-y-6">
      {/* Header Banner - Clean White with Yellow Accent Stripe */}
      <div className="bg-white rounded-[18px] p-6 md:p-7 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#E8A800]" />
        
        <div className="pl-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Admin Instansi
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Pusat kendali master data user, peran aktor, serta manajemen plotting pembimbing-peserta magang Polifurneka.
          </p>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_users}</div>
            <p className="text-xs text-slate-400 mt-1">Terdaftar dalam sistem</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta Magang</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_peserta}</div>
            <p className="text-xs text-slate-400 mt-1">Mahasiswa / Siswa aktif</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pembimbing Lapangan</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_pembimbing}</div>
            <p className="text-xs text-slate-400 mt-1">Staff / Mentor instansi</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plotting Pasangan</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Link2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{total_plotting}</div>
            <p className="text-xs text-slate-400 mt-1">Pemetaan bimbingan aktif</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200/60">
              <UserPlus size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kelola Master Data User</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tambah akun baru, reset password, atau aktivasi/nonaktifkan akun.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/kelola-user')}
            className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>Buka Manajer User</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl border border-slate-200">
              <Link2 size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Plotting Bimbingan Magang</h3>
              <p className="text-xs text-slate-500 mt-0.5">Atur pasangan mahasiswa peserta magang dengan pembimbing lapangan.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/plotting')}
            className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>Kelola Plotting Bimbingan</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
