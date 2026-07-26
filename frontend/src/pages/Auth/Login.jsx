import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, KeyRound, Mail, AlertCircle, GraduationCap, Building } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.response?.data?.message || err.message || 'Login gagal. Periksa kembali email & password Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-between p-4 font-inter text-slate-800 relative overflow-hidden">

      {/* Decorative subtle light background accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-yellow-100/40 blur-3xl pointer-events-none" />

      {/* Top Header Branding */}
      <header className="max-w-md w-full mx-auto pt-6 text-center z-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#E8A800] text-slate-950 font-bold text-2xl shadow-md mb-3">
          P
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Sistem Informasi Magang
        </h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
          <Building size={14} className="text-amber-600" />
          <span>Politeknik Industri Furnitur dan Pengolahan Kayu</span>
        </p>
      </header>

      {/* Main Login Form Card */}
      <div className="w-full max-w-md mx-auto z-10 my-6">
        <div className="bg-white border border-slate-200/90 rounded-[20px] p-6 md:p-8 shadow-sm">
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Selamat Datang</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masuk dengan akun instansi Polifurneka Anda.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E8A800] hover:bg-[#D49800] text-slate-950 font-bold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={17} />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Akses Cepat Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('peserta@polifurneka.ac.id', 'password123')}
                className="bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 p-2 rounded-xl text-xs font-medium transition-all text-center"
              >
                Peserta
              </button>
              <button
                type="button"
                onClick={() => fillDemo('pembimbing@polifurneka.ac.id', 'password123')}
                className="bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 p-2 rounded-xl text-xs font-medium transition-all text-center"
              >
                Pembimbing
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@polifurneka.ac.id', 'password123')}
                className="bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 p-2 rounded-xl text-xs font-medium transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer info */}
      <footer className="text-center py-3 text-xs text-slate-400 z-10">
        <p>© {new Date().getFullYear()} Polifurneka Kendal · Kerja Praktik Informatika Unsoed</p>
      </footer>
    </div>
  );
};

export default Login;
