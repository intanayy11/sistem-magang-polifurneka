import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { Plus, BookOpen, Image as ImageIcon, AlertCircle, X } from 'lucide-react';

const LogbookPage = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

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
          tanggal: new Date().toISOString().split('T')[0],
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Logbook Kegiatan Harian</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Catat aktivitas magang harian Anda beserta bukti kegiatan untuk direview oleh pembimbing.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs"
        >
          <Plus size={16} />
          <span>Isi Logbook Hari Ini</span>
        </button>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <AlertCircle size={16} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Logbook Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {logbooks.length === 0 ? (
          <div className="col-span-full card-clean p-12 text-center">
            <BookOpen size={44} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium text-sm">Belum ada logbook yang diisi.</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk mengisi logbook harian Anda.</p>
          </div>
        ) : (
          logbooks.map((log) => (
            <div key={log.logbook_id} className="card-clean p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                    {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <StatusBadge status={log.status} />
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{log.judul_kegiatan}</h3>
                <p className="text-slate-600 text-xs mb-3 line-clamp-3 whitespace-pre-line leading-relaxed">{log.deskripsi}</p>

                {log.kendala && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-[11px] mb-3">
                    <span className="font-bold block mb-0.5">Kendala:</span>
                    {log.kendala}
                  </div>
                )}

                {log.catatan_pembimbing && (
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-blue-900 text-[11px] mb-3">
                    <span className="font-bold block mb-0.5">Catatan Pembimbing:</span>
                    {log.catatan_pembimbing}
                  </div>
                )}
              </div>

              {log.foto_bukti && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <ImageIcon size={15} className="text-amber-600 shrink-0" />
                  <a
                    href={`/${log.foto_bukti}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-700 hover:underline font-medium truncate"
                  >
                    Lihat Foto Bukti Kegiatan
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                />
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
                  placeholder="Jelaskan detail pekerjaan yang diselesaikan hari ini..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kendala / Tantangan (Opsional)</label>
                <textarea
                  rows="2"
                  placeholder="Kendala yang dihadapi saat pengerjaan..."
                  value={form.kendala}
                  onChange={(e) => setForm({ ...form, kendala: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Foto Bukti Kegiatan (Maks 5MB)</label>
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
                  className="btn-poli-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
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
