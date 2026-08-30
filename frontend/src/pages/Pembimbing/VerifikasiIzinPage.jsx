import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { FileText, AlertCircle, X } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

const VerifikasiIzinPage = () => {
  const [izinList, setIzinList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIzin, setSelectedIzin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useScrollLock(showModal);

  const [verifikasiStatus, setVerifikasiStatus] = useState('Disetujui');

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

  const handleOpenVerifikasi = (izin) => {
    setSelectedIzin(izin);
    setVerifikasiStatus(izin.status === 'Menunggu' ? 'Disetujui' : izin.status);
    setShowModal(true);
  };

  const handleVerifikasiSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIzin) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await api.put(`/izin/${selectedIzin.izin_id}/verifikasi`, {
        status: verifikasiStatus
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: res.data.message });
        setShowModal(false);
        fetchIzin();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal memverifikasi izin.' });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="space-y-4">
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Permission List Table */}
      <div className="card-clean overflow-hidden">
        {/* Header: Judul + Count */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText size={22} className="text-[#E8A800]" />
            <span>Verifikasi Izin / Sakit</span>
          </h2>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Daftar Pengajuan Ketidakhadiran</p>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">{izinList.length} Pengajuan</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Peserta</th>
                <th className="px-5 py-3.5">Jenis</th>
                <th className="px-5 py-3.5">Periode Tanggal</th>
                <th className="px-5 py-3.5">Keterangan</th>
                <th className="px-5 py-3.5">Bukti</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs font-medium">
                    Memuat data pengajuan izin...
                  </td>
                </tr>
              ) : izinList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada pengajuan izin/sakit dari peserta bimbingan.
                  </td>
                </tr>
              ) : (
                izinList
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((item) => (
                  <tr key={item.izin_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{item.peserta?.nama || '-'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.peserta?.nim_nis || '-'}</div>
                    </td>
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
                          <span>Unduh File</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenVerifikasi(item)}
                        className="btn-poli-primary px-3.5 py-1.5 rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                      >
                        Verifikasi
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
          totalItems={izinList.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="pengajuan"
        />
      </div>

      {/* Modal Verifikasi */}
      {showModal && selectedIzin && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Verifikasi Pengajuan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-200/80 text-xs text-slate-700">
              <p><strong>Peserta:</strong> {selectedIzin.peserta?.nama} ({selectedIzin.peserta?.nim_nis})</p>
              <p><strong>Jenis:</strong> {selectedIzin.jenis}</p>
              <p><strong>Periode:</strong> {selectedIzin.tanggal_mulai} s/d {selectedIzin.tanggal_selesai}</p>
              <p><strong>Keterangan:</strong> {selectedIzin.keterangan || '-'}</p>
            </div>

            <form onSubmit={handleVerifikasiSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Status Verifikasi</label>
                <select
                  value={verifikasiStatus}
                  onChange={(e) => setVerifikasiStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Verifikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifikasiIzinPage;
