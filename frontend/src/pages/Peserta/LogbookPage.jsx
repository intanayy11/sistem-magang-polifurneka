import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import DovetailDivider from '../../components/DovetailDivider';
import { Plus, BookOpen, Image as ImageIcon, AlertCircle, X, CheckCircle2, Clock, Info } from 'lucide-react';
import useScrollLock from '../../hooks/useScrollLock';
import AlertBanner from '../../components/AlertBanner';
import { nearestWorkdayOnOrBefore, isWeekend, todayLocalISO } from '../../utils/dateHelpers';

const LogbookPage = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [dateNote, setDateNote] = useState('');

  useScrollLock(showModal);

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

  // Summary counts
  const countDisetujui = logbooks.filter(l => l.status === 'Disetujui').length;
  const countPending = logbooks.filter(l => l.status === 'Menunggu').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Logbook Kegiatan Harian</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Catat aktivitas harian dan upload foto bukti kegiatan magang Anda.
        </p>
      </div>

      <DovetailDivider className="my-2" />

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* ── 2-COLUMN SPLIT LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN (35% / 4-span) : Summary Stats & Trigger Widget ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Stats Summary Card */}
          <div className="card-bento space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen size={16} className="text-amber-600" />
                <span>Ringkasan Logbook</span>
              </h3>
              <span className="text-xs font-bold text-slate-700 font-mono">Total: {logbooks.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">Menunggu</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{countPending}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">Disetujui</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{countDisetujui}</div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full btn-poli-primary py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus size={16} />
              <span>Tambah Logbook Baru</span>
            </button>
          </div>

          {/* Petunjuk Card */}
          <div className="card-bento bg-slate-50 border border-slate-200/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <Info size={15} className="text-amber-600" />
              <span>Petunjuk Logbook</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Isi logbook secara disiplin setiap hari kerja. Lampirkan foto bukti pekerjaan agar pembimbing lapangan dapat menyetujui laporan Anda.
            </p>
          </div>

        </div>

        {/* ── RIGHT COLUMN (65% / 8-span) : Grid of Logbook Cards ── */}
        <div className="lg:col-span-8">
          {logbooks.length === 0 ? (
            <div className="card-bento p-12 text-center">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-700 font-bold text-sm">Belum Ada Logbook</p>
              <p className="text-xs text-slate-400 mt-1">Klik tombol 'Isi Logbook Hari Ini' untuk menambah catatan harian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {logbooks.map((log) => (
                <div key={log.logbook_id} className="card-bento p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{log.judul_kegiatan}</h3>
                    <p className="text-slate-600 text-xs mb-3 line-clamp-3 whitespace-pre-line leading-relaxed">{log.deskripsi}</p>

                    {log.kendala && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-[11px] mb-3">
                        <span className="font-bold block mb-0.5">Kendala:</span>
                        {log.kendala}
                      </div>
                    )}

                    {log.catatan_pembimbing && (
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 text-[11px] mb-3">
                        <span className="font-bold block mb-0.5">Catatan Pembimbing:</span>
                        {log.catatan_pembimbing}
                      </div>
                    )}
                  </div>

                  {log.foto_bukti && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <ImageIcon size={14} className="text-amber-600 shrink-0" />
                      <a
                        href={`http://localhost:8000/storage/${log.foto_bukti}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-800 hover:underline font-bold truncate"
                      >
                        Foto Bukti Kegiatan
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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
                  max={todayLocalISO()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isWeekend(val)) {
                      // Auto-shift to nearest workday before the selected date
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
