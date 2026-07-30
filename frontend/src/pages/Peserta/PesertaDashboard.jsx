import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import DovetailDivider from '../../components/DovetailDivider';
import {
  Clock,
  BookOpen,
  CheckSquare,
  FileDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ListTodo,
  FileText
} from 'lucide-react';

const PesertaDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  // Map Modal state
  const [mapModal, setMapModal] = useState({ open: false, lat: null, lng: null, title: '', timestamp: '' });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/peserta');
      if (res.data.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Get GPS coordinates from browser
  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }
      setLocationStatus('Mendapatkan lokasi GPS...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('');
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        () => {
          setLocationStatus('');
          resolve({ latitude: null, longitude: null });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage('');
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-in', { latitude, longitude });
      setMessage(res.data.message);
      fetchDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal check-in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage('');
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-out', { latitude, longitude });
      setMessage(res.data.message);
      fetchDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal check-out.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setMessage('Sedang membuat PDF, mohon tunggu...');
      const res = await api.get('/export/rekap-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Rekap_Magang_Polifurneka.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Gagal mengunduh rekap PDF.');
    }
  };

  // Greeting helper based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  const {
    persentase_kehadiran = 0,
    total_presensi = 0,
    logbook_pending_count = 0,
    tugas_stats = { belum_dikerjakan: 0, menunggu_review: 0, perlu_revisi: 0, selesai: 0 },
    today_presensi,
    sudah_presensi_hari_ini,
    jam_sekarang,
    recent_logbooks = [],
    recent_tugas = [],
    trend_kehadiran = []
  } = data || {};

  // Working day check (Monday=1 to Friday=5)
  const currentDay = new Date().getDay();
  const isWorkDay = currentDay >= 1 && currentDay <= 5;
  const isWeekend = currentDay === 0 || currentDay === 6;

  // Donut SVG circumference calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (persentase_kehadiran / 100) * circumference;

  return (
    <div className="space-y-6">

      {/* Signature Dovetail Separator Accent */}
      <DovetailDivider className="mb-2" />

      {(message || locationStatus) && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${locationStatus ? 'bg-blue-50 border border-blue-200 text-blue-900' : 'bg-amber-50 border border-amber-200 text-amber-900'}`}>
          {locationStatus ? <Loader2 size={17} className="animate-spin shrink-0 text-blue-600" /> : <AlertCircle size={17} className="text-amber-600 shrink-0" />}
          <span>{locationStatus || message}</span>
        </div>
      )}

      {/* ── BENTO GRID CONTAINER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT & CENTER MAIN CONTENT (Span 2) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* BENTO CARD 1: HERO CARD (Clean Light Surface with Polifurneka Amber Touch) */}
          <div className="card-bento bg-gradient-to-r from-[#FFFBEB] via-white to-[#FEF9E7] border border-amber-200/70 text-slate-900 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Subtle Amber Glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E8A800]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-bold">
                  <Sparkles size={14} className="text-amber-600" />
                  <span>Portal Magang</span>
                </div>

                <button
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-2 btn-poli-primary px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-xs hover:scale-105 transition-transform"
                >
                  <FileDown size={15} />
                  <span className="hidden sm:inline">Rekap PDF</span>
                </button>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {getGreeting()}, {user?.nama || 'Peserta'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg leading-relaxed font-medium">
                  Pantau presensi, logbook harian, dan tugas magang Polifurneka Anda.
                </p>
              </div>
            </div>

            {/* INTEGRATED CHECK-IN / CHECK-OUT BANNER WIDGET */}
            <div className="relative z-10 mt-6 pt-4 border-t border-amber-200/60">
              {isWeekend ? (
                <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold">
                  <Calendar size={16} className="text-amber-600" />
                  <span>Hari ini libur magang (Akhir Pekan)</span>
                </div>
              ) : !today_presensi ? (
                <div className="bg-amber-100/60 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                      <AlertCircle size={15} className="text-amber-600" />
                      <span>Belum Presensi Hari Ini</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">
                      Segera check-in. {jam_sekarang && <span className="text-amber-900 font-mono font-bold">Jam Server: {jam_sekarang} WIB</span>}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="w-full sm:w-auto btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 font-extrabold shrink-0"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                    <span>{actionLoading ? 'Memproses...' : 'Check-In Sekarang'}</span>
                  </button>
                </div>
              ) : !today_presensi.jam_pulang ? (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-extrabold uppercase tracking-wider">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Sudah Check-In ({today_presensi.jam_masuk})</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">
                      Jangan lupa check-out setelah selesai jam magang.
                    </p>
                  </div>
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="w-full sm:w-auto btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 font-extrabold shrink-0"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                    <span>{actionLoading ? 'Memproses...' : 'Check-Out Sekarang'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-100/60 border border-emerald-200 px-4 py-2.5 rounded-xl">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  <span>Presensi Selesai ({today_presensi.jam_masuk} - {today_presensi.jam_pulang})</span>
                </div>
              )}
            </div>
          </div>

          {/* BENTO ROW 2: DONUT CHART + STATUS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* BENTO CARD 2: ATTENDANCE DONUT RING CHART */}
            <div className="card-bento sm:col-span-1 flex flex-col justify-between items-center text-center">
              <div className="w-full text-left">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Kehadiran
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">Persentase Kehadiran</h3>
              </div>

              {/* Donut SVG Ring */}
              <div className="relative my-4 flex items-center justify-center">
                <svg width="120" height="120" className="transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="#F1EFEA"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="#E8A800"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 font-poppins">{persentase_kehadiran}%</span>
                  <span className="text-[10px] text-slate-400 font-medium">Hadir</span>
                </div>
              </div>

              <div className="w-full text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between font-medium">
                <span>Total Hadir:</span>
                <span className="font-bold text-slate-800">{total_presensi} Hari</span>
              </div>
            </div>

            {/* BENTO CARD 3: METRIC BADGES (Span 2) */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-4">

              <div className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Logbook Menunggu</span>
                  <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800"><BookOpen size={18} /></div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{logbook_pending_count}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Menunggu review</p>
                </div>
              </div>

              <div className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tugas Review</span>
                  <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700"><CheckSquare size={18} /></div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{tugas_stats.menunggu_review}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sudah dikumpulkan</p>
                </div>
              </div>

              <div className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tugas Revisi</span>
                  <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700"><AlertCircle size={18} /></div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{tugas_stats.perlu_revisi}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Perlu perbaikan</p>
                </div>
              </div>

              <div className="card-bento p-5 flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tugas Selesai</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={18} /></div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{tugas_stats.selesai}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sudah disetujui</p>
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* ── RIGHT SIDEBAR WIDGET COLUMN (Span 1) ── */}
        <div className="space-y-6">

          {/* WIDGET 1: DEADLINE TUGAS TERDEKAT */}
          <div className="card-bento space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ListTodo size={16} className="text-[#E8A800]" />
                <span>Tugas Terbaru & Deadline</span>
              </h3>
              <a href="/peserta/tugas" className="text-xs font-bold text-[#E8A800] hover:underline flex items-center gap-0.5">
                <span>Semua</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {recent_tugas.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Belum ada tugas magang.</p>
            ) : (
              <div className="space-y-3">
                {recent_tugas.map((tugas) => (
                  <div key={tugas.tugas_id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100/70 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-1">{tugas.judul_tugas}</h4>
                      <StatusBadge status={tugas.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Deadline:</span>
                      <span className="font-mono text-slate-700 font-semibold">{tugas.deadline || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WIDGET 2: AKTIVITAS LOGBOOK TERBARU */}
          <div className="card-bento space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText size={16} className="text-[#E8A800]" />
                <span>Aktivitas Logbook Terbaru</span>
              </h3>
              <a href="/peserta/logbook" className="text-xs font-bold text-[#E8A800] hover:underline flex items-center gap-0.5">
                <span>Semua</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {recent_logbooks.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Belum ada catatan logbook.</p>
            ) : (
              <div className="space-y-3">
                {recent_logbooks.map((log) => (
                  <div key={log.logbook_id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 hover:bg-slate-100/70 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">{log.tanggal}</span>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                      {log.judul_kegiatan}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={mapModal.open}
        onClose={() => setMapModal({ ...mapModal, open: false })}
        latitude={mapModal.lat}
        longitude={mapModal.lng}
        title={mapModal.title}
        timestamp={mapModal.timestamp}
      />
    </div>
  );
};

export default PesertaDashboard;
