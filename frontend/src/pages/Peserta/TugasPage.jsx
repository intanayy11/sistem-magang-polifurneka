import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { getStorageUrl } from '../../utils/url';
import DovetailDivider from '../../components/DovetailDivider';
import {
  CheckSquare,
  FileText,
  Upload,
  Link as LinkIcon,
  Calendar,
  X,
  History,
  ExternalLink,
} from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { isTaskOverdue } from '../../utils/dateHelpers';

const STATUS_FILTERS = [
  { label: 'Semua', value: 'Semua' },
  { label: 'Belum Dikerjakan', value: 'Belum Dikerjakan' },
  { label: 'Menunggu Review', value: 'Menunggu Review' },
  { label: 'Perlu Revisi', value: 'Perlu Revisi' },
  { label: 'Selesai', value: 'Selesai' },
];

const TugasPage = () => {
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Semua');

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  const filteredList = activeFilter === 'Semua'
    ? tugasList
    : tugasList.filter(t => t.status === activeFilter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tugas Magang</h2>
        <p className="text-slate-500 text-xs mt-0.5">Kumpulkan hasil pengerjaan dan pantau status revisi dari pembimbing.</p>
      </div>

      <DovetailDivider className="my-2" />

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const count = f.value === 'Semua'
            ? tugasList.length
            : tugasList.filter(t => t.status === f.value).length;
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

      {/* Task Grid — Full Width */}
      {filteredList.length === 0 ? (
        <div className="card-bento p-12 text-center">
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
          {filteredList.map((tugas) => (
            <div key={tugas.tugas_id} className="card-bento p-5 flex flex-col justify-between">
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
                  className="btn-poli-primary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold"
                >
                  <FileText size={13} />
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail & Submission Modal */}
      {showDetailModal && selectedTugas && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedTugas.status} />
                  <span className="text-xs text-slate-400 font-mono">#{selectedTugas.tugas_id}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedTugas.judul}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Task Info */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80 text-xs">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{selectedTugas.deskripsi}</p>
              <div className="pt-2 text-slate-500 flex flex-wrap gap-4 border-t border-slate-200/60">
                <span>Pembimbing: <strong>{selectedTugas.pembimbing?.nama}</strong></span>
                <span>Deadline: <strong>{new Date(selectedTugas.deadline).toLocaleString('id-ID')}</strong></span>
              </div>
              {selectedTugas.file_lampiran && (
                <div className="pt-2">
                  <a
                    href={getStorageUrl(selectedTugas.file_lampiran)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-900 font-bold hover:underline bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200/80"
                  >
                    <ExternalLink size={14} />
                    Download File Lampiran
                  </a>
                </div>
              )}
            </div>

            {/* Submit Form */}
            {selectedTugas.status !== 'Selesai' && (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Upload size={15} className="text-amber-600" />
                  Kumpulkan Hasil Kerja
                </h4>

                <div className="flex gap-4 border-b border-amber-200/60 pb-2">
                  {['file', 'link'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSubmitType(type)}
                      className={`text-xs font-bold pb-1 flex items-center gap-1.5 ${
                        submitType === type ? 'text-amber-900 border-b-2 border-amber-600' : 'text-slate-500'
                      }`}
                    >
                      {type === 'file' ? <Upload size={13} /> : <LinkIcon size={13} />}
                      {type === 'file' ? 'Unggah File' : 'Link URL'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmitTugas} className="space-y-3">
                  {submitType === 'file' ? (
                    <input
                      type="file"
                      onChange={(e) => setFileHasil(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                    />
                  ) : (
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={linkHasil}
                      onChange={(e) => setLinkHasil(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold disabled:opacity-50"
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Pengumpulan'}
                  </button>
                </form>
              </div>
            )}

            {/* Submission History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <History size={15} className="text-slate-500" />
                Riwayat Pengumpulan
              </h4>

              {!selectedTugas.pengumpulan?.length ? (
                <p className="text-xs text-slate-400 italic">Belum pernah dikumpulkan.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedTugas.pengumpulan.map((p) => (
                    <div key={p.pengumpulan_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">Versi #{p.versi_ke}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{new Date(p.tanggal_submit).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Hasil:</span>
                        {p.file_hasil?.startsWith('http') ? (
                          <a href={p.file_hasil} target="_blank" rel="noreferrer" className="text-amber-900 hover:underline flex items-center gap-1 font-bold">
                            <LinkIcon size={12} /><span className="truncate max-w-[200px]">{p.file_hasil}</span>
                          </a>
                        ) : (
                          <a href={getStorageUrl(p.file_hasil)} target="_blank" rel="noreferrer" className="text-amber-900 hover:underline flex items-center gap-1 font-bold">
                            <FileText size={12} />Unduh File
                          </a>
                        )}
                      </div>
                      {p.catatan_revisi && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 mt-1">
                          <span className="font-bold block mb-0.5">Catatan Revisi:</span>
                          {p.catatan_revisi}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TugasPage;
