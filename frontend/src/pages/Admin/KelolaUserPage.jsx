import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  UserPlus,
  Search,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import useScrollLock from '../../hooks/useScrollLock';

const KelolaUserPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal Create/Edit User
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [userForm, setUserForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'peserta',
    nim_nis: '',
    asal_instansi: '',
    no_hp: '',
    tanggal_mulai_magang: '',
    tanggal_selesai_magang: '',
  });

  // Modal Reset Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Lock body scroll when any modal is open
  useScrollLock(showUserModal || showResetModal);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { role: roleFilter, search: search }
      });
      if (res.data.status === 'success') {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserForm({
      nama: '',
      email: '',
      password: '',
      role: 'peserta',
      nim_nis: '',
      asal_instansi: '',
      no_hp: '',
      tanggal_mulai_magang: '',
      tanggal_selesai_magang: '',
    });
    setShowUserModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setUserForm({
      nama: user.nama,
      email: user.email,
      password: '',
      role: user.role,
      nim_nis: user.nim_nis || '',
      asal_instansi: user.asal_instansi || '',
      no_hp: user.no_hp || '',
      tanggal_mulai_magang: user.tanggal_mulai_magang || '',
      tanggal_selesai_magang: user.tanggal_selesai_magang || '',
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      if (editingUser) {
        const res = await api.put(`/admin/users/${editingUser.user_id}`, userForm);
        setAlert({ type: 'success', message: res.data.message });
      } else {
        const res = await api.post('/admin/users', userForm);
        setAlert({ type: 'success', message: res.data.message });
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan data user.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user.user_id}/toggle-status`);
      setAlert({ type: 'success', message: res.data.message });
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal mengubah status.' });
    }
  };

  const handleOpenReset = (user) => {
    setResetTargetUser(user);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setSubmitting(true);

    try {
      const res = await api.patch(`/admin/users/${resetTargetUser.user_id}/reset-password`, {
        password: newPassword
      });
      setAlert({ type: 'success', message: res.data.message });
      setShowResetModal(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal reset password.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${user.nama}?`)) return;

    try {
      const res = await api.delete(`/admin/users/${user.user_id}`);
      setAlert({ type: 'success', message: res.data.message });
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus user.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kelola Master Data User</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Manajemen pengguna sistem (Peserta, Pembimbing Lapangan, & Admin Instansi).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs"
        >
          <UserPlus size={16} />
          <span>Tambah User Baru</span>
        </button>
      </div>

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Filter and Search Bar */}
      <div className="card-clean p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
          >
            <option value="">Semua Role</option>
            <option value="peserta">Peserta Magang</option>
            <option value="pembimbing">Pembimbing Lapangan</option>
            <option value="admin">Admin Instansi</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Daftar User Sistem</h3>
          <span className="text-xs text-slate-500 font-medium">{users.length} Akun</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Nama & NIM</th>
                <th className="px-5 py-3.5">Email & No HP</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 text-xs">Memuat data user...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 text-xs">Tidak ada data user.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.nama}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.nim_nis || '-'}</div>
                      {u.asal_instansi && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-0.5">{u.asal_instansi}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-800 font-medium">{u.email}</div>
                      <div className="text-slate-400 text-[11px]">{u.no_hp || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.role === 'peserta' ? 'bg-amber-100 text-amber-900' :
                        u.role === 'pembimbing' ? 'bg-emerald-100 text-emerald-900' : 'bg-purple-100 text-purple-900'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                          u.status_aktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.status_aktif ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{u.status_aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenReset(u)}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit User */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit Data User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={userForm.nama}
                  onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password Initial</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role Akses</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 capitalize"
                >
                  <option value="peserta">Peserta Magang</option>
                  <option value="pembimbing">Pembimbing Lapangan</option>
                  <option value="admin">Admin Instansi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">NIM / NIP / Identifier (Opsional)</label>
                <input
                  type="text"
                  value={userForm.nim_nis}
                  onChange={(e) => setUserForm({ ...userForm, nim_nis: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asal Sekolah / Universitas / Instansi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Universitas Jenderal Soedirman"
                  value={userForm.asal_instansi}
                  onChange={(e) => setUserForm({ ...userForm, asal_instansi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">No HP / WhatsApp (Opsional)</label>
                <input
                  type="text"
                  value={userForm.no_hp}
                  onChange={(e) => setUserForm({ ...userForm, no_hp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {userForm.role === 'peserta' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tgl Mulai Magang</label>
                    <input
                      type="date"
                      value={userForm.tanggal_mulai_magang}
                      onChange={(e) => setUserForm({ ...userForm, tanggal_mulai_magang: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tgl Selesai Magang</label>
                    <input
                      type="date"
                      value={userForm.tanggal_selesai_magang}
                      onChange={(e) => setUserForm({ ...userForm, tanggal_selesai_magang: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Simpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Reset Password User</h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Setel ulang kata sandi untuk akun <strong>{resetTargetUser.nama}</strong> ({resetTargetUser.email}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password baru..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaUserPage;
