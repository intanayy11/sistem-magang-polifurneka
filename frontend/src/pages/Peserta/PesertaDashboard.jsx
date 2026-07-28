import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
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
  Loader2
} from 'lucide-react';

const PesertaDashboard = () => {
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const { persentase_kehadiran, total_presensi, logbook_pending_count, tugas_stats, today_presensi } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-[18px] p-6 md:p-7 border border-slate-200 shadow-2xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#E8A800]" />
        <div className="pl-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang di Dashboard Peserta
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Pantau statistik kehadiran, logbook harian, serta pengerjaan tugas magang Polifurneka Anda.
          </p>
        </div>
        <button
          onClick={handleExportPdf}
          className="flex items-center justify-center gap-2 btn-poli-primary px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs shrink-0 self-start md:self-auto"
        >
          <FileDown size={16} />
          <span>Unduh Rekap PDF</span>
        </button>
      </div>

      {(message || locationStatus) && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${locationStatus ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-amber-50 border border-amber-200 text-amber-900'}`}>
          {locationStatus ? <Loader2 size={16} className="animate-spin shrink-0" /> : <AlertCircle size={16} className="text-amber-600 shrink-0" />}
          <span>{locationStatus || message}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presensi Kehadiran</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><TrendingUp size={18} /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{persentase_kehadiran}%</div>
            <p className="text-xs text-slate-400 mt-1">Total {total_presensi} hari terekam</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logbook Menunggu</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><BookOpen size={18} /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{logbook_pending_count}</div>
            <p className="text-xs text-slate-400 mt-1">Menunggu review pembimbing</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas Menunggu Review</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><CheckSquare size={18} /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{tugas_stats.menunggu_review}</div>
            <p className="text-xs text-slate-400 mt-1">Telah dikumpulkan</p>
          </div>
        </div>

        <div className="card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas Selesai</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={18} /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{tugas_stats.selesai}</div>
            <p className="text-xs text-slate-400 mt-1">Tugas disetujui pembimbing</p>
          </div>
        </div>
      </div>

      {/* Presensi Quick Action Widget */}
      <div className="card-clean p-6">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Presensi Hari Ini</h3>
          </div>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Calendar size={14} />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* GPS note */}
        <div className="mb-4 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <MapPin size={13} className="text-amber-600 shrink-0" />
          <span>Presensi dilengkapi GPS otomatis. Pastikan izin lokasi diaktifkan di browser Anda.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 block">Status Presensi Hari Ini</span>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={today_presensi?.status || 'Belum Presensi'} />
            </div>
            {/* Show location pin if check-in exists */}
            {today_presensi?.jam_masuk && (
              <button
                onClick={() =>
                  setMapModal({
                    open: true,
                    lat: today_presensi.latitude_masuk || -6.958742,
                    lng: today_presensi.longitude_masuk || 110.285810,
                    title: 'Lokasi Check-In',
                    timestamp: `Jam Masuk: ${today_presensi.jam_masuk}`,
                  })
                }
                className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-100/90 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300/70 font-semibold transition-all shadow-2xs"
              >
                <MapPin size={13} className="text-amber-700" />
                <span>Lihat Peta Lokasi Check-In</span>
              </button>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 block">Jam Masuk / Jam Pulang</span>
            <div className="mt-1 font-semibold text-slate-800 text-sm font-mono">
              {today_presensi?.jam_masuk || '--:--'} / {today_presensi?.jam_pulang || '--:--'}
            </div>
            {today_presensi?.jam_pulang && (
              <button
                onClick={() =>
                  setMapModal({
                    open: true,
                    lat: today_presensi.latitude_pulang || -6.958742,
                    lng: today_presensi.longitude_pulang || 110.285810,
                    title: 'Lokasi Check-Out',
                    timestamp: `Jam Pulang: ${today_presensi.jam_pulang}`,
                  })
                }
                className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300/70 font-semibold transition-all shadow-2xs"
              >
                <MapPin size={13} className="text-emerald-700" />
                <span>Lihat Peta Lokasi Check-Out</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {new Date().getDay() === 0 || new Date().getDay() === 6 ? (
              <div className="w-full py-3 bg-slate-100 text-slate-500 font-semibold rounded-xl text-center border border-slate-200 text-xs">
                Hari Libur - Tidak Ada Jadwal Magang
              </div>
            ) : !today_presensi ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full btn-poli-primary py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                <span>{actionLoading ? 'Memproses...' : 'Check-In Sekarang'}</span>
              </button>
            ) : !today_presensi.jam_pulang ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full bg-[#2A180D] hover:bg-[#1C1008] text-amber-400 font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 border border-amber-900/40"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                <span>{actionLoading ? 'Memproses...' : 'Check-Out Sekarang'}</span>
              </button>
            ) : (
              <div className="w-full py-3 bg-emerald-50 text-emerald-800 font-semibold rounded-xl text-center border border-emerald-200/60 text-xs">
                ✓ Presensi Hari Ini Selesai
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
