import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { BookOpen, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';

const ReviewLogbookPage = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useScrollLock(showModal);

  const [reviewData, setReviewData] = useState({
    status: 'Approve',
    catatan_pembimbing: '',
  });

  const fetchLogbooks = async () => {
    try {
      const res = await api.get('/logbook');
      if (res.data.status === 'success') {
        setLogbooks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const handleOpenReview = (logbook) => {
    setSelectedLogbook(logbook);
    setReviewData({
      status: logbook.status === 'Menunggu' ? 'Approve' : logbook.status,
      catatan_pembimbing: logbook.catatan_pembimbing || '',
    });
    setShowModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLogbook) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await api.put(`/logbook/${selectedLogbook.logbook_id}/review`, reviewData);
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: res.data.message });
        setShowModal(false);
        fetchLogbooks();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan review.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogbooks = logbooks.filter((item) => {
    if (filterStatus === 'Semua') return true;
    return item.status === filterStatus;
  });

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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review Logbook Mahasiswa</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Evaluasi aktivitas harian peserta bimbingan, beri catatan revisi atau persetujuan (Approve).
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200">
          {['Semua', 'Menunggu', 'Approve', 'Revisi'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === st ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Logbook List Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Daftar Logbook ({filterStatus})</h3>
          <span className="text-xs text-slate-500 font-medium">{filteredLogbooks.length} Logbook</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Peserta</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Judul Kegiatan & Deskripsi</th>
                <th className="px-5 py-3.5">Foto Bukti</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogbooks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Tidak ada data logbook untuk kategori status ini.
                  </td>
                </tr>
              ) : (
                filteredLogbooks.map((log) => (
                  <tr key={log.logbook_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{log.peserta?.nama || '-'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.peserta?.nim_nis || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 max-w-md">
                      <div className="font-bold text-slate-900">{log.judul_kegiatan}</div>
                      <div className="text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{log.deskripsi}</div>
                      {log.catatan_pembimbing && (
                        <div className="mt-1 text-amber-800 italic">Catatan: {log.catatan_pembimbing}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {log.foto_bukti ? (
                        <a
                          href={`/${log.foto_bukti}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ImageIcon size={14} />
                          <span>Lihat Foto</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenReview(log)}
                        className="btn-poli-primary px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedLogbook && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Review Logbook Mahasiswa</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-200/80 text-xs text-slate-700">
              <p><strong>Peserta:</strong> {selectedLogbook.peserta?.nama} ({selectedLogbook.peserta?.nim_nis})</p>
              <p><strong>Tanggal:</strong> {selectedLogbook.tanggal}</p>
              <p><strong>Judul:</strong> {selectedLogbook.judul_kegiatan}</p>
              <p><strong>Deskripsi:</strong> {selectedLogbook.deskripsi}</p>
              {selectedLogbook.kendala && <p><strong>Kendala:</strong> {selectedLogbook.kendala}</p>}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keputusan Review</label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Approve">Approve (Disetujui)</option>
                  <option value="Revisi">Revisi (Perlu Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Catatan Pembimbing (Opsional / Masukan)</label>
                <textarea
                  rows="3"
                  placeholder="Berikan masukan atau arahan revisi kepada peserta..."
                  value={reviewData.catatan_pembimbing}
                  onChange={(e) => setReviewData({ ...reviewData, catatan_pembimbing: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
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
                  {submitting ? 'Simpan...' : 'Simpan Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewLogbookPage;
