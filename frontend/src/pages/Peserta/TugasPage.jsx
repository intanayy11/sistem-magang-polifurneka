import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckSquare,
  FileText,
  Upload,
  Link as LinkIcon,
  Calendar,
  AlertCircle,
  X,
  History,
  ExternalLink
} from 'lucide-react';

const TugasPage = () => {
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form submit state
  const [submitType, setSubmitType] = useState('file'); // 'file' or 'link'
  const [fileHasil, setFileHasil] = useState(null);
  const [linkHasil, setLinkHasil] = useState('');

  const fetchTugas = async () => {
    try {
      const res = await api.get('/tugas');
      if (res.data.status === 'success') {
        setTugasList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTugas();
  }, []);

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTugas = async (e) => {
    e.preventDefault();
    if (!selectedTugas) return;

    setSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    if (submitType === 'file') {
      if (!fileHasil) {
        setAlert({ type: 'error', message: 'Harap pilih file hasil kerja.' });
        setSubmitting(false);
        return;
      }
      formData.append('file_hasil', fileHasil);
    } else {
      if (!linkHasil) {
        setAlert({ type: 'error', message: 'Harap masukkan link URL hasil kerja.' });
        setSubmitting(false);
        return;
      }
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tugas Magang Saya</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Lihat daftar tugas yang diberikan oleh pembimbing, unggah hasil kerja, dan pantau riwayat revisi.
        </p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <AlertCircle size={16} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tugasList.length === 0 ? (
          <div className="col-span-full card-clean p-12 text-center">
            <CheckSquare size={44} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium text-sm">Belum ada tugas yang ditugaskan kepada Anda.</p>
          </div>
        ) : (
          tugasList.map((tugas) => (
            <div key={tugas.tugas_id} className="card-clean p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar size={13} className="text-amber-600" />
                    Deadline: {new Date(tugas.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <StatusBadge status={tugas.status} />
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{tugas.judul}</h3>
                <p className="text-slate-600 text-xs mb-3 line-clamp-3 leading-relaxed">{tugas.deskripsi || 'Tidak ada deskripsi.'}</p>

                <div className="text-xs text-slate-500 mb-4">
                  Pembimbing: <span className="font-semibold text-slate-700">{tugas.pembimbing?.nama || '-'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {tugas.pengumpulan?.length || 0} Pengumpulan
                </span>
                <button
                  onClick={() => handleOpenDetail(tugas.tugas_id)}
                  className="btn-poli-primary px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 shadow-2xs"
                >
                  <FileText size={14} />
                  <span>Detail & Kumpulkan</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail & Submission Modal */}
      {showDetailModal && selectedTugas && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedTugas.status} />
                  <span className="text-xs text-slate-400 font-mono">ID Tugas: #{selectedTugas.tugas_id}</span>
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
                    href={`/${selectedTugas.file_lampiran}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-semibold hover:underline bg-amber-100/60 px-2.5 py-1 rounded-lg border border-amber-200/60"
                  >
                    <ExternalLink size={14} />
                    <span>Download File Lampiran Pembimbing</span>
                  </a>
                </div>
              )}
            </div>

            {/* Form Upload / Submit */}
            {selectedTugas.status !== 'Selesai' && (
              <div className="bg-amber-50/40 p-4 md:p-5 rounded-2xl border border-amber-200/60 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Upload size={15} className="text-amber-600" />
                  Kumpulkan / Unggah Ulang Hasil Kerja
                </h4>

                <div className="flex gap-4 border-b border-amber-200/60 pb-2">
                  <button
                    type="button"
                    onClick={() => setSubmitType('file')}
                    className={`text-xs font-bold pb-1 flex items-center gap-1.5 ${
                      submitType === 'file' ? 'text-amber-800 border-b-2 border-amber-600' : 'text-slate-500'
                    }`}
                  >
                    <Upload size={13} />
                    Unggah Berkas File
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitType('link')}
                    className={`text-xs font-bold pb-1 flex items-center gap-1.5 ${
                      submitType === 'link' ? 'text-amber-800 border-b-2 border-amber-600' : 'text-slate-500'
                    }`}
                  >
                    <LinkIcon size={13} />
                    Tautan Link (Drive/GitHub)
                  </button>
                </div>

                <form onSubmit={handleSubmitTugas} className="space-y-3">
                  {submitType === 'file' ? (
                    <div>
                      <input
                        type="file"
                        onChange={(e) => setFileHasil(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Format: PDF, ZIP, RAR, DOCX, XLSX, JPG, PNG (Maks 5MB)</p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... atau https://github.com/..."
                        value={linkHasil}
                        onChange={(e) => setLinkHasil(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {submitting ? 'Mengirim Hasil Kerja...' : 'Kirim Pengumpulan Tugas'}
                  </button>
                </form>
              </div>
            )}

            {/* Submission History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <History size={15} className="text-slate-500" />
                Riwayat Pengumpulan (Semua Versi)
              </h4>

              {selectedTugas.pengumpulan?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum pernah dikumpulkan.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedTugas.pengumpulan?.map((p) => (
                    <div key={p.pengumpulan_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          Versi #{p.versi_ke}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(p.tanggal_submit).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Hasil:</span>
                        {p.file_hasil.startsWith('http') ? (
                          <a href={p.file_hasil} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-medium">
                            <LinkIcon size={12} />
                            <span>{p.file_hasil}</span>
                          </a>
                        ) : (
                          <a href={`/${p.file_hasil}`} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-medium">
                            <FileText size={12} />
                            <span>Unduh File Submission</span>
                          </a>
                        )}
                      </div>

                      {p.catatan_revisi && (
                        <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 mt-2">
                          <span className="font-bold block mb-0.5">Catatan Revisi Pembimbing:</span>
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
