import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { getStorageUrl } from '../../utils/url';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  X
} from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import StatusBadge from '../../components/StatusBadge';
import useScrollLock from '../../hooks/useScrollLock';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

const ReviewLogbookPage = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Semua'); // Semua, Menunggu, Disetujui, Revisi
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const [reviewData, setReviewData] = useState({
    status: 'Disetujui',
    catatan_pembimbing: '',
  });

  const [alert, setAlert] = useState(null);

  // Lock body scroll when modal open
  useScrollLock(showModal);

  const fetchLogbooks = async () => {
    try {
      const res = await api.get('/logbook');
      if (res.data.status === 'success') {
        setLogbooks(res.data.data || []);
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
      status: (logbook.status === 'Menunggu' || logbook.status === 'Approve') ? 'Disetujui' : logbook.status,
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
      setAlert({ type: 'success', message: res.data.message });
      setShowModal(false);
      fetchLogbooks();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan review logbook.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogbooks = logbooks.filter((log) => {
    if (filterStatus === 'Semua') return true;
    if (filterStatus === 'Disetujui') return log.status === 'Disetujui' || log.status === 'Approve';
    return log.status === filterStatus;
  });


  return (
    <div className="space-y-4">
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Logbook List Table */}
      <div className="card-clean overflow-hidden">
        {/* Header: Judul + Filter Status */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen size={22} className="text-[#E8A800]" />
            <span>Review Logbook Mahasiswa</span>
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-semibold border border-slate-200">
              {['Semua', 'Menunggu', 'Disetujui', 'Revisi'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === st ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">{filteredLogbooks.length} Logbook</span>
          </div>
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs font-medium">
                    Memuat data logbook...
                  </td>
                </tr>
              ) : filteredLogbooks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Tidak ada data logbook untuk kategori status ini.
                  </td>
                </tr>
              ) : (
                filteredLogbooks
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((log) => (
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
                          href={getStorageUrl(log.foto_bukti)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold hover:underline"
                        >
                          <ImageIcon size={14} />
                          <span>Lihat Foto</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenReview(log)}
                        className="btn-poli-primary px-3.5 py-1.5 rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
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

        {/* Footer Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredLogbooks.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="logbook"
        />
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
                >
                  <option value="Disetujui">Disetujui</option>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Keputusan'}
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
