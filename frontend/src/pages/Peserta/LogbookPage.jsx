import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import DovetailDivider from '../../components/DovetailDivider';
import { Plus, BookOpen, Image as ImageIcon, X, Calendar, FileText, ExternalLink, ChevronLeft, ChevronRight, AlertTriangle, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

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

  const filteredLogbooks = logbooks.filter((l) => {
    const matchesStatus = activeFilter === 'Semua' || l.status === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (l.judul_kegiatan && l.judul_kegiatan.toLowerCase().includes(q)) ||
      (l.deskripsi && l.deskripsi.toLowerCase().includes(q)) ||
      (l.kendala && l.kendala.toLowerCase().includes(q)) ||
      (l.catatan_pembimbing && l.catatan_pembimbing.toLowerCase().includes(q)) ||
      (l.tanggal && l.tanggal.includes(q));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogbooks.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogbooks = filteredLogbooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
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

      {/* Bento Table Card Container */}
      <div className="card-clean overflow-hidden">
        {/* Table Top Header: Title (Logbook Kegiatan Harian diperbesar) + Sejajar: Search -> Filter -> Button Tambah */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
          {/* Judul Utama Logbook Kegiatan Harian (Diperbesar) */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText size={22} className="text-[#E8A800]" />
              <span>Logbook Kegiatan Harian</span>
            </h2>
          </div>

          {/* Baris Kontrol Sejajar Horizontal: Search Box -> Filter Pills -> Button Tambah Logbook */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            
            {/* Sisi Kiri: Search Input Box + Filter Pills Sejajar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
              {/* 1. Search Input Box (Paling Kiri) */}
              <div className="relative w-full sm:w-60 shrink-0">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari logbook, tanggal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Bersihkan pencarian"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 2. Filter Pills (Samping Search) */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {LOGBOOK_FILTERS.map((f) => {
                  const count = f.value === 'Semua'
                    ? logbooks.length
                    : logbooks.filter(l => l.status === f.value).length;
                  const isActive = activeFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setActiveFilter(f.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#E8A800] text-slate-950 border-[#E8A800] shadow-2xs font-extrabold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Button Tambah Logbook Baru (Samping Kanan Filter) */}
            <button
              onClick={() => setShowModal(true)}
              disabled={magangSelesai}
              className="btn-poli-primary disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Logbook Baru</span>
            </button>
          </div>
        </div>

        {/* Table Body or Empty State */}
        {filteredLogbooks.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-700 font-bold text-sm">
              {activeFilter === 'Semua' ? 'Belum Ada Logbook' : `Tidak ada logbook dengan status "${LOGBOOK_FILTERS.find(f => f.value === activeFilter)?.label}"`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeFilter === 'Semua' ? "Klik tombol 'Tambah Logbook Baru' di atas untuk mengisi catatan harian." : 'Coba pilih tab filter lain.'}
            </p>
          </div>
        ) : (
          <>
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
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800">
                          {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Column 2: Judul & Deskripsi */}
                      <td className="px-5 py-4 align-top max-w-md">
                        <div className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors text-xs mb-1">
                          {log.judul_kegiatan}
                        </div>
                        <div className="text-slate-600 leading-relaxed text-xs line-clamp-3">
                          {log.deskripsi}
                        </div>
                      </td>

                      {/* Column 3: Kendala & Catatan Pembimbing */}
                      <td className="px-5 py-4 align-top max-w-xs space-y-1.5">
                        {log.kendala ? (
                          <div className="text-slate-600 italic">
                            <span className="font-semibold not-italic text-slate-700">Kendala: </span>
                            {log.kendala}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal italic">-</span>
                        )}

                        {log.catatan_pembimbing && (
                          <div className="mt-1 p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                            <span className="font-bold">Pembimbing: </span>
                            {log.catatan_pembimbing}
                          </div>
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
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-200/80 transition-all shadow-2xs"
                          >
                            <ImageIcon size={13} className="text-amber-900" />
                            <span>Foto Bukti</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-normal italic">-</span>
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
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#E8A800] text-slate-950 shadow-2xs'
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
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
