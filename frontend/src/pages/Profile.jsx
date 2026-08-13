import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';
import DovetailDivider from '../components/DovetailDivider';
import {
  Phone,
  KeyRound,
  Camera,
  Shield,
  BadgeCheck,
  Loader2,
  Save,
  Lock,
  Calendar,
  Info
} from 'lucide-react';

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [noHp, setNoHp] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password_baru: '',
  });
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.status === 'success') {
        setProfileData(res.data.data);
        setNoHp(res.data.data.no_hp || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Photo Upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileAlert({ type: 'error', message: 'Ukuran foto maksimal 2MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('foto_profil', file);

    setUploadingPhoto(true);
    setProfileAlert(null);

    try {
      const res = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.status === 'success') {
        setProfileAlert({ type: 'success', message: 'Foto profil berhasil diperbarui.' });
        setProfileData(res.data.data);
        updateUser({ foto_profil: res.data.data.foto_profil_raw });
      }
    } catch (err) {
      setProfileAlert({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengunggah foto profil.',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle No. HP Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileAlert(null);

    try {
      const res = await api.post('/profile', { no_hp: noHp });
      if (res.data.status === 'success') {
        setProfileAlert({ type: 'success', message: 'Nomor HP berhasil diperbarui.' });
        setProfileData(res.data.data);
        updateUser({ no_hp: res.data.data.no_hp });
      }
    } catch (err) {
      setProfileAlert({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui profil.',
      });
    } finally {
      setSubmittingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.password_baru !== passwordForm.konfirmasi_password_baru) {
      setPasswordAlert({ type: 'error', message: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setSubmittingPassword(true);
    setPasswordAlert(null);

    try {
      const res = await api.put('/profile/password', passwordForm);
      if (res.data.status === 'success') {
        setPasswordAlert({ type: 'success', message: res.data.message });
        setPasswordForm({
          password_lama: '',
          password_baru: '',
          konfirmasi_password_baru: '',
        });
      }
    } catch (err) {
      setPasswordAlert({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama Anda benar.',
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const getRoleLabel = (role) => {
    const roles = {
      peserta: 'Peserta Magang',
      pembimbing: 'Pembimbing Lapangan',
      admin: 'Admin Instansi',
    };
    return roles[role] || role;
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Profil Saya</h2>
      </div>

      <DovetailDivider className="my-2" />

      {/* ── ROW 1: AVATAR CARD (LEFT) & ACCOUNT INFO READ-ONLY (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Avatar & Role Badge (4-span on desktop) */}
        <div className="lg:col-span-4 card-clean p-6 flex flex-col items-center text-center justify-center space-y-4">
          <div className="relative group">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-amber-100 shadow-md bg-amber-50 flex items-center justify-center shrink-0">
              {profileData?.foto_profil ? (
                <img
                  src={profileData.foto_profil}
                  alt={profileData.nama}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-amber-900">
                  {profileData?.nama ? profileData.nama.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            {/* Photo Upload Overlay Button */}
            <label
              htmlFor="foto-upload"
              className="absolute bottom-0 right-0 bg-[#E8A800] hover:bg-[#D49800] text-slate-950 p-2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
              title="Ganti Foto Profil"
            >
              {uploadingPhoto ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              <input
                id="foto-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">{profileData?.nama}</h3>
            <p className="text-xs text-slate-500 mt-1">{profileData?.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <BadgeCheck size={14} className="text-amber-600" />
            <span>{getRoleLabel(profileData?.role)}</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Format foto: JPG, PNG (Maks 2MB)
          </p>
        </div>

        {/* Right Card: Read-Only Account Info (8-span on desktop) */}
        <div className="lg:col-span-8 card-clean p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Informasi Akun</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Nama Lengkap</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block break-words">{profileData?.nama}</span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Email Terdaftar</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block break-all">{profileData?.email}</span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Peran / Role System</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block capitalize">{profileData?.role}</span>
              </div>

              {profileData?.nim_nis && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">NIM / NIS / NIP</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block break-all">{profileData.nim_nis}</span>
                </div>
              )}

              {profileData?.asal_instansi && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Asal Sekolah / Universitas</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block break-words">{profileData.asal_instansi}</span>
                </div>
              )}

              {profileData?.jurusan && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Jurusan / Program Studi</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block break-words">{profileData.jurusan}</span>
                </div>
              )}

              {profileData?.posisi_magang && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Posisi / Divisi Magang</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block break-words">{profileData.posisi_magang}</span>
                </div>
              )}

              {profileData?.role === 'peserta' && (
                <div className="bg-amber-50/90 p-4 rounded-xl border border-amber-200/80 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-amber-900/80 font-bold block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={15} className="text-amber-600" />
                      Periode Pelaksanaan Magang
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm mt-1 block">
                      {profileData.tanggal_mulai_magang ? formatDateIndo(profileData.tanggal_mulai_magang) : 'Belum diatur'}
                      {' s/d '}
                      {profileData.tanggal_selesai_magang ? formatDateIndo(profileData.tanggal_selesai_magang) : 'Sekarang'}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {profileData.is_magang_selesai ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        Selesai Magang
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                        Periode Aktif
                      </span>
                    )}
                  </div>
                </div>
              )}

              {profileData?.jabatan && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Jabatan Pembimbing</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block break-words">{profileData.jabatan}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 font-medium">
            <Info size={14} className="text-amber-600 shrink-0" />
            <span>
              Data tidak sesuai? Hubungi{' '}
              <a
                href={`mailto:${profileData?.admin_email || 'admin@poltek-furnitur.ac.id'}`}
                className="font-bold text-amber-800 hover:text-amber-900 underline decoration-amber-300 hover:decoration-amber-600 transition-colors"
              >
                Admin Instansi
              </a>{' '}
              untuk pembetulan.
            </span>
          </p>
        </div>

      </div>

      {/* ── ROW 2: SIDE-BY-SIDE GRID FOR CONTACT FORM & PASSWORD FORM ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Contact Form (No. HP) */}
        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Kontak Saya</h3>
            </div>
          </div>

          <AlertBanner alert={profileAlert} onClose={() => setProfileAlert(null)} />

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor HP / WhatsApp
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingProfile}
              className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 font-bold"
            >
              {submittingProfile ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>Simpan Kontak</span>
            </button>
          </form>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock size={18} className="text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Ubah Kata Sandi</h3>
          </div>

          <AlertBanner alert={passwordAlert} onClose={() => setPasswordAlert(null)} />

          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi Lama
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={passwordForm.password_lama}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_lama: e.target.value })}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.password_baru}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_baru: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.konfirmasi_password_baru}
                  onChange={(e) => setPasswordForm({ ...passwordForm, konfirmasi_password_baru: e.target.value })}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingPassword}
              className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 font-bold"
            >
              {submittingPassword ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Lock size={15} />
              )}
              <span>Ubah Kata Sandi</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
