import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  CheckCircle2,
  Calendar,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ListTodo,
  FileText
} from 'lucide-react';
import { isTaskOverdue } from '../../utils/dateHelpers';

const PesertaDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  // Map Modal State
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
    setAlert(null);
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-in', { latitude, longitude });
      setAlert({ type: 'success', message: res.data.message });
      fetchDashboard();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal presensi masuk' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAlert(null);
    const isFridayNow = new Date().getDay() === 5;
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const minHour = 16;
    const minMinute = isFridayNow ? 30 : 0;

    if (currentHour < minHour || (currentHour === minHour && currentMinute < minMinute)) {
      const jamTarget = isFridayNow ? '16.30 WIB' : '16.00 WIB';
      setAlert({
        type: 'warning',
        message: `Belum waktunya presensi pulang. Presensi pulang baru dapat dilakukan mulai pukul ${jamTarget}.`,
      });
      return;
    }

    setActionLoading(true);
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-out', { latitude, longitude });
      setAlert({ type: 'success', message: res.data.message });
      fetchDashboard();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal presensi pulang' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await api.get('/laporan/rekap-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rekap-magang-${user?.nama || 'peserta'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mendownload rekap PDF.');
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
    jam_sekarang,
    recent_logbooks = [],
    recent_tugas = []
  } = data || {};

  // Working day check (Monday=1 to Friday=5)
  const currentDay = new Date().getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;

  // Donut SVG circumference calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (persentase_kehadiran / 100) * circumference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Location Loading Status Banner */}
      {locationStatus && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 bg-amber-50 text-amber-900 border border-amber-200">
          <Loader2 size={16} className="animate-spin text-amber-600 shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Alert Banner */}
      {alert && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase ml-3">
            Tutup
          </button>
        </div>
      )}

      {/* ── SECTION 1: HERO & STATS METRICS (FULL TOP GRID) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* HERO CARD (Span 7) */}
        <div className="lg:col-span-7 card-bento bg-gradient-to-r from-[#FFFBEB] via-white to-[#FEF9E7] border border-amber-200/70 text-slate-900 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E8A800]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-end">
              <button
                onClick={() => navigate('/peserta/laporan')}
                className="inline-flex items-center gap-2 btn-poli-primary px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-xs hover:scale-105 transition-transform"
              >
                <FileText size={15} />
                <span className="hidden sm:inline">Laporan Magang</span>
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

          {/* PRESENSI BANNER WIDGET */}
          <div className="relative z-10 mt-5 pt-3.5 border-t border-amber-200/60">
            {isWeekend ? (
              <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold">
                <Calendar size={16} className="text-amber-600" />
                <span>Hari ini libur magang (Akhir Pekan)</span>
              </div>
            ) : !today_presensi ? (
              <div className="bg-amber-100/60 border border-amber-300/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                    <AlertCircle size={15} className="text-amber-600" />
                    <span>Belum Presensi Hari Ini</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 font-medium">
                    Segera presensi masuk. {jam_sekarang && <span className="text-amber-900 font-mono font-bold">Jam Server: {jam_sekarang} WIB</span>}
                  </p>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full sm:w-auto btn-poli-primary px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 font-extrabold shrink-0"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                  <span>{actionLoading ? 'Memproses...' : 'Presensi Masuk'}</span>
                </button>
              </div>
            ) : !today_presensi.jam_pulang ? (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-900 text-xs font-extrabold uppercase tracking-wider">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Sudah Presensi Masuk ({today_presensi.jam_masuk})</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 font-medium">
                    Jangan lupa presensi pulang setelah selesai jam magang.
                  </p>
                </div>
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="w-full sm:w-auto btn-poli-primary px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 font-extrabold shrink-0"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                  <span>{actionLoading ? 'Memproses...' : 'Presensi Pulang'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-100/60 border border-emerald-200 px-4 py-2 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Presensi Selesai ({today_presensi.jam_masuk} - {today_presensi.jam_pulang})</span>
              </div>
            )}
          </div>
        </div>

        {/* DONUT CHART (Span 5) */}
        <div className="lg:col-span-5 card-bento flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-left">
                Kehadiran
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5 text-left">Persentase Kehadiran</h3>
            </div>
            <span className="text-xs font-bold font-mono text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg">
              {total_presensi} Hari Tercatat
            </span>
          </div>

          {/* Donut SVG Ring */}
          <div className="relative my-2 flex items-center justify-center">
            <svg width="105" height="105" className="transform -rotate-90">
              <circle cx="52.5" cy="52.5" r={radius} stroke="#F1EFEA" strokeWidth="9" fill="transparent" />
              <circle
                cx="52.5"
                cy="52.5"
                r={radius}
                stroke="#E8A800"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900 font-poppins">{persentase_kehadiran}%</span>
              <span className="text-[10px] text-slate-400 font-medium">Hadir</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 font-medium text-slate-600">
            <a
              href="/peserta/logbook"
              className="bg-slate-50 hover:bg-amber-50/80 p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 block transition-all group cursor-pointer text-center"
              title="Buka halaman Logbook Kegiatan"
            >
              <span className="text-[10px] text-slate-400 group-hover:text-amber-800 transition-colors block">Logbook Pending</span>
              <span className="font-bold text-amber-800 text-sm group-hover:scale-110 transition-transform inline-block">{logbook_pending_count}</span>
            </a>
            <a
              href="/peserta/tugas"
              className="bg-slate-50 hover:bg-rose-50/80 p-2.5 rounded-xl border border-slate-100 hover:border-rose-200 block transition-all group cursor-pointer text-center"
              title="Buka halaman Tugas Magang"
            >
              <span className="text-[10px] text-slate-400 group-hover:text-rose-800 transition-colors block">Tugas Revisi</span>
              <span className="font-bold text-rose-700 text-sm group-hover:scale-110 transition-transform inline-block">{tugas_stats.perlu_revisi}</span>
            </a>
          </div>
        </div>

      </div>

      <DovetailDivider className="my-2" />

      {/* ── SECTION 2: SIDE-BY-SIDE WIDGETS (3 ITEMS MAX FOR TUGAS & LOGBOOK) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* WIDGET 1: DEADLINE TUGAS TERBARU (MAX 3 ITEMS) */}
        <div className="card-bento space-y-3.5">
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
            <div className="space-y-2.5">
              {recent_tugas.slice(0, 3).map((tugas) => {
                const formattedDeadline = tugas.deadline
                  ? new Date(tugas.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '-';
                return (
                  <div key={tugas.tugas_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 hover:bg-slate-100/70 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 leading-snug truncate">{tugas.judul_tugas}</h4>
                        {isTaskOverdue(tugas.deadline, tugas.status) && (
                          <span className="text-[9px] font-extrabold text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-2xs shrink-0 whitespace-nowrap">
                            Lewat Tenggat
                          </span>
                        )}
                      </div>
                      <StatusBadge status={tugas.status} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span>Deadline:</span>
                      <span className={`font-mono ${isTaskOverdue(tugas.deadline, tugas.status) ? 'text-rose-700 font-bold' : 'text-slate-700 font-semibold'}`}>
                        {formattedDeadline}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WIDGET 2: AKTIVITAS LOGBOOK TERBARU (MAX 3 ITEMS) */}
        <div className="card-bento space-y-3.5">
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
            <div className="space-y-2.5">
              {recent_logbooks.slice(0, 3).map((log) => (
                <div key={log.logbook_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 hover:bg-slate-100/70 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-600 font-bold">
                      {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <StatusBadge status={log.status} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1 leading-snug">
                    {log.judul_kegiatan}
                  </p>
                </div>
              ))}
            </div>
          )}
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
