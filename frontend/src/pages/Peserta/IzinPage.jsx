import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import DovetailDivider from '../../components/DovetailDivider';
import { Plus, FileText, AlertCircle, X, AlertTriangle } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { isMagangSelesai } from '../../utils/dateHelpers';

const IzinPage = () => {
  const { user } = useAuth();
  const magangSelesai = isMagangSelesai(user);
  const [izinList, setIzinList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useScrollLock(showModal);

  const [form, setForm] = useState({
    jenis: 'Izin',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date().toISOString().split('T')[0],
    keterangan: '',
    file_bukti: null,
  });

  const fetchIzin = async () => {
    try {
      const res = await api.get('/izin');
      if (res.data.status === 'success') {
        setIzinList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIzin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('jenis', form.jenis);
    formData.append('tanggal_mulai', form.tanggal_mulai);
    formData.append('tanggal_selesai', form.tanggal_selesai);
    if (form.keterangan) formData.append('keterangan', form.keterangan);
    if (form.file_bukti) formData.append('file_bukti', form.file_bukti);

    try {
      const res = await api.post('/izin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: 'Pengajuan izin/sakit berhasil dikirim.' });
        setShowModal(false);
        setForm({
          jenis: 'Izin',
          tanggal_mulai: new Date().toISOString().split('T')[0],
          tanggal_selesai: new Date().toISOString().split('T')[0],
          keterangan: '',
          file_bukti: null,
        });
        fetchIzin();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal mengirim pengajuan izin.' });
    } finally {
      setSubmitting(false);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengajuan Izin / Sakit</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Ajukan izin tidak hadir atau surat keterangan sakit kepada pembimbing lapangan.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={magangSelesai}
          className="flex items-center justify-center gap-2 btn-poli-primary disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs"
        >
          <Plus size={16} />
          <span>Buat Pengajuan Izin</span>
        </button>
      </div>

      <DovetailDivider className="my-2" />

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Banner Masa Magang Selesai */}
      {magangSelesai && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-900">Masa magang Anda telah selesai.</p>
            <p className="text-xs text-amber-800 mt-0.5">Pengajuan izin baru tidak tersedia. Anda masih dapat melihat riwayat pengajuan izin Anda.</p>
          </div>
        </div>
      )}

      {/* Permission Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Daftar Pengajuan Saya</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Jenis</th>
                <th className="px-5 py-3.5">Periode Tanggal</th>
                <th className="px-5 py-3.5">Keterangan</th>
                <th className="px-5 py-3.5">File Bukti</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {izinList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada pengajuan izin/sakit.
                  </td>
                </tr>
              ) : (
                izinList.map((item, idx) => (
                  <tr key={item.izin_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{item.jenis}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {item.tanggal_mulai} s/d {item.tanggal_selesai}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate">{item.keterangan || '-'}</td>
                    <td className="px-5 py-3.5">
                      {item.file_bukti ? (
                        <a
                          href={`/${item.file_bukti}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          <FileText size={14} />
                          <span>Unduh Bukti</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Izin */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Form Pengajuan Izin / Sakit</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jenis Permohonan</label>
                <select
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Izin">Izin (Keperluan Pribadi / Acara)</option>
                  <option value="Sakit">Sakit (Surat Dokter / Sakit)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={form.tanggal_mulai}
                    onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={form.tanggal_selesai}
                    onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keterangan Alasan</label>
                <textarea
                  rows="3"
                  placeholder="Jelaskan alasan izin / kendala kesehatan..."
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Berkas Lampiran / Surat Dokter (Maks 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => setForm({ ...form, file_bukti: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                />
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
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IzinPage;
