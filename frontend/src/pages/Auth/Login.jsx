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
} from 'lucide-react';
import buildingImg from '../../assets/gedung-polifurneka.jpg';
import logoImg from '../../assets/logo-polifurneka.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    <div className="min-h-screen w-full flex flex-col-reverse lg:flex-row bg-slate-100 font-inter text-slate-800 relative overflow-hidden">
      
      {/* ── Left Panel: FLOATING CARD CONTAINER FOR LOGIN FORM ── */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center p-6 md:p-10 lg:p-14 bg-slate-100 relative z-10 shrink-0">
        
        {/* Floating Card Container */}
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl border border-slate-200/80 p-7 sm:p-9 space-y-6">

          {/* Form Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-slate-500">
              Masukkan akun terdaftar Anda untuk mengelola aktivitas magang.
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
                  placeholder="nama@polifurneka.ac.id"
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
              className="w-full btn-poli-primary py-3 rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-md disabled:opacity-50 font-bold"
            >
              {submitting ? (
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk ke Sistem</span>
                </>
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

      </div>

      {/* ── Right Panel: HERO BUILDING IMAGE & ORIGINAL BRANDING ── */}
      <div className="w-full lg:w-[55%] min-h-[380px] lg:min-h-screen relative flex flex-col justify-between p-6 sm:p-10 lg:p-16 text-white overflow-hidden shrink-0">
        
        {/* Background Building Image */}
        <div
          className="absolute inset-0 bg-cover bg-[position:45%_center] transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${buildingImg})` }}
        />

        {/* Original Clean Overlay: Light sky on top, dark on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120B07]/90 via-slate-950/20 to-white/30 backdrop-blur-[0.5px]" />

        {/* Decorative Amber Gold Lighting Accents */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#E8A800]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Top Branding Header (Dark text over bright sky) */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img src={logoImg} alt="Logo Polifurneka" className="h-14 w-auto object-contain shrink-0 drop-shadow-sm" />
          <div>
            <h2 className="font-extrabold text-lg md:text-xl text-slate-900 leading-tight tracking-tight drop-shadow-2xs">
              Sistem Monitoring Magang
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
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px] text-amber-300/90 font-mono pt-0.5">
            <span>humas@poltek-furnitur.ac.id</span>
            <span className="opacity-50">•</span>
            <span>+62 294 3692732</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
