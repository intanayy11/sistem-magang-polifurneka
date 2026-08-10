import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  ListFilter,
  Users,
  UserCheck,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

const LaporanPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Category State from URL query ?kategori=...
  const paramKategori = searchParams.get('kategori') || 'aktivitas_magang';
  const [kategoriLaporan, setKategoriLaporan] = useState(paramKategori);

  // Sync category state when searchParams changes
  useEffect(() => {
    const currentKat = searchParams.get('kategori') || 'aktivitas_magang';
    setKategoriLaporan(currentKat);
    setPreviewData(null);
    setAlert(null);
  }, [searchParams]);

  // Switch category handler (updates URL searchParams)
  const handleCategoryChange = (newCat) => {
    setSearchParams({ kategori: newCat });
    setKategoriLaporan(newCat);
    setPreviewData(null);
    setAlert(null);
  };

  // Filter States - Aktivitas Magang
  const [jenisData, setJenisData] = useState('semua'); // presensi, logbook, tugas, izin, semua
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [pesertaId, setPesertaId] = useState('semua');
  const [pembimbingId, setPembimbingId] = useState('semua');
  const [jurusan, setJurusan] = useState('semua');
  const [posisiMagang, setPosisiMagang] = useState('semua');
  const [jabatan, setJabatan] = useState('semua');

  // Filter Spesifik Per Jenis Data
  const [statusPresensi, setStatusPresensi] = useState('semua');
  const [lokasiTipe, setLokasiTipe] = useState('semua');
  const [statusLogbook, setStatusLogbook] = useState('semua');
  const [statusTugas, setStatusTugas] = useState('semua');
  const [jenisIzin, setJenisIzin] = useState('semua');
  const [statusIzin, setStatusIzin] = useState('semua');

  // Filter Data Peserta (Admin)
  const [statusPeriode, setStatusPeriode] = useState('semua'); // aktif, selesai, semua
  const [modeTampilan, setModeTampilan] = useState('daftar'); // daftar | rekap_kategori
  const [rekapBy, setRekapBy] = useState('jurusan'); // jurusan | posisi_magang | pembimbing

  // Filter Rekapitulasi Kehadiran (Admin)
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  // Options List
  const [options, setOptions] = useState({
    peserta_list: [],
    pembimbing_list: [],
    jurusan_list: [],
    posisi_list: [],
    jabatan_list: [],
  });

  // Preview Data State
  const [previewData, setPreviewData] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch filter options on mount
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
    const params = { kategori_laporan: kategoriLaporan };

    if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
    if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;
    if (pesertaId && pesertaId !== 'semua') params.peserta_id = pesertaId;
    if (pembimbingId && pembimbingId !== 'semua') params.pembimbing_id = pembimbingId;
    if (jurusan && jurusan !== 'semua') params.jurusan = jurusan;
    if (posisiMagang && posisiMagang !== 'semua') params.posisi_magang = posisiMagang;
    if (jabatan && jabatan !== 'semua') params.jabatan = jabatan;

    if (kategoriLaporan === 'aktivitas_magang') {
      params.jenis_data = jenisData;
      if (statusPresensi !== 'semua') params.status_presensi = statusPresensi;
      if (lokasiTipe !== 'semua') params.lokasi_tipe = lokasiTipe;
      if (statusLogbook !== 'semua') params.status_logbook = statusLogbook;
      if (statusTugas !== 'semua') params.status_tugas = statusTugas;
      if (jenisIzin !== 'semua') params.jenis_izin = jenisIzin;
      if (statusIzin !== 'semua') params.status_izin = statusIzin;
    }

    if (kategoriLaporan === 'data_peserta') {
      params.status_periode = statusPeriode;
      params.mode_tampilan = modeTampilan;
      params.rekap_by = rekapBy;
    }

    if (kategoriLaporan === 'rekapitulasi_kehadiran') {
      params.sort_order = sortOrder;
    }

    return params;
  };

  const handlePreview = async () => {
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
    setJenisData('semua');
    setTanggalMulai('');
    setTanggalSelesai('');
    setPesertaId('semua');
    setPembimbingId('semua');
    setJurusan('semua');
    setPosisiMagang('semua');
    setJabatan('semua');
    setStatusPresensi('semua');
    setLokasiTipe('semua');
    setStatusLogbook('semua');
    setStatusTugas('semua');
    setJenisIzin('semua');
    setStatusIzin('semua');
    setStatusPeriode('semua');
    setModeTampilan('daftar');
    setRekapBy('jurusan');
    setSortOrder('asc');
    setPreviewData(null);
    setAlert(null);
  };

  const handleDownloadPdf = async () => {
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
      const fileSuffix = kategoriLaporan.toUpperCase();
      link.setAttribute('download', `Laporan_${fileSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setAlert({
        type: 'success',
        message: 'File PDF Laporan Resmi berhasil diunduh.'
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

  // Helper date format
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-amber-600" size={22} />
            <span>Modul Laporan & Rekapitulasi</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Pratinjau tabel dan cetak laporan resmi ber-Kop Surat Politeknik Industri Furnitur dan Pengolahan Kayu Kendal.
          </p>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />


      {/* ── DYNAMIC FILTER FORM BASED ON SELECTED CATEGORY ── */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
            <Filter size={16} className="text-amber-600" />
            <span>Form Filter — {kategoriLaporan.replace(/_/g, ' ')}</span>
          </h3>
          <button
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-900 transition-colors font-medium"
          >
            <RotateCcw size={13} />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* ════════ FORM FILTER KATEGORI 1: AKTIVITAS MAGANG ════════ */}
        {kategoriLaporan === 'aktivitas_magang' && (
          <div className="space-y-4 text-xs">
            {/* Jenis Data Selector */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Jenis Data Aktivitas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'semua', label: 'Semua Data', icon: FileSpreadsheet },
                  { id: 'presensi', label: 'Presensi', icon: Clock },
                  { id: 'logbook', label: 'Logbook', icon: BookOpen },
                  { id: 'tugas', label: 'Penugasan', icon: CheckSquare },
                  { id: 'izin', label: 'Pengajuan Izin', icon: Calendar },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = jenisData === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setJenisData(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp size={14} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* General Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai (Dari)</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai (Sampai)</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Role Pembimbing Filter Peserta */}
              {user?.role === 'pembimbing' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peserta Bimbingan</label>
                  <select
                    value={pesertaId}
                    onChange={(e) => setPesertaId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="semua">Semua Peserta Bimbingan</option>
                    {options.peserta_list.map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.nama} ({p.nim_nis || '-'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Role Admin Filter Peserta & Jurusan & Posisi */}
              {user?.role === 'admin' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Filter Peserta Spesifik</label>
                    <select
                      value={pesertaId}
                      onChange={(e) => setPesertaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Peserta</option>
                      {options.peserta_list.map((p) => (
                        <option key={p.user_id} value={p.user_id}>
                          {p.nama} ({p.nim_nis || '-'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Filter Jurusan</label>
                    <select
                      value={jurusan}
                      onChange={(e) => setJurusan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Jurusan</option>
                      {options.jurusan_list.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Filter Posisi Magang</label>
                    <select
                      value={posisiMagang}
                      onChange={(e) => setPosisiMagang(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Posisi</option>
                      {options.posisi_list.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Specific Filters per Data Type */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(jenisData === 'semua' || jenisData === 'presensi') && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status Presensi</label>
                    <select
                      value={statusPresensi}
                      onChange={(e) => setStatusPresensi(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Status Presensi</option>
                      <option value="Hadir">Hadir</option>
                      <option value="Terlambat">Terlambat</option>
                      <option value="Pulang Cepat">Pulang Cepat</option>
                      <option value="Alpha">Alpha</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipe Lokasi Presensi</label>
                    <select
                      value={lokasiTipe}
                      onChange={(e) => setLokasiTipe(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Tipe Lokasi</option>
                      <option value="instansi">Instansi</option>
                      <option value="luar">Kegiatan Luar</option>
                    </select>
                  </div>
                </>
              )}

              {(jenisData === 'semua' || jenisData === 'logbook') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Logbook</label>
                  <select
                    value={statusLogbook}
                    onChange={(e) => setStatusLogbook(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="semua">Semua Status Logbook</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Approve">Approve</option>
                    <option value="Revisi">Revisi</option>
                  </select>
                </div>
              )}

              {(jenisData === 'semua' || jenisData === 'tugas') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Penugasan</label>
                  <select
                    value={statusTugas}
                    onChange={(e) => setStatusTugas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="semua">Semua Status Tugas</option>
                    <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                    <option value="Menunggu Review">Menunggu Review</option>
                    <option value="Perlu Revisi">Perlu Revisi</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              )}

              {(jenisData === 'semua' || jenisData === 'izin') && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Izin</label>
                    <select
                      value={jenisIzin}
                      onChange={(e) => setJenisIzin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Jenis Izin</option>
                      <option value="Izin">Izin</option>
                      <option value="Sakit">Sakit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status Pengajuan Izin</label>
                    <select
                      value={statusIzin}
                      onChange={(e) => setStatusIzin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="semua">Semua Status Izin</option>
                      <option value="Menunggu">Menunggu</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 2: DATA PESERTA (ADMIN) ════════ */}
        {kategoriLaporan === 'data_peserta' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter Jurusan</label>
              <select
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Jurusan</option>
                {options.jurusan_list.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter Posisi Magang</label>
              <select
                value={posisiMagang}
                onChange={(e) => setPosisiMagang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Posisi</option>
                {options.posisi_list.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter Pembimbing</label>
              <select
                value={pembimbingId}
                onChange={(e) => setPembimbingId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Pembimbing</option>
                {options.pembimbing_list.map((pem) => (
                  <option key={pem.user_id} value={pem.user_id}>{pem.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Periode Magang</label>
              <select
                value={statusPeriode}
                onChange={(e) => setStatusPeriode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Status Periode</option>
                <option value="aktif">Periode Aktif</option>
                <option value="selesai">Selesai Magang</option>
              </select>
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 3: DATA PEMBIMBING (ADMIN) ════════ */}
        {kategoriLaporan === 'data_pembimbing' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter Jabatan Pembimbing</label>
              <select
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Jabatan</option>
                {options.jabatan_list.map((jab) => (
                  <option key={jab} value={jab}>{jab}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 4: REKAPITULASI KEHADIRAN (ADMIN) ════════ */}
        {kategoriLaporan === 'rekapitulasi_kehadiran' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai (Dari)</label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai (Sampai)</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter Jurusan</label>
              <select
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Jurusan</option>
                {options.jurusan_list.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter Pembimbing</label>
              <select
                value={pembimbingId}
                onChange={(e) => setPembimbingId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="semua">Semua Pembimbing</option>
                {options.pembimbing_list.map((pem) => (
                  <option key={pem.user_id} value={pem.user_id}>{pem.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Urutan Persentase</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="asc">Terendah ke Tertinggi (Default)</option>
                <option value="desc">Tertinggi ke Terendah</option>
              </select>
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 5: LAPORAN PROGRAM MAGANG (ADMIN) ════════ */}
        {kategoriLaporan === 'laporan_program_magang' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai (Dari)</label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai (Sampai)</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS: TAMPILKAN & UNDUH PDF ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className="w-full sm:w-auto btn-poli-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-bold shadow-xs disabled:opacity-50"
          >
            {loadingPreview ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            <span>Tampilkan Pratinjau</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {downloadingPdf ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} className="text-amber-400" />
            )}
            <span>Unduh PDF Resmi</span>
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
