import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  KeyRound,
  Mail,
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  HelpCircle,
  BookOpen,
  Lock,
  X,
  Phone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import buildingImg from '../../assets/gedung-polifurneka.jpg';
import logoImg from '../../assets/logo-polifurneka.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [helpModal, setHelpModal] = useState(null); // 'bantuan' | 'panduan' | 'privasi' | null

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'peserta') navigate('/peserta/dashboard');
      else if (user.role === 'pembimbing') navigate('/pembimbing/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Login gagal. Periksa kembali email & password Anda.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 font-inter text-slate-800 relative overflow-hidden">
      
      {/* ── Left Panel: HERO BUILDING IMAGE & BRANDING (Desktop Only, 55% Width) ── */}
      <div className="hidden lg:flex w-full lg:w-[55%] min-h-screen relative flex-col justify-between p-10 lg:p-16 text-white overflow-hidden shrink-0">
        
        {/* Background Building Image */}
        <div
          className="absolute inset-0 bg-cover bg-[position:45%_center] transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${buildingImg})` }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120B07]/90 via-slate-950/20 to-white/30 backdrop-blur-[0.5px]" />

        {/* Subtle Decorative Lighting Accents */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-[#E8A800]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img src={logoImg} alt="Logo Polifurneka" className="h-12 lg:h-14 w-auto object-contain shrink-0 drop-shadow-sm" />
          <div>
            <h2 className="font-extrabold text-lg md:text-xl text-slate-900 leading-tight tracking-tight drop-shadow-2xs">
              Sistem Monitoring Kegiatan Magang
            </h2>
            <p className="text-xs text-amber-900 font-bold tracking-wide">
              Politeknik Industri Furnitur dan Pengolahan Kayu
            </p>
          </div>
        </div>

        {/* Bottom Hero Footer */}
        <div className="relative z-10 text-xs text-slate-300/90 space-y-0.5">
          <p className="text-[11px] text-slate-300 leading-tight">
            Jl. Wanamarta Raya No. 20 - Kawasan Industri Kendal, Kendal - Jawa Tengah 51371
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-amber-300/90 font-mono pt-0.5">
            <span>humas@poltek-furnitur.ac.id</span>
            <span className="opacity-50">•</span>
            <span>+62 294 3692732</span>
          </div>
        </div>

      </div>

      {/* ── Right Panel: FLOATING CARD CONTAINER FOR LOGIN FORM (100% on Mobile, 45% on Desktop) ── */}
      <div className="w-full lg:w-[45%] min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 lg:p-14 bg-slate-100 relative z-10 shrink-0 my-auto">
        
        {/* Mobile Header Branding (Visible ONLY on Mobile < lg) */}
        <div className="lg:hidden w-full max-w-md mb-4 flex items-center gap-3 justify-center text-left px-1">
          <img src={logoImg} alt="Logo Polifurneka" className="h-10 w-auto object-contain shrink-0 drop-shadow-xs" />
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight tracking-tight">
              Sistem Monitoring Kegiatan Magang
            </h2>
            <p className="text-[10px] text-amber-800 font-bold tracking-wide">
              Politeknik Industri Furnitur dan Pengolahan Kayu
            </p>
          </div>
        </div>

        {/* Floating Card Container */}
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl border border-slate-200/80 p-5 sm:p-9 space-y-5 sm:space-y-6">

          {/* Form Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang di SIMONIKA
            </h1>
            <p className="text-xs text-slate-500">
              Silakan masukkan akun terdaftar Anda untuk mengelola aktivitas magang.
            </p>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email / Akun Instansi
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@poltek-furnitur.ac.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-poli-primary py-3.5 rounded-full text-xs md:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center mt-2 shadow-md disabled:opacity-50 font-bold"
            >
              {submitting ? (
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Masuk ke SIMONIKA</span>
              )}
            </button>
          </form>

          {/* Assistance Note */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2.5">
            <Building2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Akun peserta dan pembimbing dikelola resmi oleh <strong className="text-slate-700">Admin Instansi Polifurneka Kendal</strong>. Hubungi admin jika mengalami kendala login.
            </p>
          </div>

        </div>

        {/* ── Footer Support Links (Bantuan Login, Panduan, Kebijakan Privasi) ── */}
        <div className="w-full max-w-md mt-6 text-center space-y-2.5 text-xs text-amber-900">
          <div>
            <button
              type="button"
              onClick={() => setHelpModal('bantuan')}
              className="inline-flex items-center gap-1.5 font-bold underline hover:text-amber-950 transition-colors cursor-pointer text-xs"
            >
              <HelpCircle size={15} />
              <span>Bantuan Login</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-500 font-medium text-[11px]">
            <button
              type="button"
              onClick={() => setHelpModal('panduan')}
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 hover:underline transition-all cursor-pointer font-medium"
            >
              <BookOpen size={13} />
              <span>Panduan Penggunaan</span>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setHelpModal('privasi')}
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 hover:underline transition-all cursor-pointer font-medium"
            >
              <Lock size={13} />
              <span>Kebijakan Privasi</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODAL HELP / SUPPORT / PRIVACY ── */}
      {helpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                {helpModal === 'bantuan' && <HelpCircle size={18} className="text-amber-700" />}
                {helpModal === 'panduan' && <BookOpen size={18} className="text-amber-700" />}
                {helpModal === 'privasi' && <Lock size={18} className="text-amber-700" />}
                <span>
                  {helpModal === 'bantuan' && 'Bantuan & Kendala Login'}
                  {helpModal === 'panduan' && 'Panduan Penggunaan SIMONIKA'}
                  {helpModal === 'privasi' && 'Kebijakan Privasi SIMONIKA'}
                </span>
              </h3>
              <button
                onClick={() => setHelpModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {helpModal === 'bantuan' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Jika Anda tidak bisa masuk atau belum memiliki akun terdaftar, silakan hubungi unit pengelola sistem magang Polifurneka:
                </p>
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 text-[11px] text-amber-950 font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-amber-700 shrink-0" />
                    <span>Unit SIM & IT Support Polifurneka Kendal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-amber-700 shrink-0" />
                    <span>admin@poltek-furnitur.ac.id / humas@poltek-furnitur.ac.id</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-amber-700 shrink-0" />
                    <span>+62 294 3692732</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  *Pihak admin akan membantu melakukan reset kata sandi atau mendaftarkan akun baru Anda.
                </p>
              </div>
            )}

            {helpModal === 'panduan' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Peserta Magang:</strong>
                    <p className="text-[11px] text-slate-500">
                      Check-in presensi (07.00 - 11.00 WIB), Check-out (mulai 16.00 WIB), isi Logbook kegiatan harian, serta kumpulkan Tugas Magang.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Pembimbing Lapangan:</strong>
                    <p className="text-[11px] text-slate-500">
                      Monitor lokasi presensi bimbingan, beri ulasan logbook harian, dan buat tugas magang peserta.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Admin Instansi:</strong>
                    <p className="text-[11px] text-slate-500">
                      Kelola master data akun pengguna, pemetaan bimbingan (plotting), dan cetak rekapitulasi Laporan PDF.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {helpModal === 'privasi' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <ShieldCheck size={16} className="text-amber-700" />
                    <span>Perlindungan Data & Koordinat GPS</span>
                  </div>
                  <p className="text-slate-600">
                    SIMONIKA Politeknik Industri Furnitur dan Pengolahan Kayu menjamin kerahasiaan data pribadi, koordinat lokasi GPS presensi, serta isi laporan kegiatan harian Anda. Seluruh data dilindungi dan hanya dipergunakan untuk keperluan evaluasi akademik magang internal.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
