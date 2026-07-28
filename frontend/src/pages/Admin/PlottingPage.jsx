import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, AlertCircle, X } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';

const PlottingPage = () => {
  const [plottingList, setPlottingList] = useState([]);
  const [pesertaOptions, setPesertaOptions] = useState([]);
  const [pembimbingOptions, setPembimbingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal Create Plotting
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    peserta_id: '',
    pembimbing_id: '',
  });

  useScrollLock(showModal);

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Plotting Bimbingan Magang</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Petakan peserta magang dengan pembimbing lapangan.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs"
        >
          <Plus size={16} />
          <span>Tambah Plotting Pasangan</span>
        </button>
      </div>

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Plotting Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Daftar Plotting Aktif</h3>
          <span className="text-xs text-slate-500 font-medium">{plottingList.length} Pasangan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Peserta Magang</th>
                <th className="px-5 py-3.5">Pembimbing Lapangan</th>
                <th className="px-5 py-3.5">Periode Magang Peserta</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plottingList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada data plotting bimbingan.
                  </td>
                </tr>
              ) : (
                plottingList.map((item, idx) => (
                  <tr key={item.plotting_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{item.peserta?.nama || '-'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.peserta?.nim_nis || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-amber-900">{item.pembimbing?.nama || '-'}</div>
                      <div className="text-[11px] text-slate-400">{item.pembimbing?.email || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {item.peserta?.tanggal_mulai_magang || '-'} s/d {item.peserta?.tanggal_selesai_magang || 'Sekarang'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item.plotting_id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Plotting"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
};

export default PlottingPage;
