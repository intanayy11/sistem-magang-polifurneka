import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import DovetailDivider from '../../components/DovetailDivider';
import { Plus, BookOpen, Image as ImageIcon, X, Calendar, FileText, ExternalLink, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { getStorageUrl } from '../../utils/url';
import { nearestWorkdayOnOrBefore, isWeekend, todayLocalISO, isMagangSelesai } from '../../utils/dateHelpers';

const LOGBOOK_FILTERS = [
  { label: 'Semua', value: 'Semua' },
  { label: 'Menunggu', value: 'Menunggu' },
  { label: 'Disetujui', value: 'Approve' },
  { label: 'Perlu Revisi', value: 'Revisi' },
];

const ITEMS_PER_PAGE = 5;

const LogbookPage = () => {
  const { user } = useAuth();
  const magangSelesai = isMagangSelesai(user);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [dateNote, setDateNote] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  useScrollLock(showModal || !!selectedLogbook);

  const [form, setForm] = useState({
    tanggal: nearestWorkdayOnOrBefore(todayLocalISO()),
    judul_kegiatan: '',
    deskripsi: '',
    kendala: '',
    foto_bukti: null,
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

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Frontend guard: reject weekend dates before even calling API
    if (isWeekend(form.tanggal)) {
      setAlert({ type: 'error', message: 'Tidak ada aktivitas magang pada akhir pekan. Pilih tanggal hari kerja (Senin–Jumat).' });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('tanggal', form.tanggal);
    formData.append('judul_kegiatan', form.judul_kegiatan);
    formData.append('deskripsi', form.deskripsi);
    if (form.kendala) formData.append('kendala', form.kendala);
    if (form.foto_bukti) formData.append('foto_bukti', form.foto_bukti);

    try {
      const res = await api.post('/logbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: 'Logbook harian berhasil ditambahkan.' });
        setShowModal(false);
        setForm({
          tanggal: nearestWorkdayOnOrBefore(todayLocalISO()),
          judul_kegiatan: '',
          deskripsi: '',
          kendala: '',
          foto_bukti: null,
        });
        fetchLogbooks();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menambahkan logbook.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  const filteredLogbooks = activeFilter === 'Semua'
    ? logbooks
    : logbooks.filter(l => l.status === activeFilter);

  const totalPages = Math.ceil(filteredLogbooks.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogbooks = filteredLogbooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Top Header with Primary Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Logbook Kegiatan Harian</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={magangSelesai}
          className="btn-poli-primary disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Logbook Baru</span>
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
            <p className="text-xs text-amber-800 mt-0.5">Penambahan logbook baru tidak tersedia. Anda masih dapat melihat semua logbook yang sudah ada.</p>
          </div>
        </div>
      )}

      {/* Interactive Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {LOGBOOK_FILTERS.map((f) => {
          const count = f.value === 'Semua'
            ? logbooks.length
            : logbooks.filter(l => l.status === f.value).length;
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-[#E8A800] text-white border-[#E8A800] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-900'
              }`}
            >
              {f.label}
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bento Table View */}
      {filteredLogbooks.length === 0 ? (
        <div className="card-clean p-12 text-center">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-700 font-bold text-sm">
            {activeFilter === 'Semua' ? 'Belum Ada Logbook' : `Tidak ada logbook dengan status "${LOGBOOK_FILTERS.find(f => f.value === activeFilter)?.label}"`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {activeFilter === 'Semua' ? "Klik tombol 'Tambah Logbook Baru' di kanan atas untuk mengisi catatan harian." : 'Coba pilih tab filter lain.'}
          </p>
        </div>
      ) : (
        <div className="card-clean overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText size={16} className="text-[#E8A800]" />
              <span>Daftar Logbook Kegiatan</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-32">Tanggal</th>
                  <th className="px-5 py-3.5">Judul & Aktivitas</th>
                  <th className="px-5 py-3.5 max-w-xs">Kendala / Catatan Pembimbing</th>
                  <th className="px-5 py-3.5 w-32">Foto Bukti</th>
                  <th className="px-5 py-3.5 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogbooks.map((log) => (
                  <tr
                    key={log.logbook_id}
                    onClick={() => setSelectedLogbook(log)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                    title="Klik untuk melihat detail logbook"
                  >
                    
                    {/* Column 1: Tanggal */}
                    <td className="px-5 py-4 align-top">
                      <span className="text-xs font-bold text-slate-800 font-mono whitespace-nowrap bg-slate-100 group-hover:bg-amber-100/70 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-colors">
                        <Calendar size={12} className="text-amber-600 shrink-0" />
                        {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Column 2: Judul & Deskripsi */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-amber-900 transition-colors">{log.judul_kegiatan}</div>
                      <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed line-clamp-2 max-w-xl">
                        {log.deskripsi}
                      </p>
                    </td>

                    {/* Column 3: Kendala & Catatan Pembimbing */}
                    <td className="px-5 py-4 align-top max-w-xs space-y-2">
                      {log.kendala && (
                        <div className="text-[11px] text-slate-700">
                          <span className="font-bold text-slate-900">Kendala: </span>
                          <span className="text-slate-600 line-clamp-2">{log.kendala}</span>
                        </div>
                      )}

                      {log.catatan_pembimbing && (
                        <div className="text-[11px] text-slate-700 mt-1">
                          <span className="font-bold text-slate-900">Catatan Pembimbing: </span>
                          <span className="text-slate-600 line-clamp-2">{log.catatan_pembimbing}</span>
                        </div>
                      )}

                      {!log.kendala && !log.catatan_pembimbing && (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Column 4: Foto Bukti */}
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      {log.foto_bukti ? (
                        <a
                          href={getStorageUrl(log.foto_bukti)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                        >
                          <ImageIcon size={13} className="text-slate-500" />
                          <span>Lihat Foto</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Column 5: Status */}
                    <td className="px-5 py-4 align-top text-center whitespace-nowrap">
                      <StatusBadge status={log.status} />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          {filteredLogbooks.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 text-xs">
              <span className="text-slate-500 font-medium">
                Menampilkan <strong className="text-slate-800 font-mono">{startIndex + 1}</strong>–<strong className="text-slate-800 font-mono">{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogbooks.length)}</strong> dari <strong className="text-slate-800 font-mono">{filteredLogbooks.length}</strong> logbook
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#E8A800] text-slate-950 shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Logbook */}
      {selectedLogbook && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  {new Date(selectedLogbook.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <StatusBadge status={selectedLogbook.status} />
              </div>
              <button
                onClick={() => setSelectedLogbook(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-2">
                  {selectedLogbook.judul_kegiatan}
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed whitespace-pre-line text-xs font-normal">
                  {selectedLogbook.deskripsi}
                </div>
              </div>

              {selectedLogbook.kendala && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 space-y-1">
                  <span className="font-bold block text-xs text-slate-900">Kendala yang Dihadapi:</span>
                  <p className="leading-relaxed whitespace-pre-line text-xs text-slate-600">{selectedLogbook.kendala}</p>
                </div>
              )}

              {selectedLogbook.catatan_pembimbing && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 space-y-1">
                  <span className="font-bold block text-xs text-slate-900">Catatan Pembimbing Lapangan:</span>
                  <p className="leading-relaxed whitespace-pre-line text-xs text-slate-600">{selectedLogbook.catatan_pembimbing}</p>
                </div>
              )}

              {selectedLogbook.foto_bukti && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block text-xs">Foto Bukti Kegiatan:</span>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100">
                    <img
                      src={getStorageUrl(selectedLogbook.foto_bukti)}
                      alt="Foto Bukti Logbook"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <a
                    href={getStorageUrl(selectedLogbook.foto_bukti)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold hover:underline mt-1"
                  >
                    <ExternalLink size={14} />
                    <span>Buka Foto Ukuran Penuh</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogbook(null)}
                className="btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Logbook */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Tambah Logbook Harian</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Kegiatan</label>
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  max={todayLocalISO()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isWeekend(val)) {
                      const shifted = nearestWorkdayOnOrBefore(val);
                      setForm({ ...form, tanggal: shifted });
                      setDateNote('Pilih tanggal logbook sesuai hari kerja (Senin–Jumat).');
                    } else {
                      setForm({ ...form, tanggal: val });
                      setDateNote('');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
                {dateNote && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">⚠</span>
                    <span>{dateNote}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Perancangan Desain CAD & Pemotongan Kayu"
                  value={form.judul_kegiatan}
                  onChange={(e) => setForm({ ...form, judul_kegiatan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi Aktivitas</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Jelaskan pekerjaan yang diselesaikan hari ini..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kendala (Opsional)</label>
                <textarea
                  rows="2"
                  placeholder="Kendala yang dihadapi..."
                  value={form.kendala}
                  onChange={(e) => setForm({ ...form, kendala: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Foto Bukti (Maks 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => setForm({ ...form, foto_bukti: e.target.files[0] })}
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
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Logbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogbookPage;
