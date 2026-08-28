import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  UserPlus,
  Users
} from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import useScrollLock from '../../hooks/useScrollLock';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

const KelolaUserPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || '';

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState(roleParam);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    jurusan: '',
    posisi_magang: '',
    jabatan: '',
    no_hp: '',
    tanggal_mulai_magang: '',
    tanggal_selesai_magang: '',
  });

  // Sync roleFilter whenever URL param changes
  useEffect(() => {
    setRoleFilter(roleParam);
  }, [roleParam]);

  // Modal Reset Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Lock body scroll when any modal is open
  useScrollLock(showUserModal || showResetModal);

  const fetchUsers = async () => {
    setLoading(true);
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
    setCurrentPage(1);
    fetchUsers();
  }, [roleFilter, search]);

  const handleGoToTambahUser = () => {
    if (roleFilter === 'peserta') {
      navigate('/admin/tambah-user?role=peserta');
    } else if (roleFilter === 'pembimbing') {
      navigate('/admin/tambah-user?role=pembimbing');
    } else if (roleFilter === 'admin') {
      navigate('/admin/tambah-user?role=admin');
    } else {
      navigate('/admin/tambah-user');
    }
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
      jurusan: user.jurusan || '',
      posisi_magang: user.posisi_magang || '',
      jabatan: user.jabatan || '',
      no_hp: user.no_hp || '',
      tanggal_mulai_magang: user.tanggal_mulai_magang || '',
      tanggal_selesai_magang: user.tanggal_selesai_magang || '',
    });
    setShowUserModal(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserForm({
      nama: '',
      email: '',
      password: '',
      role: roleFilter || 'peserta',
      nim_nis: '',
      asal_instansi: '',
      jurusan: '',
      posisi_magang: '',
      jabatan: '',
      no_hp: '',
      tanggal_mulai_magang: '',
      tanggal_selesai_magang: '',
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
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
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal mengubah status user.' });
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
    setAlert(null);

    try {
      const res = await api.patch(`/admin/users/${resetTargetUser.user_id}/reset-password`, {
        password: newPassword
      });
      setAlert({ type: 'success', message: res.data.message });
      setShowResetModal(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal mereset password.' });
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

  let pageTitle = 'Kelola Master Data User';
  if (roleFilter === 'peserta') {
    pageTitle = 'Kelola Data Peserta Magang';
  } else if (roleFilter === 'pembimbing') {
    pageTitle = 'Kelola Data Pembimbing Lapangan';
  } else if (roleFilter === 'admin') {
    pageTitle = 'Kelola Data Admin Instansi';
  }

  return (
    <div className="space-y-4">
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Main Card Container */}
      <div className="card-clean overflow-hidden">
        {/* Header: Judul + Button Tambah */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users size={22} className="text-[#E8A800]" />
              <span>{pageTitle}</span>
            </h2>
            <button
              onClick={handleGoToTambahUser}
              className="btn-poli-primary px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 shadow-xs self-start sm:self-auto shrink-0"
            >
              <UserPlus size={15} />
              <span>+ Tambah User</span>
            </button>
          </div>

          {/* Interactive Role Filter Tabs & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => {
              setRoleFilter('');
              navigate('/admin/kelola-user');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !roleFilter
                ? 'bg-[#E8A800] text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Semua User
          </button>
          <button
            onClick={() => {
              setRoleFilter('peserta');
              navigate('/admin/kelola-user?role=peserta');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'peserta'
                ? 'bg-[#E8A800] text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Peserta Magang
          </button>
          <button
            onClick={() => {
              setRoleFilter('pembimbing');
              navigate('/admin/kelola-user?role=pembimbing');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'pembimbing'
                ? 'bg-[#E8A800] text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Pembimbing Lapangan
          </button>
          <button
            onClick={() => {
              setRoleFilter('admin');
              navigate('/admin/kelola-user?role=admin');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'admin'
                ? 'bg-[#E8A800] text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Admin Instansi
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              roleFilter === 'peserta'
                ? 'Cari nama, NIM, jurusan peserta...'
                : roleFilter === 'pembimbing'
                ? 'Cari nama, NIP, jabatan pembimbing...'
                : 'Cari nama, email, NIM/NIP...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Hapus pencarian"
            >
              <X size={12} />
            </button>
          )}
        </div>
          </div>
        </div>

        {/* User Table Area */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {!roleFilter && 'Daftar Semua User Sistem'}
            {roleFilter === 'peserta' && 'Daftar Peserta Magang'}
            {roleFilter === 'pembimbing' && 'Daftar Pembimbing Lapangan'}
            {roleFilter === 'admin' && 'Daftar Admin Instansi'}
          </h3>
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-0.5 rounded-full border border-slate-200">{users.length} Akun</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Nama & NIM/NIP</th>
                <th className="px-4 py-3.5">Instansi / Kampus</th>
                <th className="px-4 py-3.5">Jurusan</th>
                <th className="px-4 py-3.5">Posisi / Jabatan</th>
                <th className="px-4 py-3.5">Email & No HP</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status Akun</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400 text-xs italic">Memuat data user...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400 text-xs italic">
                    {roleFilter === 'peserta' && 'Tidak ada data peserta magang.'}
                    {roleFilter === 'pembimbing' && 'Tidak ada data pembimbing lapangan.'}
                    {roleFilter === 'admin' && 'Tidak ada data admin instansi.'}
                    {!roleFilter && 'Tidak ada data user ditemukan.'}
                  </td>
                </tr>
              ) : (
                users
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Nama & NIM */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.nama}</span>
                        {u.role === 'peserta' && u.is_magang_selesai && (
                          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                            Selesai Magang
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.nim_nis || '-'}</div>
                    </td>

                    {/* Instansi / Kampus */}
                    <td className="px-4 py-3.5">
                      {u.asal_instansi ? (
                        <span className="text-xs font-semibold text-slate-800">{u.asal_instansi}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Jurusan */}
                    <td className="px-4 py-3.5">
                      {u.jurusan ? (
                        <span className="text-xs font-medium text-slate-700">{u.jurusan}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Posisi / Jabatan */}
                    <td className="px-4 py-3.5">
                      {u.role === 'peserta' && u.posisi_magang ? (
                        <span className="text-xs font-medium text-slate-700">{u.posisi_magang}</span>
                      ) : u.jabatan ? (
                        <span className="text-xs font-medium text-slate-700">{u.jabatan}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Email & No HP */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{u.email}</div>
                      <div className="text-slate-400 text-[11px]">{u.no_hp || '-'}</div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.role === 'peserta' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        u.role === 'pembimbing' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                        u.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200 font-bold' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {u.role === 'admin' ? 'Administrator Sistem' : u.role}
                      </span>
                    </td>

                    {/* Status Akun */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.role === 'admin'}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                          u.status_aktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.status_aktif ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{u.status_aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          disabled={u.role === 'admin'}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Edit User"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenReset(u)}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Reset Password"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.role === 'admin'}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

        {/* Footer Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="akun"
        />
      </div>

      {/* Modal Add / Edit User */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit Data User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 karakter"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role Akses</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
                  >
                    <option value="peserta">Peserta Magang</option>
                    <option value="pembimbing">Pembimbing Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {userForm.role === 'peserta' ? 'NIM / NIS' : 'NIP / ID Pegawai'}
                  </label>
                  <input
                    type="text"
                    value={userForm.nim_nis}
                    onChange={(e) => setUserForm({ ...userForm, nim_nis: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">No HP / WhatsApp</label>
                <input
                  type="text"
                  value={userForm.no_hp}
                  onChange={(e) => setUserForm({ ...userForm, no_hp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {userForm.role === 'peserta' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asal Instansi / Kampus</label>
                    <input
                      type="text"
                      value={userForm.asal_instansi}
                      onChange={(e) => setUserForm({ ...userForm, asal_instansi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jurusan</label>
                      <input
                        type="text"
                        value={userForm.jurusan}
                        onChange={(e) => setUserForm({ ...userForm, jurusan: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Posisi Magang</label>
                      <input
                        type="text"
                        value={userForm.posisi_magang}
                        onChange={(e) => setUserForm({ ...userForm, posisi_magang: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Mulai Magang</label>
                      <input
                        type="date"
                        value={userForm.tanggal_mulai_magang}
                        onChange={(e) => setUserForm({ ...userForm, tanggal_mulai_magang: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Selesai Magang</label>
                      <input
                        type="date"
                        value={userForm.tanggal_selesai_magang}
                        onChange={(e) => setUserForm({ ...userForm, tanggal_selesai_magang: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                  </div>
                </>
              )}

              {userForm.role === 'pembimbing' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jabatan / Posisi</label>
                  <input
                    type="text"
                    value={userForm.jabatan}
                    onChange={(e) => setUserForm({ ...userForm, jabatan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                  />
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
                  {submitting ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Reset Password User</h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">User Target:</span>
                <p className="font-extrabold text-slate-900 text-sm">{resetTargetUser.nama}</p>
                <p className="text-slate-500 font-mono text-[11px]">{resetTargetUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 karakter"
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
                  {submitting ? 'Menyimpan...' : 'Reset Password'}
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
