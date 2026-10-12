import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { getStorageUrl } from '../../utils/url';
import {
  Plus,
  FileText,
  AlertCircle,
  X,
  History,
  Link as LinkIcon,
  ClipboardList,
  Edit2,
  Trash2,
  Paperclip,
  ExternalLink,
  FileCheck,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { isTaskOverdue } from '../../utils/dateHelpers';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

const KelolaTugasPage = () => {
  const [tugasList, setTugasList] = useState([]);
  const [pesertaOptions, setPesertaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState(null);

  // Modal Buat Tugas
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    peserta_id: '',
    judul: '',
    deskripsi: '',
    deadline: '',
    file_lampiran: null,
  });

  // Modal Edit Tugas
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    tugas_id: null,
    peserta_id: '',
    peserta_nama: '',
    judul: '',
    deskripsi: '',
    deadline: '',
    current_lampiran: '',
    file_lampiran: null,
  });

  // Modal Hapus Tugas
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [tugasToDelete, setTugasToDelete] = useState(null);

  // Modal Review Tugas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: 'Selesai',
    catatan_revisi: '',
  });

  useScrollLock(showCreateModal || showEditModal || showDeleteModal || showReviewModal);

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
        if (pesertaRes.data.data.length > 0 && !createForm.peserta_id) {
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

  const handleOpenEdit = (tugas) => {
    const dt = new Date(tugas.deadline);
    const pad = (n) => String(n).padStart(2, '0');
    const formattedDeadline = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

    setEditForm({
      tugas_id: tugas.tugas_id,
      peserta_id: tugas.peserta_id,
      peserta_nama: tugas.peserta?.nama || '-',
      judul: tugas.judul,
      deskripsi: tugas.deskripsi || '',
      deadline: formattedDeadline,
      current_lampiran: tugas.file_lampiran || '',
      file_lampiran: null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('judul', editForm.judul);
    if (editForm.deskripsi) formData.append('deskripsi', editForm.deskripsi);
    formData.append('deadline', editForm.deadline);
    if (editForm.file_lampiran) formData.append('file_lampiran', editForm.file_lampiran);

    try {
      const res = await api.post(`/tugas/${editForm.tugas_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: 'Tugas berhasil diperbarui.' });
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal memperbarui tugas.' });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleOpenDelete = (tugas) => {
    setTugasToDelete(tugas);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tugasToDelete) return;
    setDeleteSubmitting(true);
    setAlert(null);

    try {
      const res = await api.delete(`/tugas/${tugasToDelete.tugas_id}`);
      if (res.data.status === 'success') {
        setAlert({ type: 'success', message: 'Tugas berhasil dihapus.' });
        setShowDeleteModal(false);
        setTugasToDelete(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus tugas.' });
    } finally {
      setDeleteSubmitting(false);
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

  return (
    <div className="space-y-4">
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      <div className="card-clean overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList size={22} className="text-[#E8A800]" />
            <span>Kelola & Review Tugas Magang</span>
          </h2>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {tugasList.length} Tugas
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Buat Tugas Baru</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Peserta Ditugaskan</th>
                <th className="px-5 py-3.5">Judul Tugas & Lampiran</th>
                <th className="px-5 py-3.5">Deadline</th>
                <th className="px-5 py-3.5">Pengumpulan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs font-medium">
                    Memuat data tugas...
                  </td>
                </tr>
              ) : tugasList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada tugas yang dibuat.
                  </td>
                </tr>
              ) : (
                tugasList
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((tugas) => (
                  <tr key={tugas.tugas_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{tugas.peserta?.nama || '-'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tugas.peserta?.nim_nis || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900">{tugas.judul}</div>
                      <div className="text-slate-500 line-clamp-1 mt-0.5">{tugas.deskripsi || '-'}</div>
                      {tugas.file_lampiran && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <a
                            href={getStorageUrl(tugas.file_lampiran)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors"
                            title="Buka/Unduh Lampiran"
                          >
                            <Paperclip size={11} className="text-amber-600" />
                            <span> Lampiran</span>
                            <ExternalLink size={10} className="text-amber-500" />
                          </a>
                        </div>
                      )}
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenReview(tugas.tugas_id)}
                          className="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 shadow-2xs transition-all cursor-pointer"
                          title="Review Hasil Pengumpulan"
                        >
                          <FileCheck size={15} />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(tugas)}
                          className="p-2 rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 shadow-2xs transition-all cursor-pointer"
                          title="Edit Tugas"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(tugas)}
                          className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 shadow-2xs transition-all cursor-pointer"
                          title="Hapus Tugas"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={tugasList.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="tugas"
        />
      </div>

      {/* MODAL BUAT TUGAS BARU */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-[#E8A800]" />
                <span>Buat Tugas Baru</span>
              </h3>
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
                {(() => {
                  const selectedPeserta = pesertaOptions.find(p => String(p.user_id) === String(createForm.peserta_id));
                  const maxDeadline = selectedPeserta?.tanggal_selesai_magang ? `${selectedPeserta.tanggal_selesai_magang}T23:59` : undefined;
                  return (
                    <>
                      <input
                        type="datetime-local"
                        required
                        max={maxDeadline}
                        value={createForm.deadline}
                        onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                      />
                      {selectedPeserta?.tanggal_selesai_magang && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Maksimal deadline: <strong className="text-slate-700">{new Date(selectedPeserta.tanggal_selesai_magang).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</strong> (Sesuai tanggal selesai magang peserta)
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">File / Gambar Lampiran Acuan (Maks 5MB)</label>
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting || (() => {
                    const selected = pesertaOptions.find(p => String(p.user_id) === String(createForm.peserta_id));
                    return selected?.is_magang_selesai;
                  })()}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {createSubmitting ? 'Membuat...' : 'Buat & Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT TUGAS */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 size={17} className="text-[#E8A800]" />
                <span>Edit Tugas</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Peserta Ditugaskan</label>
                <input
                  type="text"
                  disabled
                  value={editForm.peserta_nama}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Judul penugasan magang..."
                  value={editForm.judul}
                  onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi & Instruksi</label>
                <textarea
                  rows="3"
                  placeholder="Detail instruksi penugasan..."
                  value={editForm.deskripsi}
                  onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batas Waktu (Deadline)</label>
                <input
                  type="datetime-local"
                  required
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">File / Gambar Lampiran</label>
                {editForm.current_lampiran && (
                  <div className="mb-2 p-2 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-900 font-medium truncate">
                      <Paperclip size={13} className="shrink-0 text-amber-600" />
                      <span className="truncate">Lampiran saat ini terpasang</span>
                    </div>
                    <a
                      href={getStorageUrl(editForm.current_lampiran)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-800 font-bold hover:underline shrink-0 flex items-center gap-1"
                    >
                      <span>Lihat</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => setEditForm({ ...editForm, file_lampiran: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                />
                <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika tidak ingin mengubah file lampiran.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS TUGAS */}
      {showDeleteModal && tugasToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hapus Tugas Ini?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus tugas <strong className="text-slate-800">"{tugasToDelete.judul}"</strong> untuk peserta <strong className="text-slate-800">{tugasToDelete.peserta?.nama}</strong>?
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50/70 p-2 rounded-xl border border-rose-200 mt-2">
                Tindakan ini permanen dan akan menghapus semua file lampiran serta riwayat pengumpulan tugas yang terkait.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="w-full px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {deleteSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REVIEW TUGAS */}
      {showReviewModal && selectedTugas && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedTugas.status} />
                  <span className="text-xs text-slate-500">Peserta: <strong>{selectedTugas.peserta?.nama}</strong></span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedTugas.judul}</h3>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* DETAIL INSTRUKSI & LAMPIRAN TUGAS DARI PEMBIMBING */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                  <Calendar size={13} className="text-amber-600" />
                  <span>Batas Waktu: {new Date(selectedTugas.deadline).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {selectedTugas.deskripsi && (
                <p className="text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                  {selectedTugas.deskripsi}
                </p>
              )}

              {selectedTugas.file_lampiran && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">File / Gambar:</span>
                  <a
                    href={getStorageUrl(selectedTugas.file_lampiran)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors"
                  >
                    <Paperclip size={13} />
                    <span>Buka File / Gambar Lampiran</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* RIWAYAT PENGUMPULAN HASIL KERJA PESERTA */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <History size={15} className="text-amber-600" />
                <span>Riwayat Pengumpulan Tugas</span>
              </h4>

              {selectedTugas.pengumpulan?.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                  Peserta belum mengumpulkan hasil kerja untuk tugas ini.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedTugas.pengumpulan?.map((p) => (
                    <div key={p.pengumpulan_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          Versi {p.versi_ke}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Submit: {new Date(p.tanggal_submit).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-semibold text-slate-700">Berkas/Tautan:</span>
                        {p.file_hasil.startsWith('http') ? (
                          <a href={p.file_hasil} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-medium">
                            <LinkIcon size={12} />
                            <span>{p.file_hasil}</span>
                          </a>
                        ) : (
                          <a href={getStorageUrl(p.file_hasil)} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-medium">
                            <FileText size={12} />
                            <span>Unduh Berkas Submission</span>
                            <ExternalLink size={11} />
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

            {/* FORM REVIEW KEPUTUSAN */}
            <form onSubmit={handleReviewSubmit} className="space-y-3.5 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keputusan Review Status Tugas</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Selesai">Selesai (Disetujui)</option>
                  <option value="Perlu Revisi">Perlu Revisi </option>
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
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
