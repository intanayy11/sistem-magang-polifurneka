import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { getStorageUrl } from '../../utils/url';
import {
  CheckSquare,
  FileText,
  Upload,
  Link as LinkIcon,
  Calendar,
  X,
  History,
  ExternalLink,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { isTaskOverdue, isMagangSelesai, dalamGracePeriodRevisi } from '../../utils/dateHelpers';
import Pagination from '../../components/Pagination';

const STATUS_FILTERS = [
  { label: 'Semua', value: 'Semua' },
  { label: 'Belum Dikerjakan', value: 'Belum Dikerjakan' },
  { label: 'Menunggu Review', value: 'Menunggu Review' },
  { label: 'Perlu Revisi', value: 'Perlu Revisi' },
  { label: 'Selesai', value: 'Selesai' },
];

const ITEMS_PER_PAGE = 6;

const TugasPage = () => {
  const { user } = useAuth();
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  useScrollLock(showDetailModal);

  const [submitType, setSubmitType] = useState('file');
  const [fileHasil, setFileHasil] = useState(null);
  const [linkHasil, setLinkHasil] = useState('');

  const fetchTugas = async () => {
    try {
      const res = await api.get('/tugas');
      if (res.data.status === 'success') setTugasList(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTugas(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handleOpenDetail = async (id) => {
    try {
      const res = await api.get(`/tugas/${id}`);
      if (res.data.status === 'success') {
        setSelectedTugas(res.data.data);
        setShowDetailModal(true);
        setSubmitType('file');
        setFileHasil(null);
        setLinkHasil('');
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmitTugas = async (e) => {
    e.preventDefault();
    if (!selectedTugas) return;
    setSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    if (submitType === 'file') {
      if (!fileHasil) { setAlert({ type: 'error', message: 'Harap pilih file hasil kerja.' }); setSubmitting(false); return; }
      formData.append('file_hasil', fileHasil);
    } else {
      if (!linkHasil) { setAlert({ type: 'error', message: 'Harap masukkan link URL.' }); setSubmitting(false); return; }
      formData.append('link_hasil', linkHasil);
    }

    try {
      const res = await api.post(`/tugas/${selectedTugas.tugas_id}/kumpul`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: res.data.message });
        handleOpenDetail(selectedTugas.tugas_id);
        fetchTugas();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal mengumpulkan tugas.' });
    } finally {
      setSubmitting(false);
    }
  };


  const filteredList = activeFilter === 'Semua'
    ? tugasList
    : tugasList.filter(t => t.status === activeFilter);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* ── UNIFIED CARD WADAH UTAMA TUGAS MAGANG ── */}
      <div className="card-clean overflow-hidden">
        {/* Table/Card Header: Judul + Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CheckSquare size={22} className="text-[#E8A800]" />
              <span>Tugas Magang</span>
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            {STATUS_FILTERS.map((f) => {
              const count = f.value === 'Semua'
                ? tugasList.length
                : tugasList.filter(t => t.status === f.value).length;
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 border-slate-300 shadow-sm font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-200 text-slate-700' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Content Grid Inside Unified Card Container */}
        <div className="p-4 sm:p-5 bg-slate-50/40">
          {loading ? (
            <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200/80">
              <p className="text-slate-500 font-medium text-xs">Memuat daftar tugas...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200/80">
              <CheckSquare size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-700 font-bold text-sm">
                {activeFilter === 'Semua' ? 'Belum Ada Tugas' : `Tidak ada tugas dengan status "${activeFilter}"`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {activeFilter === 'Semua' ? 'Belum ada tugas yang diberikan oleh pembimbing Anda.' : 'Coba pilih filter lain.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedList.map((tugas) => (
                <div key={tugas.tugas_id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:border-amber-300 hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 flex-wrap">
                        <Calendar size={13} className={isTaskOverdue(tugas.deadline, tugas.status) ? "text-rose-600 shrink-0" : "text-amber-600 shrink-0"} />
                        <span className={isTaskOverdue(tugas.deadline, tugas.status) ? "text-rose-700 font-bold" : ""}>
                          {new Date(tugas.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {isTaskOverdue(tugas.deadline, tugas.status) && (
                          <span className="text-[10px] font-extrabold text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-2xs">
                            Lewat Tenggat
                          </span>
                        )}
                      </span>
                      <StatusBadge status={tugas.status} />
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{tugas.judul}</h3>
                    <p className="text-slate-500 text-xs mb-3 line-clamp-2 leading-relaxed">{tugas.deskripsi || 'Tidak ada deskripsi.'}</p>

                    <p className="text-[11px] text-slate-400">
                      Pembimbing: <span className="font-semibold text-slate-700">{tugas.pembimbing?.nama || '-'}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
                    <span className="text-[11px] text-slate-400">{tugas.pengumpulan?.length || 0} pengumpulan</span>
                    <button
                      onClick={() => handleOpenDetail(tugas.tugas_id)}
                      className="btn-poli-primary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <FileText size={13} />
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls Footer */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="tugas"
        />
      </div>

      {/* Detail & Submission Modal */}
      {showDetailModal && selectedTugas && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedTugas.status} />
                  {isTaskOverdue(selectedTugas.deadline, selectedTugas.status) && (
                    <span className="text-[10px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded shadow-2xs">
                      Lewat Tenggat
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{selectedTugas.judul}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-amber-900 font-semibold">
                <Calendar size={14} className="text-amber-600" />
                <span>Deadline: {new Date(selectedTugas.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedTugas.deskripsi || 'Tidak ada deskripsi detail.'}</p>
              {selectedTugas.file_tugas && (
                <div className="pt-2">
                  <a
                    href={getStorageUrl(selectedTugas.file_tugas)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline"
                  >
                    <ExternalLink size={13} />
                    <span>Unduh Lampiran Berkas Tugas Pembimbing</span>
                  </a>
                </div>
              )}
            </div>

            {/* Riwayat Pengumpulan */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-amber-600" />
                <span>Riwayat Pengumpulan & Revisi</span>
              </h4>

              {selectedTugas.pengumpulan?.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                  Belum pernah mengumpulkan hasil kerja.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTugas.pengumpulan?.map((p) => (
                    <div key={p.pengumpulan_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>Pengumpulan Versi {p.versi_ke}</span>
                        <span className="text-[10px] text-slate-400">{p.tanggal_submit}</span>
                      </div>
                      <div className="text-slate-600">
                        {p.file_hasil ? (
                          <a href={getStorageUrl(p.file_hasil)} target="_blank" rel="noreferrer" className="text-amber-900 font-semibold hover:underline flex items-center gap-1">
                            <ExternalLink size={12} /> Liha Berkas / Tautan Hasil Kerja
                          </a>
                        ) : '-'}
                      </div>
                      {p.catatan_revisi && (
                        <div className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/80 text-[11px] mt-1">
                          <strong>Catatan Pembimbing:</strong> {p.catatan_revisi}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Submit / Pengumpulan Baru */}
            {selectedTugas.status !== 'Selesai' && (
              !isMagangSelesai(user) ? (
                isTaskOverdue(selectedTugas.deadline, selectedTugas.status) && !dalamGracePeriodRevisi(selectedTugas) ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                    <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                    <span>Masa tenggat pengerjaan telah lewat. Batas pengumpulan tugas telah ditutup.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTugas} className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      {selectedTugas.status === 'Perlu Revisi' ? 'Kumpulkan Revisi Tugas (Versi Baru)' : 'Form Pengumpulan Tugas'}
                    </h4>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="submitType"
                          value="file"
                          checked={submitType === 'file'}
                          onChange={() => setSubmitType('file')}
                          className="accent-[#E8A800]"
                        />
                        <span>Unggah File Dokumen</span>
                      </label>
                      <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="submitType"
                          value="link"
                          checked={submitType === 'link'}
                          onChange={() => setSubmitType('link')}
                          className="accent-[#E8A800]"
                        />
                        <span>Tautan Link (Google Drive / GitHub / URL)</span>
                      </label>
                    </div>

                    {submitType === 'file' ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => setFileHasil(e.target.files[0])}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Format didukung: PDF, DOCX, XLSX, ZIP, RAR, JPG, PNG (Maksimal 5MB)</p>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={linkHasil}
                          onChange={(e) => setLinkHasil(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#E8A800]"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDetailModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-poli-primary px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Upload size={14} />
                        <span>{submitting ? 'Mengirim...' : 'Kumpulkan Tugas'}</span>
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>Periode magang Anda telah selesai. Pengumpulan tugas baru tidak tersedia.</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TugasPage;
