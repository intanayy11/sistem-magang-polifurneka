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
  HelpCircle
} from 'lucide-react';

const LaporanPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Category State from URL query ?kategori=...
  const paramKategori = searchParams.get('kategori') || 'aktivitas_magang';
  const [kategoriLaporan, setKategoriLaporan] = useState(paramKategori);

  // Sync category state and auto-reset form filters when searchParams changes
  useEffect(() => {
    const currentKat = searchParams.get('kategori') || 'aktivitas_magang';
    setKategoriLaporan(currentKat);
    setJenisData('');
    setTanggalMulai('');
    setTanggalSelesai('');
    setPesertaId('');
    setPembimbingId('');
    setJurusan('');
    setPosisiMagang('');
    setJabatan('');
    setStatusPresensi('');
    setStatusLogbook('');
    setStatusTugas('');
    setStatusIzin('');
    setJenisIzin('');
    setStatusPeriode('');
    setSortOrder('asc');
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
  const [jenisData, setJenisData] = useState(''); // '', 'semua', presensi, logbook, tugas, izin
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [pesertaId, setPesertaId] = useState('');
  const [pembimbingId, setPembimbingId] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [posisiMagang, setPosisiMagang] = useState('');
  const [jabatan, setJabatan] = useState('');

  // Filter Spesifik Per Jenis Data
  const [statusPresensi, setStatusPresensi] = useState('');
  const [statusLogbook, setStatusLogbook] = useState('');
  const [statusTugas, setStatusTugas] = useState('');
  const [jenisIzin, setJenisIzin] = useState('');
  const [statusIzin, setStatusIzin] = useState('');

  // Filter Data Peserta (Admin)
  const [statusPeriode, setStatusPeriode] = useState(''); // '', 'semua', aktif, selesai
  const [modeTampilan, setModeTampilan] = useState('daftar'); // daftar | rekap_kategori
  const [rekapBy, setRekapBy] = useState('jurusan'); // jurusan | posisi_magang | pembimbing

  // Filter Rekapitulasi Kehadiran (Admin)
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  // Opsi Cetak PDF (Kop Surat)
  const [pakaiKop, setPakaiKop] = useState(true);

  // Options List
  const [options, setOptions] = useState({
    peserta_list: [],
    pembimbing_list: [],
    jurusan_list: [],
    posisi_list: [],
    jabatan_list: [],
  });

  // Preview & Download States
  const [previewData, setPreviewData] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
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
    const isPilihSemua = (val) => !val || val === 'semua';

    const params = {
      kategori_laporan: kategoriLaporan,
      pakai_kop: pakaiKop ? 1 : 0
    };

    if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
    if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;
    if (!isPilihSemua(pesertaId)) params.peserta_id = pesertaId;
    if (!isPilihSemua(pembimbingId)) params.pembimbing_id = pembimbingId;
    if (!isPilihSemua(jurusan)) params.jurusan = jurusan;
    if (!isPilihSemua(posisiMagang)) params.posisi_magang = posisiMagang;
    if (!isPilihSemua(jabatan)) params.jabatan = jabatan;

    if (kategoriLaporan === 'aktivitas_magang') {
      const activeJenisData = isPilihSemua(jenisData) ? 'semua' : jenisData;
      params.jenis_data = activeJenisData;

      if (activeJenisData === 'presensi') {
        if (!isPilihSemua(statusPresensi)) params.status_presensi = statusPresensi;
      } else if (activeJenisData === 'logbook') {
        if (!isPilihSemua(statusLogbook)) params.status_logbook = statusLogbook;
      } else if (activeJenisData === 'tugas') {
        if (!isPilihSemua(statusTugas)) params.status_tugas = statusTugas;
      } else if (activeJenisData === 'izin') {
        if (!isPilihSemua(jenisIzin)) params.jenis_izin = jenisIzin;
        if (!isPilihSemua(statusIzin)) params.status_izin = statusIzin;
      }
    }

    if (kategoriLaporan === 'data_peserta') {
      if (!isPilihSemua(statusPeriode)) params.status_periode = statusPeriode;
      params.mode_tampilan = modeTampilan;
      params.rekap_by = rekapBy;
    }

    if (kategoriLaporan === 'rekapitulasi_kehadiran') {
      if (sortOrder) params.sort_order = sortOrder;
    }

    return params;
  };

  const isFilterSelected = () => {
    if (kategoriLaporan === 'aktivitas_magang') {
      return (
        jenisData !== '' ||
        tanggalMulai !== '' ||
        tanggalSelesai !== '' ||
        pesertaId !== '' ||
        pembimbingId !== '' ||
        jurusan !== '' ||
        posisiMagang !== '' ||
        statusPresensi !== '' ||
        statusLogbook !== '' ||
        statusTugas !== '' ||
        jenisIzin !== '' ||
        statusIzin !== ''
      );
    }

    if (kategoriLaporan === 'data_peserta') {
      return (
        tanggalMulai !== '' ||
        tanggalSelesai !== '' ||
        pesertaId !== '' ||
        jurusan !== '' ||
        posisiMagang !== '' ||
        pembimbingId !== '' ||
        statusPeriode !== ''
      );
    }

    if (kategoriLaporan === 'data_pembimbing') {
      return (
        tanggalMulai !== '' ||
        tanggalSelesai !== '' ||
        pembimbingId !== '' ||
        jabatan !== ''
      );
    }

    if (kategoriLaporan === 'rekapitulasi_kehadiran') {
      return (
        tanggalMulai !== '' ||
        tanggalSelesai !== '' ||
        jurusan !== ''
      );
    }

    return false;
  };

  const handlePreview = async () => {
    setAlert(null);
    if (!isFilterSelected()) {
      setPreviewData(null);
      setAlert({
        type: 'error',
        message: 'Silakan pilih setidaknya satu filter laporan (misalnya memilih opsi "Semua" atau filter spesifik) terlebih dahulu sebelum menampilkan data.'
      });
      return;
    }

    setLoadingPreview(true);
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
    setJenisData('');
    setTanggalMulai('');
    setTanggalSelesai('');
    setPesertaId('');
    setPembimbingId('');
    setJurusan('');
    setPosisiMagang('');
    setJabatan('');
    setStatusPresensi('');
    setStatusLogbook('');
    setStatusTugas('');
    setJenisIzin('');
    setStatusIzin('');
    setStatusPeriode('');
    setSortOrder('asc');
    setPreviewData(null);
    setAlert(null);
  };

  const handleDownloadPdf = async () => {
    setAlert(null);
    if (!isFilterSelected()) {
      setAlert({
        type: 'error',
        message: 'Silakan pilih setidaknya satu filter laporan (misalnya memilih opsi "Semua" atau filter spesifik) terlebih dahulu sebelum mengunduh PDF.'
      });
      return;
    }

    setDownloadingPdf(true);
    try {
      const res = await api.get('/laporan/export', {
        params: buildQueryParams(),
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_${kategoriLaporan}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Gagal mengunduh file PDF laporan. Silakan coba lagi.'
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setAlert(null);
    if (!isFilterSelected()) {
      setAlert({
        type: 'error',
        message: 'Silakan pilih setidaknya satu filter laporan (misalnya memilih opsi "Semua" atau filter spesifik) terlebih dahulu sebelum mengunduh Excel.'
      });
      return;
    }

    setDownloadingExcel(true);
    try {
      const res = await api.get('/laporan/export-excel', {
        params: buildQueryParams(),
        responseType: 'blob'
      });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_${kategoriLaporan}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Gagal mengunduh file Excel laporan. Silakan coba lagi.'
      });
    } finally {
      setDownloadingExcel(false);
    }
  };

  const renderPageTitle = () => {
    switch (kategoriLaporan) {
      case 'aktivitas_magang':
        return 'Laporan Aktivitas Magang';
      case 'data_peserta':
        return 'Laporan Data Peserta';
      case 'data_pembimbing':
        return 'Laporan Data Pembimbing';
      case 'rekapitulasi_kehadiran':
        return 'Rekapitulasi Kehadiran';
      case 'laporan_program_magang':
        return 'Laporan Program Magang';
      default:
        return 'Laporan & Ekspor Data';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Alert Banner */}
      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* ── CARD FILTER DYNAMIC ── */}
      <div className="card-bento space-y-4">
        {/* Header Utama Card: Judul Laporan Diperbesar + Reset Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText size={22} className="text-[#E8A800]" />
              <span>{renderPageTitle()}</span>
            </h2>
            <p className="text-slate-500 text-xs font-medium pl-8">
              Silakan tentukan kriteria filter di bawah untuk menampilkan dan mengunduh rekapitulasi data laporan.
            </p>
          </div>

          <button
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-900 transition-colors font-semibold bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* ════════ FORM FILTER KATEGORI 1: AKTIVITAS MAGANG ════════ */}
        {kategoriLaporan === 'aktivitas_magang' && (
          <div className="space-y-5 text-xs">
            {/* Section Terpisah Paling Atas: Jenis Laporan Dropdown */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="sm:w-36 font-extrabold text-slate-900 shrink-0 uppercase tracking-wider text-[11px]">Pilih Jenis Laporan</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={jenisData}
                    onChange={(e) => setJenisData(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 shadow-2xs transition-all"
                  >
                    <option value="">-- Pilih Jenis Laporan --</option>
                    <option value="semua">Semua Data (Presensi, Logbook, Penugasan, Izin)</option>
                    <option value="presensi">Presensi Harian</option>
                    <option value="logbook">Logbook Kegiatan</option>
                    <option value="tugas">Penugasan Magang</option>
                    <option value="izin">Pengajuan Izin / Sakit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Universal */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Mulai</label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Selesai</label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Role Pembimbing Filter Peserta */}
                {user?.role === 'pembimbing' && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Nama Peserta</label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={pesertaId}
                        onChange={(e) => setPesertaId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="">-- Pilih Peserta Bimbingan --</option>
                        <option value="semua">Semua Peserta Bimbingan</option>
                        {options.peserta_list.map((p) => (
                          <option key={p.user_id} value={p.user_id}>
                            {p.nama} - {p.nim_nis || '-'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Role Admin Filter Peserta & Jurusan & Posisi */}
                {user?.role === 'admin' && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Nama Peserta</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={pesertaId}
                          onChange={(e) => setPesertaId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Peserta --</option>
                          <option value="semua">Semua Peserta</option>
                          {options.peserta_list.map((p) => (
                            <option key={p.user_id} value={p.user_id}>
                              {p.nama} - {p.nim_nis || '-'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Jurusan</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={jurusan}
                          onChange={(e) => setJurusan(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Jurusan --</option>
                          <option value="semua">Semua Jurusan</option>
                          {options.jurusan_list.map((j) => (
                            <option key={j} value={j}>{j}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Posisi / Divisi</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={posisiMagang}
                          onChange={(e) => setPosisiMagang(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Posisi / Divisi --</option>
                          <option value="semua">Semua Posisi</option>
                          {options.posisi_list.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Filter Spesifik Jenis Data (HANYA MUNCUL JIKA jenisData BUKAN '' DAN BUKAN 'semua') */}
            {jenisData !== '' && jenisData !== 'semua' && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3">
                  {jenisData === 'presensi' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Presensi</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={statusPresensi}
                          onChange={(e) => setStatusPresensi(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Status Presensi --</option>
                          <option value="semua">Semua Status Presensi</option>
                          <option value="Hadir">Hadir</option>
                          <option value="Terlambat">Terlambat</option>
                          <option value="Pulang Cepat">Pulang Cepat</option>
                          <option value="Alpha">Alpha</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {jenisData === 'logbook' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Logbook</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={statusLogbook}
                          onChange={(e) => setStatusLogbook(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Status Logbook --</option>
                          <option value="semua">Semua Status Logbook</option>
                          <option value="Menunggu">Menunggu</option>
                          <option value="Disetujui">Disetujui</option>
                          <option value="Revisi">Revisi</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {jenisData === 'tugas' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Penugasan</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={statusTugas}
                          onChange={(e) => setStatusTugas(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Status Penugasan --</option>
                          <option value="semua">Semua Status Tugas</option>
                          <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                          <option value="Menunggu Review">Menunggu Review</option>
                          <option value="Perlu Revisi">Perlu Revisi</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {jenisData === 'izin' && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Jenis Izin</label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={jenisIzin}
                            onChange={(e) => setJenisIzin(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="">-- Pilih Jenis Izin --</option>
                            <option value="semua">Semua Jenis Izin</option>
                            <option value="Izin">Izin</option>
                            <option value="Sakit">Sakit</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Pengajuan Izin</label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={statusIzin}
                            onChange={(e) => setStatusIzin(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="">-- Pilih Status Izin --</option>
                            <option value="semua">Semua Status Izin</option>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Disetujui">Disetujui</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 2: DATA PESERTA (ADMIN) ════════ */}
        {kategoriLaporan === 'data_peserta' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Mulai</label>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Selesai</label>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Nama Peserta</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pesertaId}
                  onChange={(e) => setPesertaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Peserta --</option>
                  <option value="semua">Semua Peserta</option>
                  {options.peserta_list.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.nama} - {p.nim_nis || '-'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Jurusan</label>
              <div className="flex-1 min-w-0">
                <select
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Jurusan --</option>
                  <option value="semua">Semua Jurusan</option>
                  {options.jurusan_list.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Posisi / Divisi</label>
              <div className="flex-1 min-w-0">
                <select
                  value={posisiMagang}
                  onChange={(e) => setPosisiMagang(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Posisi / Divisi --</option>
                  <option value="semua">Semua Posisi</option>
                  {options.posisi_list.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Pembimbing</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pembimbingId}
                  onChange={(e) => setPembimbingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Pembimbing --</option>
                  <option value="semua">Semua Pembimbing</option>
                  {options.pembimbing_list.map((pem) => (
                    <option key={pem.user_id} value={pem.user_id}>{pem.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Periode</label>
              <div className="flex-1 min-w-0">
                <select
                  value={statusPeriode}
                  onChange={(e) => setStatusPeriode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Status Periode --</option>
                  <option value="semua">Semua Status Periode</option>
                  <option value="aktif">Periode Aktif</option>
                  <option value="selesai">Selesai Magang</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 3: DATA PEMBIMBING (ADMIN) ════════ */}
        {kategoriLaporan === 'data_pembimbing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Mulai</label>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Selesai</label>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Pembimbing</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pembimbingId}
                  onChange={(e) => setPembimbingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Pembimbing --</option>
                  <option value="semua">Semua Pembimbing</option>
                  {options.pembimbing_list.map((pem) => (
                    <option key={pem.user_id} value={pem.user_id}>{pem.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Jabatan</label>
              <div className="flex-1 min-w-0">
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Jabatan --</option>
                  <option value="semua">Semua Jabatan</option>
                  {options.jabatan_list.map((jab) => (
                    <option key={jab.user_id || jab} value={jab}>{jab}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 4: REKAPITULASI KEHADIRAN (ADMIN) ════════ */}
        {kategoriLaporan === 'rekapitulasi_kehadiran' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Mulai</label>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tanggal Selesai</label>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Jurusan</label>
              <div className="flex-1 min-w-0">
                <select
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Jurusan --</option>
                  <option value="semua">Semua Jurusan</option>
                  {options.jurusan_list.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Pembimbing</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pembimbingId}
                  onChange={(e) => setPembimbingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Pembimbing --</option>
                  <option value="semua">Semua Pembimbing</option>
                  {options.pembimbing_list.map((pem) => (
                    <option key={pem.user_id} value={pem.user_id}>{pem.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Urutan Persentase</label>
              <div className="flex-1 min-w-0">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="asc">Terendah ke Tertinggi (Default)</option>
                  <option value="desc">Tertinggi ke Terendah</option>
                </select>
              </div>
            </div>
          </div>
        )}

          {/* ── OPSI FORMAT CETAK PDF (KOP SURAT) ── */}
          <div className="pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
            <input
              type="checkbox"
              checked={pakaiKop}
              onChange={(e) => setPakaiKop(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer accent-amber-500"
            />
            <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900 transition-colors">
              Sertakan Kop Surat Resmi Polifurneka pada Dokumen PDF
            </span>
          </label>
        </div>

        {/* ── ACTION BUTTONS: TAMPILKAN, UNDUH PDF, UNDUH EXCEL ── */}
        <div className="flex flex-col sm:flex-row sm:justify-end items-center gap-3 pt-2">
          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className="w-full sm:w-auto btn-poli-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-extrabold shadow-2xs disabled:opacity-50"
          >
            {loadingPreview ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            <span>Tampilkan</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-300 px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-2xs disabled:opacity-50"
          >
            {downloadingPdf ? (
              <Loader2 size={15} className="animate-spin text-slate-950" />
            ) : (
              <Download size={15} className="text-slate-950" />
            )}
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-2xs disabled:opacity-50"
          >
            {downloadingExcel ? (
              <Loader2 size={15} className="animate-spin text-white" />
            ) : (
              <FileSpreadsheet size={15} className="text-white" />
            )}
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* ── Empty State Preview ── */}
      {!previewData && !loadingPreview && (
        <div className="card-bento p-10 text-center space-y-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Belum Ada Data Ditampilkan</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Silakan tentukan filter di atas, lalu klik tombol <strong className="text-slate-700">"Tampilkan"</strong> untuk memuat data laporan pada halaman ini.
          </p>
        </div>
      )}

      {/* ── Preview Content Tables ── */}
      {previewData && (
        <div className="space-y-6">

          {/* TABEL PRESENSI */}
          {previewData.include_presensi && previewData.presensi && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  <span>Presensi Kehadiran ({previewData.presensi.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[850px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-40 whitespace-nowrap">Nama Peserta</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">NIM / NIS</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal</th>
                      <th className="px-3.5 py-3 w-24 whitespace-nowrap">Jam Masuk</th>
                      <th className="px-3.5 py-3 w-24 whitespace-nowrap">Jam Pulang</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.presensi.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data presensi sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.presensi.map((p, idx) => (
                        <tr key={p.presensi_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{p.peserta?.nama || '-'}</td>
                          <td className="px-3.5 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{p.peserta?.nim_nis || '-'}</td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{p.tanggal}</td>
                          <td className="px-3.5 py-3 font-mono whitespace-nowrap">{p.jam_masuk ? p.jam_masuk.slice(0, 5) : '-'}</td>
                          <td className="px-3.5 py-3 font-mono whitespace-nowrap">{p.jam_pulang ? p.jam_pulang.slice(0, 5) : '-'}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
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
          {previewData.include_logbook && previewData.logbook && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  <span>Logbook Kegiatan Harian ({previewData.logbook.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[980px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Nama Peserta</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">NIM / NIS</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal</th>
                      <th className="px-3.5 py-3 w-44">Judul Kegiatan</th>
                      <th className="px-3.5 py-3 w-48">Deskripsi</th>
                      <th className="px-3.5 py-3 w-36">Kendala</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Status</th>
                      <th className="px-3.5 py-3 w-44">Catatan Pembimbing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.logbook.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data logbook sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.logbook.map((l, idx) => (
                        <tr key={l.logbook_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{l.peserta?.nama || '-'}</td>
                          <td className="px-3.5 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{l.peserta?.nim_nis || '-'}</td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{l.tanggal}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">{l.judul_kegiatan}</td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={l.deskripsi}>
                              {l.deskripsi || '-'}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={l.kendala}>
                              {l.kendala || '-'}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <StatusBadge status={l.status} />
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={l.catatan_pembimbing}>
                              {l.catatan_pembimbing || '-'}
                            </span>
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
          {previewData.include_tugas && previewData.tugas && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckSquare size={16} className="text-emerald-600" />
                  <span>Daftar Penugasan Magang ({previewData.tugas.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[1050px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Nama Peserta</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">NIM / NIS</th>
                      <th className="px-3.5 py-3 w-40">Judul Tugas</th>
                      <th className="px-3.5 py-3 w-44">Deskripsi Tugas</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Pembimbing</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal Dibuat</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Deadline</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Status</th>
                      <th className="px-3.5 py-3 w-44">Catatan Revisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.tugas.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada tugas magang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.tugas.map((t, idx) => (
                        <tr key={t.tugas_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{t.peserta?.nama || '-'}</td>
                          <td className="px-3.5 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{t.peserta?.nim_nis || '-'}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">{t.judul || '-'}</td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={t.deskripsi}>
                              {t.deskripsi || '-'}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-slate-700 whitespace-nowrap">{t.pembimbing?.nama || '-'}</td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            {t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={t.pengumpulan_terakhir?.catatan_revisi}>
                              {t.pengumpulan_terakhir?.catatan_revisi || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL PENGAJUAN IZIN */}
          {previewData.include_izin && previewData.izin && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar size={16} className="text-purple-600" />
                  <span>Pengajuan Izin Magang ({previewData.izin.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[900px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Nama Peserta</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">NIM / NIS</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Jenis</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal Mulai</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal Selesai</th>
                      <th className="px-3.5 py-3 w-48">Keterangan</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Status</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Diverifikasi Oleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.izin.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data pengajuan izin sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.izin.map((iz, idx) => (
                        <tr key={iz.izin_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{iz.peserta?.nama || '-'}</td>
                          <td className="px-3.5 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{iz.peserta?.nim_nis || '-'}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-900">
                              {iz.jenis}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{iz.tanggal_mulai}</td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{iz.tanggal_selesai}</td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={iz.keterangan}>
                              {iz.keterangan || '-'}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <StatusBadge status={iz.status} />
                          </td>
                          <td className="px-3.5 py-3 font-medium text-slate-800 whitespace-nowrap">
                            {iz.pembimbing?.nama || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL DATA PESERTA */}
          {kategoriLaporan === 'data_peserta' && previewData.peserta_list && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users size={16} className="text-amber-600" />
                  <span>Daftar Data Peserta Magang ({previewData.peserta_list.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[1100px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Nama Peserta</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">NIM / NIS</th>
                      <th className="px-3.5 py-3 w-40 whitespace-nowrap">Email</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">No. HP</th>
                      <th className="px-3.5 py-3 w-32 whitespace-nowrap">Jurusan</th>
                      <th className="px-3.5 py-3 w-32 whitespace-nowrap">Posisi Magang</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Nama Pembimbing</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal Mulai</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Tanggal Selesai</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Status Periode</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">Status Akun</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.peserta_list.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data peserta magang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.peserta_list.map((p, idx) => (
                        <tr key={p.user_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{p.nama}</td>
                          <td className="px-3.5 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{p.nim_nis || '-'}</td>
                          <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">{p.email}</td>
                          <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">{p.no_hp || '-'}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">{p.jurusan || '-'}</td>
                          <td className="px-3.5 py-3 font-medium text-amber-900 whitespace-nowrap">{p.posisi_magang || '-'}</td>
                          <td className="px-3.5 py-3 font-medium whitespace-nowrap">{p.pembimbing_nama}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">{p.tanggal_mulai_magang || '-'}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">{p.tanggal_selesai_magang || '-'}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              p.is_magang_selesai ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {p.is_magang_selesai ? 'Selesai' : 'Aktif'}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              p.status_aktif ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {p.status_aktif ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL DATA PEMBIMBING */}
          {kategoriLaporan === 'data_pembimbing' && previewData.pembimbing_list && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  <span>Daftar Pembimbing Lapangan ({previewData.pembimbing_list.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[950px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-40 whitespace-nowrap">Nama Pembimbing</th>
                      <th className="px-3.5 py-3 w-44 whitespace-nowrap">Email</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">No. HP</th>
                      <th className="px-3.5 py-3 w-36 whitespace-nowrap">Jabatan</th>
                      <th className="px-3.5 py-3 w-32 text-center whitespace-nowrap">Total Bimbingan</th>
                      <th className="px-3.5 py-3">Daftar Peserta Bimbingan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.pembimbing_list.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data pembimbing sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.pembimbing_list.map((pem, idx) => (
                        <tr key={pem.user_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{pem.nama}</td>
                          <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">{pem.email}</td>
                          <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">{pem.no_hp || '-'}</td>
                          <td className="px-3.5 py-3 font-medium text-slate-800 whitespace-nowrap">{pem.jabatan || '-'}</td>
                          <td className="px-3.5 py-3 text-center font-bold text-amber-900 whitespace-nowrap">{pem.total_bimbingan || 0} Peserta</td>
                          <td className="px-3.5 py-3">
                            <span className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={pem.daftar_peserta_bimbingan}>
                              {pem.daftar_peserta_bimbingan || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL REKAPITULASI KEHADIRAN */}
          {kategoriLaporan === 'rekapitulasi_kehadiran' && previewData.rekap_kehadiran && (
            <div className="card-bento space-y-3 overflow-hidden">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 size={16} className="text-amber-600" />
                  <span>Rekapitulasi Kehadiran Peserta ({previewData.rekap_kehadiran.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[950px] text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">No</th>
                      <th className="px-3.5 py-3 w-40 whitespace-nowrap">Nama Peserta</th>
                      <th className="px-3.5 py-3 w-28 whitespace-nowrap">NIM / NIS</th>
                      <th className="px-3.5 py-3 w-32 whitespace-nowrap">Jurusan</th>
                      <th className="px-3.5 py-3 w-20 text-center whitespace-nowrap">Total Hari</th>
                      <th className="px-3.5 py-3 w-24 text-center whitespace-nowrap">Hadir</th>
                      <th className="px-3.5 py-3 w-32 text-center whitespace-nowrap">Terlambat/Cepat</th>
                      <th className="px-3.5 py-3 w-24 text-center whitespace-nowrap">Alpha</th>
                      <th className="px-3.5 py-3 w-24 text-center whitespace-nowrap">Presensi Luar</th>
                      <th className="px-3.5 py-3 w-32 text-center whitespace-nowrap">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.rekap_kehadiran.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data rekapitulasi kehadiran sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.rekap_kehadiran.map((rk, idx) => (
                        <tr key={rk.user_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">{rk.nama}</td>
                          <td className="px-3.5 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">{rk.nim_nis}</td>
                          <td className="px-3.5 py-3 whitespace-nowrap">{rk.jurusan}</td>
                          <td className="px-3.5 py-3 text-center font-mono font-bold whitespace-nowrap">{rk.total_hari}</td>
                          <td className="px-3.5 py-3 text-center font-mono text-emerald-700 font-bold whitespace-nowrap">{rk.jumlah_hadir}</td>
                          <td className="px-3.5 py-3 text-center font-mono text-amber-700 font-bold whitespace-nowrap">{rk.jumlah_terlambat_cepat}</td>
                          <td className="px-3.5 py-3 text-center font-mono text-rose-700 font-bold whitespace-nowrap">{rk.jumlah_alpha}</td>
                          <td className="px-3.5 py-3 text-center font-mono text-blue-700 font-bold whitespace-nowrap">{rk.jumlah_kegiatan_luar || 0}</td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold font-mono ${
                              rk.persentase_kehadiran >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : rk.persentase_kehadiran >= 60
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {rk.persentase_kehadiran}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* END PRATINJAU */}
        </div>
      )}
    </div>
  );
};

export default LaporanPage;
