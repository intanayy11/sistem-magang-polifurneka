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

  // Mode Filter: 'default' (Semua Data) | 'custom' (Filter Spesifik)
  const [modeFilter, setModeFilter] = useState('default');

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
    const params = {
      kategori_laporan: kategoriLaporan,
      pakai_kop: pakaiKop ? 1 : 0
    };

    if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
    if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;
    if (pesertaId && pesertaId !== 'semua') params.peserta_id = pesertaId;
    if (pembimbingId && pembimbingId !== 'semua') params.pembimbing_id = pembimbingId;
    if (jurusan && jurusan !== 'semua') params.jurusan = jurusan;
    if (posisiMagang && posisiMagang !== 'semua') params.posisi_magang = posisiMagang;
    if (jabatan && jabatan !== 'semua') params.jabatan = jabatan;

    if (kategoriLaporan === 'aktivitas_magang') {
      params.jenis_data = jenisData;
      if (statusPresensi && statusPresensi !== 'semua') params.status_presensi = statusPresensi;
      if (lokasiTipe && lokasiTipe !== 'semua') params.lokasi_tipe = lokasiTipe;
      if (statusLogbook && statusLogbook !== 'semua') params.status_logbook = statusLogbook;
      if (statusTugas && statusTugas !== 'semua') params.status_tugas = statusTugas;
      if (jenisIzin && jenisIzin !== 'semua') params.jenis_izin = jenisIzin;
      if (statusIzin && statusIzin !== 'semua') params.status_izin = statusIzin;
    }

    if (kategoriLaporan === 'data_peserta') {
      if (statusPeriode && statusPeriode !== 'semua') params.status_periode = statusPeriode;
      params.mode_tampilan = modeTampilan;
      params.rekap_by = rekapBy;
    }

    if (kategoriLaporan === 'rekapitulasi_kehadiran') {
      if (sortOrder) params.sort_order = sortOrder;
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

  // Smart handler saat pengguna mengubah nilai opsi dropdown
  const handleSelectChange = (setter, value) => {
    if (modeFilter === 'default' && value !== 'semua') {
      setModeFilter('custom');
      setPesertaId('');
      setPembimbingId('');
      setJurusan('');
      setPosisiMagang('');
      setJabatan('');
      setStatusPresensi('');
      setLokasiTipe('');
      setStatusLogbook('');
      setStatusTugas('');
      setJenisIzin('');
      setStatusIzin('');
      setStatusPeriode('');
      setPreviewData(null);
    }
    setter(value);
  };

  const handleResetFilter = () => {
    setJenisData('semua');
    setTanggalMulai('');
    setTanggalSelesai('');
    if (modeFilter === 'custom') {
      setPesertaId('');
      setPembimbingId('');
      setJurusan('');
      setPosisiMagang('');
      setJabatan('');
      setStatusPresensi('');
      setLokasiTipe('');
      setStatusLogbook('');
      setStatusTugas('');
      setJenisIzin('');
      setStatusIzin('');
      setStatusPeriode('');
    } else {
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
    }
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
      const token = localStorage.getItem('token');
      const queryParams = { ...buildQueryParams() };
      if (token) {
        queryParams.token = token;
      }

      const res = await api.get('/laporan/export', {
        params: queryParams,
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Jika response sebenarnya JSON error (misal 500/401)
      if (res.data && res.data.type === 'application/json') {
        const text = await res.data.text();
        let errorMsg = 'Gagal membuat file PDF laporan.';
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      // Ambil nama file dari Content-Disposition jika ada
      let filename = `Laporan_${kategoriLaporan}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const disposition = res.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([res.data], { type: 'application/pdf' });
      
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.setAttribute('type', 'application/pdf');
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 5000);
      }

      setAlert({
        type: 'success',
        message: `File ${filename} berhasil diunduh.`
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: err.message || 'Gagal mengunduh file PDF laporan.'
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

  // Helper header info dynamic based on active category
  const getHeaderInfo = () => {
    switch (kategoriLaporan) {
      case 'data_peserta':
        return {
          title: 'Laporan Data Peserta Magang',
          subtitle: 'Pratinjau data mahasiswa/siswa peserta magang, program studi, posisi, dan status periode magang.',
          icon: Users
        };
      case 'data_pembimbing':
        return {
          title: 'Laporan Data Pembimbing Lapangan',
          subtitle: 'Pratinjau data dosen & instruktur pembimbing instansi beserta rekap mahasiswa bimbingannya.',
          icon: UserCheck
        };
      case 'rekapitulasi_kehadiran':
        return {
          title: 'Laporan Rekapitulasi Kehadiran',
          subtitle: 'Akumulasi persentase kehadiran, jumlah hari masuk, keterlambatan, dan alpha per peserta magang.',
          icon: BarChart3
        };
      case 'laporan_program_magang':
        return {
          title: 'Laporan Program Magang',
          subtitle: 'Ringkasan statistik eksekutif keseluruhan pelaksanaan program magang Polifurneka Kendal.',
          icon: PieChart
        };
      case 'aktivitas_magang':
      default:
        return {
          title: 'Laporan Aktivitas Magang',
          subtitle: '',
          icon: BookOpen
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header Title (Dynamic per Category Focus) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeaderIcon className="text-amber-600" size={22} />
            <span>{headerInfo.title}</span>
          </h2>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />


      {/* ── DYNAMIC FILTER FORM BASED ON SELECTED CATEGORY ── */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
            <Filter size={16} className="text-amber-600" />
            <span>Form Filter Laporan</span>
          </h3>

          <div className="flex items-center gap-3">
            {/* Mode Switcher Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setModeFilter('default');
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
                  setPreviewData(null);
                  setAlert(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  modeFilter === 'default'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare size={13} />
                <span>Default (Semua Data)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModeFilter('custom');
                  setPesertaId('');
                  setPembimbingId('');
                  setJurusan('');
                  setPosisiMagang('');
                  setJabatan('');
                  setStatusPresensi('');
                  setLokasiTipe('');
                  setStatusLogbook('');
                  setStatusTugas('');
                  setJenisIzin('');
                  setStatusIzin('');
                  setStatusPeriode('');
                  setPreviewData(null);
                  setAlert(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  modeFilter === 'custom'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Custom Filter</span>
              </button>
            </div>

            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-900 transition-colors font-medium ml-2"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ════════ FORM FILTER KATEGORI 1: AKTIVITAS MAGANG ════════ */}
        {kategoriLaporan === 'aktivitas_magang' && (
          <div className="space-y-5 text-xs">
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
            {/* Sub-section 1: Periode & Target Peserta */}
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
                    <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Peserta Bimbingan</label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={pesertaId}
                        onChange={(e) => handleSelectChange(setPesertaId, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="">-- Pilih Peserta Bimbingan --</option>
                        <option value="semua">Semua Peserta Bimbingan</option>
                        {options.peserta_list.map((p) => (
                          <option key={p.user_id} value={p.user_id}>
                            {p.nama} ({p.nim_nis || '-'})
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
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Peserta</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={pesertaId}
                          onChange={(e) => handleSelectChange(setPesertaId, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Peserta Spesifik --</option>
                          <option value="semua">Semua Peserta</option>
                          {options.peserta_list.map((p) => (
                            <option key={p.user_id} value={p.user_id}>
                              {p.nama} ({p.nim_nis || '-'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Jurusan</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={jurusan}
                          onChange={(e) => handleSelectChange(setJurusan, e.target.value)}
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
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Posisi Magang</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={posisiMagang}
                          onChange={(e) => handleSelectChange(setPosisiMagang, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Posisi Magang --</option>
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

            {/* Sub-section 2: Detail Parameter Status */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3">
                {(jenisData === 'semua' || jenisData === 'presensi') && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Presensi</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={statusPresensi}
                          onChange={(e) => handleSelectChange(setStatusPresensi, e.target.value)}
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

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Tipe Lokasi</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={lokasiTipe}
                          onChange={(e) => handleSelectChange(setLokasiTipe, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="">-- Pilih Tipe Lokasi --</option>
                          <option value="semua">Semua Tipe Lokasi</option>
                          <option value="instansi">Instansi</option>
                          <option value="luar">Kegiatan Luar</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {(jenisData === 'semua' || jenisData === 'logbook') && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Logbook</label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={statusLogbook}
                        onChange={(e) => handleSelectChange(setStatusLogbook, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="">-- Pilih Status Logbook --</option>
                        <option value="semua">Semua Status Logbook</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Approve">Approve</option>
                        <option value="Revisi">Revisi</option>
                      </select>
                    </div>
                  </div>
                )}

                {(jenisData === 'semua' || jenisData === 'tugas') && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Status Penugasan</label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={statusTugas}
                        onChange={(e) => handleSelectChange(setStatusTugas, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="">-- Pilih Status Tugas --</option>
                        <option value="semua">Semua Status Tugas</option>
                        <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                        <option value="Menunggu Review">Menunggu Review</option>
                        <option value="Perlu Revisi">Perlu Revisi</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>
                )}

                {(jenisData === 'semua' || jenisData === 'izin') && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Jenis Izin</label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={jenisIzin}
                          onChange={(e) => handleSelectChange(setJenisIzin, e.target.value)}
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
                          onChange={(e) => handleSelectChange(setStatusIzin, e.target.value)}
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
                  onChange={(e) => handleSelectChange(setPesertaId, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Peserta --</option>
                  <option value="semua">Semua Peserta</option>
                  {options.peserta_list.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.nama} ({p.nim_nis || '-'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Jurusan</label>
              <div className="flex-1 min-w-0">
                <select
                  value={jurusan}
                  onChange={(e) => handleSelectChange(setJurusan, e.target.value)}
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
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Posisi Magang</label>
              <div className="flex-1 min-w-0">
                <select
                  value={posisiMagang}
                  onChange={(e) => handleSelectChange(setPosisiMagang, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Posisi Magang --</option>
                  <option value="semua">Semua Posisi</option>
                  {options.posisi_list.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Pembimbing</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pembimbingId}
                  onChange={(e) => handleSelectChange(setPembimbingId, e.target.value)}
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
                  onChange={(e) => handleSelectChange(setStatusPeriode, e.target.value)}
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
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Nama Pembimbing</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pembimbingId}
                  onChange={(e) => handleSelectChange(setPembimbingId, e.target.value)}
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
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Jabatan</label>
              <div className="flex-1 min-w-0">
                <select
                  value={jabatan}
                  onChange={(e) => handleSelectChange(setJabatan, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Pilih Jabatan Pembimbing --</option>
                  <option value="semua">Semua Jabatan</option>
                  {options.jabatan_list.map((jab) => (
                    <option key={jab} value={jab}>{jab}</option>
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
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Jurusan</label>
              <div className="flex-1 min-w-0">
                <select
                  value={jurusan}
                  onChange={(e) => handleSelectChange(setJurusan, e.target.value)}
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
              <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Filter Pembimbing</label>
              <div className="flex-1 min-w-0">
                <select
                  value={pembimbingId}
                  onChange={(e) => handleSelectChange(setPembimbingId, e.target.value)}
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
                  <option value="">-- Pilih Urutan --</option>
                  <option value="asc">Terendah ke Tertinggi (Default)</option>
                  <option value="desc">Tertinggi ke Terendah</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ════════ FORM FILTER KATEGORI 5: LAPORAN PROGRAM MAGANG (ADMIN) ════════ */}
        {kategoriLaporan === 'laporan_program_magang' && (
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

        {/* ── ACTION BUTTONS: TAMPILKAN & UNDUH PDF ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
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

          {/* TABEL PENGAJUAN IZIN */}
          {previewData.include_izin && previewData.izin && (
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar size={16} className="text-purple-600" />
                  <span>Pengajuan Izin Magang ({previewData.izin.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Rentang Tanggal</th>
                      {user?.role !== 'peserta' && <th className="px-4 py-3">Peserta</th>}
                      <th className="px-4 py-3">Jenis Izin</th>
                      <th className="px-4 py-3">Keterangan / Alasan</th>
                      <th className="px-4 py-3">Status Pengajuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.izin.length === 0 ? (
                      <tr>
                        <td colSpan={user?.role !== 'peserta' ? 6 : 5} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data pengajuan izin sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.izin.map((iz, idx) => (
                        <tr key={iz.izin_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {iz.tanggal_mulai} s/d {iz.tanggal_selesai}
                          </td>
                          {user?.role !== 'peserta' && (
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{iz.peserta?.nama || '-'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{iz.peserta?.nim_nis}</div>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-900">
                              {iz.jenis}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{iz.keterangan || iz.alasan || '-'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={iz.status} />
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
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users size={16} className="text-amber-600" />
                  <span>Daftar Data Peserta Magang ({previewData.peserta_list.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">NIM / NIS</th>
                      <th className="px-4 py-3">Nama Peserta</th>
                      <th className="px-4 py-3">Instansi / Sekolah</th>
                      <th className="px-4 py-3">Jurusan</th>
                      <th className="px-4 py-3">Posisi Magang</th>
                      <th className="px-4 py-3">Pembimbing Lapangan</th>
                      <th className="px-4 py-3">Status Periode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.peserta_list.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data peserta magang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.peserta_list.map((p, idx) => (
                        <tr key={p.user_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-800">{p.nim_nis || '-'}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{p.nama}</td>
                          <td className="px-4 py-3">{p.asal_instansi || '-'}</td>
                          <td className="px-4 py-3">{p.jurusan || '-'}</td>
                          <td className="px-4 py-3 font-medium text-amber-900">{p.posisi_magang || '-'}</td>
                          <td className="px-4 py-3 font-medium">{p.pembimbing_nama}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              p.is_magang_selesai ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {p.is_magang_selesai ? 'Selesai' : 'Aktif'}
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
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  <span>Daftar Pembimbing Lapangan ({previewData.pembimbing_list.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nama Pembimbing</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Jabatan</th>
                      <th className="px-4 py-3">Total Peserta Bimbingan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.pembimbing_list.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data pembimbing sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.pembimbing_list.map((pem, idx) => (
                        <tr key={pem.user_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{pem.nama}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{pem.email}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{pem.jabatan || '-'}</td>
                          <td className="px-4 py-3 font-bold text-amber-900">{pem.total_bimbingan || 0} Peserta</td>
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
            <div className="card-bento space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 size={16} className="text-amber-600" />
                  <span>Rekapitulasi Kehadiran Peserta ({previewData.rekap_kehadiran.length} Data)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">NIM / NIS</th>
                      <th className="px-4 py-3">Nama Peserta</th>
                      <th className="px-4 py-3">Jurusan</th>
                      <th className="px-4 py-3 text-center">Total Hari</th>
                      <th className="px-4 py-3 text-center">Hadir</th>
                      <th className="px-4 py-3 text-center">Terlambat/Pulang Cepat</th>
                      <th className="px-4 py-3 text-center">Alpha</th>
                      <th className="px-4 py-3 text-center">Persentase (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.rekap_kehadiran.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                          Tidak ada data rekapitulasi kehadiran sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      previewData.rekap_kehadiran.map((rk, idx) => (
                        <tr key={rk.user_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-800">{rk.nim_nis}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{rk.nama}</td>
                          <td className="px-4 py-3">{rk.jurusan}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold">{rk.total_hari}</td>
                          <td className="px-4 py-3 text-center font-mono text-emerald-700 font-bold">{rk.jumlah_hadir}</td>
                          <td className="px-4 py-3 text-center font-mono text-amber-700 font-bold">{rk.jumlah_terlambat_cepat}</td>
                          <td className="px-4 py-3 text-center font-mono text-rose-700 font-bold">{rk.jumlah_alpha}</td>
                          <td className="px-4 py-3 text-center">
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

          {/* PRATINJAU LAPORAN PROGRAM MAGANG */}
          {kategoriLaporan === 'laporan_program_magang' && previewData.summary_cards && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-bento p-4 border-l-4 border-l-amber-500 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta Aktif</p>
                  <h4 className="text-2xl font-black text-slate-900">{previewData.summary_cards.total_peserta_aktif}</h4>
                  <p className="text-[10px] text-slate-400">Sedang Menjalani Magang</p>
                </div>
                <div className="card-bento p-4 border-l-4 border-l-emerald-500 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta Selesai</p>
                  <h4 className="text-2xl font-black text-slate-900">{previewData.summary_cards.total_peserta_selesai}</h4>
                  <p className="text-[10px] text-slate-400">Telah Menyelesaikan Program</p>
                </div>
                <div className="card-bento p-4 border-l-4 border-l-blue-500 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pembimbing Lapangan</p>
                  <h4 className="text-2xl font-black text-slate-900">{previewData.summary_cards.total_pembimbing_aktif}</h4>
                  <p className="text-[10px] text-slate-400">Pembimbing Aktif Sistem</p>
                </div>
                <div className="card-bento p-4 border-l-4 border-l-purple-500 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Kehadiran</p>
                  <h4 className="text-2xl font-black text-slate-900">{previewData.summary_cards.rata_kehadiran}%</h4>
                  <p className="text-[10px] text-slate-400">Tingkat Kehadiran Lintas Peserta</p>
                </div>
              </div>

              {/* STATISTIK TUGAS & LOGBOOK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-bento space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-600" />
                    <span>Ringkasan Status Penugasan</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Selesai</span>
                      <span className="font-bold text-emerald-700 text-sm">{previewData.summary_cards.tugas_stats?.selesai || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Menunggu Review</span>
                      <span className="font-bold text-blue-700 text-sm">{previewData.summary_cards.tugas_stats?.menunggu_review || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Perlu Revisi</span>
                      <span className="font-bold text-amber-700 text-sm">{previewData.summary_cards.tugas_stats?.perlu_revisi || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Belum Dikerjakan</span>
                      <span className="font-bold text-rose-700 text-sm">{previewData.summary_cards.tugas_stats?.belum_dikerjakan || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card-bento space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-600" />
                    <span>Ringkasan Status Logbook Harian</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Approve</span>
                      <span className="font-bold text-emerald-700 text-sm">{previewData.summary_cards.logbook_stats?.approve || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Menunggu</span>
                      <span className="font-bold text-blue-700 text-sm">{previewData.summary_cards.logbook_stats?.menunggu || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Revisi</span>
                      <span className="font-bold text-amber-700 text-sm">{previewData.summary_cards.logbook_stats?.revisi || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default LaporanPage;
