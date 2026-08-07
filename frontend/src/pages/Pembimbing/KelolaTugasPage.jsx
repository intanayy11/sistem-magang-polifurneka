import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import {
  Plus,
  FileText,
  AlertCircle,
  X,
  History,
  Link as LinkIcon
} from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { isTaskOverdue } from '../../utils/dateHelpers';

const KelolaTugasPage = () => {
  const [tugasList, setTugasList] = useState([]);
  const [pesertaOptions, setPesertaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal Create Task
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    peserta_id: '',
    judul: '',
    deskripsi: '',
    deadline: '',
    file_lampiran: null,
  });

  // Modal Review Submission
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: 'Selesai',
    catatan_revisi: '',
  });

  useScrollLock(showCreateModal || showReviewModal);

  const fetchData = async () => {
    try {
      const [tugasRes, pesertaRes] = await Promise.all([
        api.get('/tugas'),
        api.get('/pembimbing/peserta'),
      ]);
      if (tugasRes.data.status === 'success') {
        setTugasList(tugasRes.data.data);
      }
      if (pesertaRes.data.status === 'success') {
        setPesertaOptions(pesertaRes.data.data);
        if (pesertaRes.data.data.length > 0) {
          setCreateForm((prev) => ({ ...prev, peserta_id: pesertaRes.data.data[0].user_id }));
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('peserta_id', createForm.peserta_id);
    formData.append('judul', createForm.judul);
    if (createForm.deskripsi) formData.append('deskripsi', createForm.deskripsi);
    formData.append('deadline', createForm.deadline);
    if (createForm.file_lampiran) formData.append('file_lampiran', createForm.file_lampiran);

    try {
      const res = await api.post('/tugas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: 'Tugas baru berhasil ditugaskan ke peserta.' });
        setShowCreateModal(false);
        setCreateForm({
          peserta_id: pesertaOptions[0]?.user_id || '',
          judul: '',
          deskripsi: '',
          deadline: '',
          file_lampiran: null,
        });
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal membuat tugas.' });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenReview = async (tugasId) => {
    try {
      const res = await api.get(`/tugas/${tugasId}`);
      if (res.data.status === 'success') {
        setSelectedTugas(res.data.data);
        setReviewForm({
          status: res.data.data.status === 'Menunggu Review' ? 'Selesai' : res.data.data.status,
          catatan_revisi: '',
        });
        setShowReviewModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTugas) return;

    setReviewSubmitting(true);
    setAlert(null);

    try {
      const res = await api.put(`/tugas/${selectedTugas.tugas_id}/review`, reviewForm);
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: res.data.message });
        setShowReviewModal(false);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal melakukan review.' });
    } finally {
      setReviewSubmitting(false);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kelola & Review Tugas Magang</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Buat penugasan proyek/tugas baru untuk peserta bimbingan dan evaluasi hasil pengumpulan kerja.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs"
        >
          <Plus size={16} />
          <span>Buat Tugas Baru</span>
        </button>
      </div>

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Task List Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Daftar Tugas Dibuat</h3>
          <span className="text-xs text-slate-500 font-medium">{tugasList.length} Tugas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Peserta Ditugaskan</th>
                <th className="px-5 py-3.5">Judul Tugas</th>
                <th className="px-5 py-3.5">Deadline</th>
                <th className="px-5 py-3.5">Pengumpulan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tugasList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada tugas yang dibuat.
                  </td>
                </tr>
              ) : (
                tugasList.map((tugas) => (
                  <tr key={tugas.tugas_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{tugas.peserta?.nama || '-'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tugas.peserta?.nim_nis || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900">{tugas.judul}</div>
                      <div className="text-slate-500 line-clamp-1 mt-0.5">{tugas.deskripsi || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`font-mono ${isTaskOverdue(tugas.deadline, tugas.status) ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                        {new Date(tugas.deadline).toLocaleString('id-ID')}
                      </div>
                      {isTaskOverdue(tugas.deadline, tugas.status) && (
                        <span className="inline-block text-[9px] font-extrabold text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-2xs mt-1">
                          Lewat Tenggat
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {tugas.pengumpulan?.length || 0} Versi
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={tugas.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenReview(tugas.tugas_id)}
                        className="bg-[#F5C42E] hover:bg-[#E8A800] text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-2xs border border-amber-300/80 transition-all cursor-pointer"
                      >
                        Review Hasil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Buat Tugas Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Peserta Bimbingan</label>
                <select
                  required
                  value={createForm.peserta_id}
                  onChange={(e) => setCreateForm({ ...createForm, peserta_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  {pesertaOptions.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.nama} ({p.nim_nis || 'Tanpa NIM'}){p.is_magang_selesai ? ' ⚠ Selesai Magang' : ''}
                    </option>
                  ))}
                </select>
                {/* Warning jika peserta yang dipilih sudah selesai magang */}
                {(() => {
                  const selected = pesertaOptions.find(p => String(p.user_id) === String(createForm.peserta_id));
                  return selected?.is_magang_selesai ? (
                    <p className="mt-1.5 text-[11px] text-amber-700 font-bold flex items-center gap-1">
                      ⚠ Peserta ini sudah selesai masa magang. Tugas baru tidak dapat diberikan.
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Judul penugasan magang..."
                  value={createForm.judul}
                  onChange={(e) => setCreateForm({ ...createForm, judul: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi & Instruksi</label>
                <textarea
                  rows="3"
                  placeholder="Detail instruksi penugasan..."
                  value={createForm.deskripsi}
                  onChange={(e) => setCreateForm({ ...createForm, deskripsi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batas Waktu (Deadline)</label>
                <input
                  type="datetime-local"
                  required
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">File Lampiran Modul / Acuan (Maks 5MB)</label>
                <input
                  type="file"
                  onChange={(e) => setCreateForm({ ...createForm, file_lampiran: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting || (() => {
                    const selected = pesertaOptions.find(p => String(p.user_id) === String(createForm.peserta_id));
                    return selected?.is_magang_selesai;
                  })()}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? 'Membuat...' : 'Buat & Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Review Submission */}
      {showReviewModal && selectedTugas && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedTugas.status} />
                  <span className="text-xs text-slate-500">Peserta: <strong>{selectedTugas.peserta?.nama}</strong></span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedTugas.judul}</h3>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Submission History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <History size={15} className="text-amber-600" />
                Riwayat Berkas Pengumpulan Hasil Kerja
              </h4>

              {selectedTugas.pengumpulan?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Peserta belum mengumpulkan hasil kerja.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedTugas.pengumpulan?.map((p) => (
                    <div key={p.pengumpulan_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          Versi #{p.versi_ke}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Submit: {new Date(p.tanggal_submit).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Lampiran:</span>
                        {p.file_hasil.startsWith('http') ? (
                          <a href={p.file_hasil} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-medium">
                            <LinkIcon size={12} />
                            <span>{p.file_hasil}</span>
                          </a>
                        ) : (
                          <a href={`/${p.file_hasil}`} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-medium">
                            <FileText size={12} />
                            <span>Unduh Berkas Submission</span>
                          </a>
                        )}
                      </div>

                      {p.catatan_revisi && (
                        <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 mt-2">
                          <span className="font-bold block mb-0.5">Catatan Revisi Sebelumnya:</span>
                          {p.catatan_revisi}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-3.5 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keputusan Review Status Tugas</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Selesai">Selesai (ACC / Disetujui)</option>
                  <option value="Perlu Revisi">Perlu Revisi (Minta Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Catatan Revisi / Evaluasi</label>
                <textarea
                  rows="3"
                  placeholder="Tuliskan umpan balik atau poin-poin yang perlu direvisi..."
                  value={reviewForm.catatan_revisi}
                  onChange={(e) => setReviewForm({ ...reviewForm, catatan_revisi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Simpan...' : 'Simpan Review Hasil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaTugasPage;
