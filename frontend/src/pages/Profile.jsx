import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';
import DovetailDivider from '../components/DovetailDivider';
import {
  User,
  Phone,
  KeyRound,
  Camera,
  Shield,
  Mail,
  BadgeCheck,
  Building,
  Loader2,
  Save,
  Lock
} from 'lucide-react';

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Profil Saya</h2>
        <p className="text-slate-500 text-xs md:text-sm mt-0.5">
          Kelola data kontak pribadi, foto profil, serta perbarui kata sandi akun Anda.
        </p>
      </div>

      <DovetailDivider className="my-2" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Account Badge */}
        <div className="card-clean p-6 flex flex-col items-center text-center space-y-4">
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
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{profileData?.nama}</h3>
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

        {/* Right Column: Information, Contact Form & Password Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Read-Only Account Info */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Informasi Akun (Read-Only)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Nama Lengkap</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{profileData?.nama}</span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Email Terdaftar</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profileData?.email}</span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Peran / Role System</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block capitalize">{profileData?.role}</span>
              </div>

              {profileData?.nim_nis && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">NIM / NIS / NIP</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{profileData.nim_nis}</span>
                </div>
              )}

              {profileData?.asal_instansi && (
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 font-medium block">Asal Sekolah / Universitas</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profileData.asal_instansi}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Data nama, email, dan role dikelola oleh Admin Instansi. Hubungi Admin jika terdapat kekeliruan data.
            </p>
          </div>

          {/* Section 2: Contact Form (No. HP) */}
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
                className="btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
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

          {/* Section 3: Password Change Form */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Ubah Kata Sandi</h3>
            </div>

            <AlertBanner alert={passwordAlert} onClose={() => setPasswordAlert(null)} />

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi Lama
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.password_lama}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password_lama: e.target.value })}
                    placeholder="Masukkan kata sandi saat ini"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.password_baru}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_baru: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.konfirmasi_password_baru}
                      onChange={(e) => setPasswordForm({ ...passwordForm, konfirmasi_password_baru: e.target.value })}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
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
    </div>
  );
};

export default Profile;
