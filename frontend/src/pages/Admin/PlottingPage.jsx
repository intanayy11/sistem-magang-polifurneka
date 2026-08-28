import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Pencil, X, GitBranch } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

const PlottingPage = () => {
  const [plottingList, setPlottingList] = useState([]);
  const [pesertaOptions, setPesertaOptions] = useState([]);
  const [pembimbingOptions, setPembimbingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Tab State: 'semua' | 'aktif' | 'selesai'
  const [activeTab, setActiveTab] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Modal Create Plotting
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    peserta_id: '',
    pembimbing_id: '',
  });

  // Modal Edit Plotting
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editPembimbingId, setEditPembimbingId] = useState('');

  useScrollLock(showModal || editModal);

  const fetchData = async () => {
    try {
      const [plottingRes, optionsRes] = await Promise.all([
        api.get('/admin/plotting'),
        api.get('/admin/options'),
      ]);

      if (plottingRes.data.status === 'success') {
        setPlottingList(plottingRes.data.data);
      }
      if (optionsRes.data.status === 'success') {
        const { peserta, pembimbing } = optionsRes.data.data;
        setPesertaOptions(peserta);
        setPembimbingOptions(pembimbing);
        if (peserta.length > 0 && pembimbing.length > 0) {
          setForm((prev) => ({
            ...prev,
            peserta_id: peserta[0].user_id,
            pembimbing_id: pembimbing[0].user_id,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      const res = await api.post('/admin/plotting', form);
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: res.data.message });
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan plotting.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditPembimbingId(item.pembimbing_id || item.pembimbing?.user_id || '');
    setEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setSubmitting(true);
    setAlert(null);

    try {
      const res = await api.put(`/admin/plotting/${editItem.plotting_id}`, {
        pembimbing_id: editPembimbingId,
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: res.data.message });
        setEditModal(false);
        setEditItem(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal memperbarui plotting.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus plotting bimbingan ini?')) return;

    try {
      const res = await api.delete(`/admin/plotting/${id}`);
      setAlert({ type: 'success', message: res.data.message });
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus plotting.' });
    }
  };

  // Filtering data berdasarkan tab
  const activeCount = plottingList.filter((i) => !i.peserta?.is_magang_selesai).length;
  const selesaiCount = plottingList.filter((i) => i.peserta?.is_magang_selesai).length;

  const displayList = plottingList.filter((item) => {
    if (activeTab === 'aktif') return !item.peserta?.is_magang_selesai;
    if (activeTab === 'selesai') return item.peserta?.is_magang_selesai;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Plotting Table Card */}
      <div className="card-clean overflow-hidden">
        {/* Header: Judul + Tambah Button + Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <GitBranch size={22} className="text-[#E8A800]" />
              <span>Plotting Bimbingan Magang</span>
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Tambah Plotting Pasangan</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {activeTab === 'semua' && 'Daftar Plotting Bimbingan Magang'}
                {activeTab === 'aktif' && 'Daftar Plotting Aktif'}
                {activeTab === 'selesai' && 'Daftar Plotting Selesai Magang'}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/60">
              <button
                onClick={() => setActiveTab('semua')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'semua'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
              >
                Semua ({plottingList.length})
              </button>
              <button
                onClick={() => setActiveTab('aktif')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'aktif'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
              >
                Aktif ({activeCount})
              </button>
              <button
                onClick={() => setActiveTab('selesai')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'selesai'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
              >
                Selesai ({selesaiCount})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Peserta Magang</th>
                <th className="px-5 py-3.5">Pembimbing Lapangan</th>
                <th className="px-5 py-3.5">Periode Magang Peserta</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                    {activeTab === 'aktif' && 'Tidak ada peserta magang yang sedang aktif.'}
                    {activeTab === 'selesai' && 'Belum ada peserta magang yang selesai.'}
                    {activeTab === 'semua' && 'Belum ada data plotting bimbingan.'}
                  </td>
                </tr>
              ) : (
                displayList
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((item, idx) => (
                    <tr key={item.plotting_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">
                          {item.peserta?.nama || '-'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{item.peserta?.jurusan || '-'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-amber-900">{item.pembimbing?.nama || '-'}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{item.pembimbing?.jabatan || item.pembimbing?.posisi_magang || '-'}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">
                        {item.peserta?.tanggal_mulai_magang || '-'} s/d {item.peserta?.tanggal_selesai_magang || 'Sekarang'}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.peserta?.is_magang_selesai ? (
                          <span className="inline-flex items-center text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Pembimbing Plotting"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.plotting_id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Plotting"
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
          totalItems={displayList.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="pasangan"
        />
      </div>

      {/* Modal Add Plotting */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Tambah Plotting Bimbingan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Peserta Magang</label>
                <select
                  required
                  value={form.peserta_id}
                  onChange={(e) => setForm({ ...form, peserta_id: e.target.value })}
                  disabled={pesertaOptions.length === 0}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 disabled:opacity-60"
                >
                  {pesertaOptions.length === 0 ? (
                    <option value="">-- Semua peserta magang sudah di-plotting --</option>
                  ) : (
                    pesertaOptions.map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.nama} ({p.nim_nis || p.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Pembimbing Lapangan</label>
                <select
                  required
                  value={form.pembimbing_id}
                  onChange={(e) => setForm({ ...form, pembimbing_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  {pembimbingOptions.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.nama} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Simpan...' : 'Simpan Plotting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Plotting */}
      {editModal && editItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Pembimbing Plotting</h3>
              <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Peserta Magang:</span>
                <p className="font-extrabold text-slate-900 text-sm">{editItem.peserta?.nama || '-'}</p>
                <p className="text-slate-500 font-mono text-[11px]">{editItem.peserta?.nim_nis || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ganti Pembimbing Lapangan</label>
                <select
                  required
                  value={editPembimbingId}
                  onChange={(e) => setEditPembimbingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
                >
                  {pembimbingOptions.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.nama} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Perbarui Plotting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlottingPage;
