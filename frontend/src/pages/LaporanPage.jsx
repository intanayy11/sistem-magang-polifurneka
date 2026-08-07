import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';
import DovetailDivider from '../components/DovetailDivider';
import StatusBadge from '../components/StatusBadge';
import {
  FileText,
  Filter,
  Download,
  Search,
  RotateCcw,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  Clock,
  BookOpen,
  CheckSquare,
  Loader2,
  ListFilter
} from 'lucide-react';

const LaporanPage = () => {
  const { user } = useAuth();

  // Filter States (Checkbox pilihan jenis data)
  const [incPresensi, setIncPresensi] = useState(true);
  const [incLogbook, setIncLogbook] = useState(true);
  const [incTugas, setIncTugas] = useState(true);

  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [pesertaId, setPesertaId] = useState('semua');
  const [jurusan, setJurusan] = useState('semua');
  const [posisiMagang, setPosisiMagang] = useState('semua');

  // Filter Dropdown Options from Backend
  const [options, setOptions] = useState({
    peserta_list: [],
    jurusan_list: [],
    posisi_list: [],
  });

  // State Preview Result
  const [previewData, setPreviewData] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch filter options on load
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/laporan/options');
        if (res.data.status === 'success') {
          setOptions(res.data.data);
        }
      } catch (err) {
        console.error('Gagal mengambil opsi filter:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const buildQueryParams = () => {
    const params = {};
    const list = [];
    if (incPresensi) list.push('presensi');
    if (incLogbook) list.push('logbook');
    if (incTugas) list.push('tugas');
    params.jenis_data = list.join(',');
    if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
    if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;
    if (pesertaId && pesertaId !== 'semua') params.peserta_id = pesertaId;
    if (jurusan && jurusan !== 'semua') params.jurusan = jurusan;
    if (posisiMagang && posisiMagang !== 'semua') params.posisi_magang = posisiMagang;
    return params;
  };

  const validateFilter = () => {
    if (!incPresensi && !incLogbook && !incTugas) {
      setAlert({
        type: 'error',
        message: 'Silakan centang minimal satu jenis rekap data (Presensi, Logbook, atau Tugas).',
      });
      return false;
    }
    return true;
  };

  const handlePreview = async () => {
    if (!validateFilter()) return;
    setLoadingPreview(true);
    setAlert(null);
    try {
      const res = await api.get('/laporan/preview', {
        params: buildQueryParams()
      });
      if (res.data.status === 'success') {
        setPreviewData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat pratinjau laporan.'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleResetFilter = () => {
    setIncPresensi(true);
    setIncLogbook(true);
    setIncTugas(true);
    setTanggalMulai('');
    setTanggalSelesai('');
    setPesertaId('semua');
    setJurusan('semua');
    setPosisiMagang('semua');
    setPreviewData(null);
    setAlert(null);
  };

  const handleDownloadPdf = async () => {
    if (!validateFilter()) return;
    setDownloadingPdf(true);
    setAlert(null);
    try {
      const res = await api.get('/laporan/export', {
        params: buildQueryParams(),
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Magang_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setAlert({
        type: 'success',
        message: 'Laporan PDF berhasil diunduh.'
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Gagal mengunduh file PDF laporan.'
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-amber-600" size={22} />
            <span>Modul Laporan & Rekapitulasi</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {user?.role === 'peserta' && 'Pratinjau dan cetak laporan presensi, logbook, dan tugas harian magang Anda.'}
            {user?.role === 'pembimbing' && 'Pratinjau dan cetak rekapitulasi data magang peserta bimbingan Anda.'}
            {user?.role === 'admin' && 'Pusat laporan komprehensif seluruh kegiatan peserta magang instansi.'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
          <ListFilter size={14} className="text-amber-600" />
          <span className="capitalize">Laporan Role: {user?.role}</span>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* ── Filter Form Card ── */}
      <div className="card-bento space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Filter size={16} className="text-amber-600" />
            <span>Filter Data Laporan</span>
          </h3>
          <button
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-900 transition-colors font-medium"
          >
            <RotateCcw size={13} />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Pilihan Jenis Data (Checkboxes / Toggle Cards) */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText size={13} className="text-slate-400" />
                <span>Pilih Jenis Data / Rekap yang Ingin Ditampilkan</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">(bebas centang 1, 2, atau 3)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                  incPresensi
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={incPresensi}
                  onChange={(e) => setIncPresensi(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-[#E8A800]"
                />
                <div className="flex items-center gap-2 text-xs">
                  <Clock size={15} className={incPresensi ? 'text-amber-600' : 'text-slate-400'} />
                  <span>Presensi Kehadiran</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                  incLogbook
                    ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-bold shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={incLogbook}
                  onChange={(e) => setIncLogbook(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen size={15} className={incLogbook ? 'text-blue-600' : 'text-slate-400'} />
                  <span>Logbook Kegiatan</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                  incTugas
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={incTugas}
                  onChange={(e) => setIncTugas(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <div className="flex items-center gap-2 text-xs">
                  <CheckSquare size={15} className={incTugas ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>Tugas Magang</span>
                </div>
              </label>
            </div>
          </div>

          {/* Rentang Tanggal (Bersampingan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Dari Tanggal</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">(kosongkan jika tanpa batas)</span>
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Sampai Tanggal</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">(kosongkan jika tanpa batas)</span>
              </label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
              />
            </div>
          </div>

          {/* Filter Peserta (Pembimbing & Admin) */}
          {(user?.role === 'pembimbing' || user?.role === 'admin') && (
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                <User size={13} className="text-slate-400" />
                <span>Pilih Peserta Magang</span>
              </label>
              <select
                value={pesertaId}
                onChange={(e) => setPesertaId(e.target.value)}
                disabled={loadingOptions}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
              >
                <option value="semua">
                  {user?.role === 'pembimbing' ? 'Semua Peserta Bimbingan' : 'Semua Peserta Magang'}
                </option>
                {options.peserta_list.map((p) => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.nama} {p.nim_nis ? `(${p.nim_nis})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Jurusan & Posisi Magang (Admin Only, Bersampingan) */}
          {user?.role === 'admin' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                  <GraduationCap size={13} className="text-slate-400" />
                  <span>Jurusan / Program Studi</span>
                </label>
                <select
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
                >
                  <option value="semua">Semua Jurusan</option>
                  {options.jurusan_list.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  <span>Posisi / Divisi Magang</span>
                </label>
                <select
                  value={posisiMagang}
                  onChange={(e) => setPosisiMagang(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 font-medium"
                >
                  <option value="semua">Semua Posisi Magang</option>
                  {options.posisi_list.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className="btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {loadingPreview ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Memuat...</span>
              </>
            ) : (
              <>
                <Search size={15} />
                <span>Preview</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {downloadingPdf ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Mengunduh...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Unduh PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Action Buttons Divider ── */}

      {!previewData && !loadingPreview && (
        <div className="card-bento p-10 text-center space-y-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Belum Ada Data Ditampilkan</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Silakan tentukan filter di atas, lalu klik tombol <strong className="text-slate-700">"Tampilkan Preview"</strong> untuk memuat data laporan pada halaman ini.
          </p>
        </div>
      )}

      {/* ── Preview Content Tables ── */}
      {previewData && (
        <div className="space-y-6">

          {/* TABEL PRESENSI */}
          {previewData.include_presensi && (
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  <span>Presensi Kehadiran ({previewData.presensi.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Tanggal</th>
                      {user?.role !== 'peserta' && <th className="px-4 py-3">Peserta</th>}
                      <th className="px-4 py-3">Jam Masuk</th>
                      <th className="px-4 py-3">Jam Pulang</th>
                      <th className="px-4 py-3">Tipe Lokasi</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.presensi.length === 0 ? (
                      <tr>
                        <td colSpan={user?.role !== 'peserta' ? 7 : 6} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data presensi sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.presensi.map((p, idx) => (
                        <tr key={p.presensi_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{p.tanggal}</td>
                          {user?.role !== 'peserta' && (
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{p.peserta?.nama || '-'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{p.peserta?.nim_nis}</div>
                            </td>
                          )}
                          <td className="px-4 py-3 font-mono">{p.jam_masuk || '-'}</td>
                          <td className="px-4 py-3 font-mono">{p.jam_pulang || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              p.lokasi_tipe === 'luar' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {p.lokasi_tipe || 'instansi'}
                            </span>
                            {p.lokasi_tipe === 'luar' && p.keterangan_luar && (
                              <p className="text-[10px] text-slate-500 italic mt-0.5">{p.keterangan_luar}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL LOGBOOK */}
          {previewData.include_logbook && (
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  <span>Logbook Kegiatan Harian ({previewData.logbook.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Tanggal</th>
                      {user?.role !== 'peserta' && <th className="px-4 py-3">Peserta</th>}
                      <th className="px-4 py-3">Judul Kegiatan</th>
                      <th className="px-4 py-3">Deskripsi & Kendala</th>
                      <th className="px-4 py-3">Status Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.logbook.length === 0 ? (
                      <tr>
                        <td colSpan={user?.role !== 'peserta' ? 6 : 5} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data logbook sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.logbook.map((l, idx) => (
                        <tr key={l.logbook_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{l.tanggal}</td>
                          {user?.role !== 'peserta' && (
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{l.peserta?.nama || '-'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{l.peserta?.nim_nis}</div>
                            </td>
                          )}
                          <td className="px-4 py-3 font-bold text-slate-900">{l.judul_kegiatan}</td>
                          <td className="px-4 py-3">
                            <p className="line-clamp-2">{l.deskripsi}</p>
                            {l.kendala && <p className="text-[10px] text-amber-800 italic mt-0.5">Kendala: {l.kendala}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={l.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL TUGAS */}
          {previewData.include_tugas && (
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckSquare size={16} className="text-emerald-600" />
                  <span>Daftar Tugas Magang ({previewData.tugas.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Deadline</th>
                      {user?.role !== 'peserta' && <th className="px-4 py-3">Peserta</th>}
                      <th className="px-4 py-3">Judul Tugas</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Terakhir Submit / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.tugas.length === 0 ? (
                      <tr>
                        <td colSpan={user?.role !== 'peserta' ? 6 : 5} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada tugas magang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.tugas.map((t, idx) => (
                        <tr key={t.tugas_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : '-'}
                          </td>
                          {user?.role !== 'peserta' && (
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{t.peserta?.nama || '-'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{t.peserta?.nim_nis}</div>
                            </td>
                          )}
                          <td className="px-4 py-3 font-bold text-slate-900">{t.judul || '-'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {t.pengumpulan_terakhir ? (
                              <div>
                                <span className="font-mono text-[11px] font-medium text-slate-800">
                                  {new Date(t.pengumpulan_terakhir.tanggal_submit).toLocaleString('id-ID')}
                                </span>
                                {t.pengumpulan_terakhir.catatan_revisi && (
                                  <p className="text-[10px] text-amber-800 italic mt-0.5">
                                    Revisi: {t.pengumpulan_terakhir.catatan_revisi}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Belum Mengumpulkan</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default LaporanPage;
