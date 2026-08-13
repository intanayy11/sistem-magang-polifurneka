import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import DovetailDivider from '../../components/DovetailDivider';
import {
  UserPlus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const TambahUserPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || '';

  const initialRole = (roleParam === 'peserta' || roleParam === 'pembimbing' || roleParam === 'admin') 
    ? roleParam 
    : 'peserta';

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: initialRole,
    nim_nis: '',
    asal_instansi: '',
    jurusan: '',
    posisi_magang: '',
    jabatan: '',
    no_hp: '',
    tanggal_mulai_magang: '',
    tanggal_selesai_magang: '',
  });

  useEffect(() => {
    if (roleParam === 'peserta' || roleParam === 'pembimbing' || roleParam === 'admin') {
      setForm((prev) => ({ ...prev, role: roleParam }));
    }
  }, [roleParam]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      const res = await api.post('/admin/users', form);
      setAlert({ type: 'success', message: res.data.message || 'User berhasil ditambahkan.' });
      setForm({
        nama: '',
        email: '',
        password: '',
        role: 'peserta',
        nim_nis: '',
        asal_instansi: '',
        jurusan: '',
        posisi_magang: '',
        jabatan: '',
        no_hp: '',
        tanggal_mulai_magang: '',
        tanggal_selesai_magang: '',
      });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan data user.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all';
  const labelClass = 'block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5';

  const SectionBadge = ({ num }) => (
    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center justify-center shrink-0">
      {num}
    </span>
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tambah User Baru</h2>
        </div>
        <button
          onClick={() => navigate('/admin/kelola-user')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto"
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Daftar User</span>
        </button>
      </div>

      <DovetailDivider className="my-2" />

      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold border ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          )}
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="card-clean p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Informasi Akun ── */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <SectionBadge num="1" />
              Informasi Akun
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={form.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@poltek-furnitur.ac.id"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Role Akses <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className={inputClass}
                >
                  <option value="peserta">Peserta Magang</option>
                  <option value="pembimbing">Pembimbing Lapangan</option>
                  <option value="admin">Admin Instansi</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Password Awal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section 2: Identitas & Kontak ── */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <SectionBadge num="2" />
              Identitas &amp; Kontak
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  {form.role === 'peserta' ? 'NIM / NIS' : form.role === 'pembimbing' ? 'NIP / NIK' : 'NIP / ID Pegawai'}
                </label>
                <input
                  type="text"
                  placeholder={form.role === 'peserta' ? 'Contoh: H1D024028' : 'Contoh: 198501152010121001'}
                  value={form.nim_nis}
                  onChange={(e) => handleChange('nim_nis', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>No HP / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={form.no_hp}
                  onChange={(e) => handleChange('no_hp', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Detail Peserta (Conditional) ── */}
          {form.role === 'peserta' && (
            <>
              <div className="border-t border-slate-100" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionBadge num="3" />
                  Detail Peserta Magang
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Asal Sekolah / Universitas / Instansi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Universitas Jenderal Soedirman"
                      value={form.asal_instansi}
                      onChange={(e) => handleChange('asal_instansi', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Jurusan / Program Studi</label>
                      <input
                        type="text"
                        placeholder="Contoh: Teknik Informatika"
                        value={form.jurusan}
                        onChange={(e) => handleChange('jurusan', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Posisi / Divisi Magang</label>
                      <input
                        type="text"
                        placeholder="Contoh: Divisi Software & IT Support"
                        value={form.posisi_magang}
                        onChange={(e) => handleChange('posisi_magang', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Tanggal Mulai Magang</label>
                      <input
                        type="date"
                        value={form.tanggal_mulai_magang}
                        onChange={(e) => handleChange('tanggal_mulai_magang', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Tanggal Selesai Magang</label>
                      <input
                        type="date"
                        value={form.tanggal_selesai_magang}
                        onChange={(e) => handleChange('tanggal_selesai_magang', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Section 3: Detail Pembimbing (Conditional) ── */}
          {form.role === 'pembimbing' && (
            <>
              <div className="border-t border-slate-100" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionBadge num="3" />
                  Detail Pembimbing
                </h3>
                <div>
                  <label className={labelClass}>Jabatan di Instansi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kepala Unit SIM & Sistem Informasi"
                    value={form.jabatan}
                    onChange={(e) => handleChange('jabatan', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Action Buttons ── */}
          <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/kelola-user')}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto btn-poli-primary px-6 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Simpan User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahUserPage;
