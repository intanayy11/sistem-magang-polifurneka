import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import DovetailDivider from '../../components/DovetailDivider';
import { Clock, Calendar, AlertCircle, MapPin, Loader2, Info } from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';

const PresensiPage = () => {
  const [today, setToday] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  // Map Modal
  const [mapModal, setMapModal] = useState({ open: false, lat: null, lng: null, title: '', timestamp: '' });

  const fetchPresensi = async () => {
    try {
      const res = await api.get('/presensi/riwayat');
      if (res.data.status === 'success') {
        setToday(res.data.data.today);
        setRiwayat(res.data.data.riwayat);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresensi();
  }, []);

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }
      setLocationStatus('Mendapatkan lokasi GPS Anda...');
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
      setAlert({ type: 'success', message: res.data.message + (latitude ? ` 📍 Lokasi GPS dicatat.` : '') });
      fetchPresensi();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal melakukan check-in' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setAlert(null);
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-out', { latitude, longitude });
      setAlert({ type: 'success', message: res.data.message + (latitude ? ` 📍 Lokasi GPS dicatat.` : '') });
      fetchPresensi();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal melakukan check-out' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  const currentDay = new Date().getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;
  const isFriday = currentDay === 5;
  const jamMasuk = '07:30 WIB';
  const jamPulang = isFriday ? '16:30 WIB' : '16:00 WIB';

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Presensi Harian Magang</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Lakukan check-in dan check-out sesuai jam kerja. Lokasi GPS akan dicatat otomatis.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
          <Calendar size={14} className="text-amber-600" />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      {locationStatus && (
        <div className="p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 bg-blue-50 text-blue-900 border border-blue-200">
          <Loader2 size={16} className="animate-spin shrink-0 text-blue-600" />
          <span>{locationStatus}</span>
        </div>
      )}

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* ── 2-COLUMN SPLIT LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN (40% / 5-span) : Presensi Action Cards ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Aksi Presensi Hari Ini */}
          <div className="card-bento space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <span>Presensi Hari Ini</span>
              </h3>
              {!isWeekend && (
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                  Masuk: {jamMasuk}
                </span>
              )}
            </div>

            {isWeekend ? (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 text-center space-y-1">
                <h4 className="text-amber-900 font-bold text-sm">Akhir Pekan (Libur Magang)</h4>
                <p className="text-amber-800/80 text-xs">Tidak ada jadwal pengisian presensi di hari Sabtu & Minggu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Check In Box */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">Check-In Masuk</span>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
                      {today?.jam_masuk ? today.jam_masuk : '--:--:--'}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {today ? `Status: ${today.status}` : 'Belum check-in hari ini.'}
                    </p>
                    {today?.jam_masuk && (
                      <button
                        onClick={() =>
                          setMapModal({
                            open: true,
                            lat: today.latitude_masuk || -6.958742,
                            lng: today.longitude_masuk || 110.285810,
                            title: 'Lokasi Check-In',
                            timestamp: `Jam Masuk: ${today.jam_masuk}`,
                          })
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1 rounded-lg font-bold transition-all"
                      >
                        <MapPin size={12} className="text-amber-700" />
                        <span>Peta Check-In</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleCheckIn}
                    disabled={!!today || actionLoading}
                    className="w-full btn-poli-primary disabled:bg-slate-200 disabled:text-slate-400 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 font-extrabold shadow-xs"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                    <span>{today ? 'Sudah Check-In' : 'Check-In Sekarang'}</span>
                  </button>
                </div>

                {/* Check Out Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">Check-Out Pulang</span>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
                      {today?.jam_pulang ? today.jam_pulang : '--:--:--'}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {today?.jam_pulang ? 'Check-out selesai.' : 'Belum check-out.'}
                    </p>
                    {today?.jam_pulang && (
                      <button
                        onClick={() =>
                          setMapModal({
                            open: true,
                            lat: today.latitude_pulang || -6.958742,
                            lng: today.longitude_pulang || 110.285810,
                            title: 'Lokasi Check-Out',
                            timestamp: `Jam Pulang: ${today.jam_pulang}`,
                          })
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-900 bg-emerald-200/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg font-bold transition-all"
                      >
                        <MapPin size={12} className="text-emerald-700" />
                        <span>Peta Check-Out</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleCheckOut}
                    disabled={!today || !!today?.jam_pulang || actionLoading}
                    className="w-full btn-poli-primary disabled:bg-slate-200 disabled:text-slate-400 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 font-extrabold shadow-xs"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                    <span>{today?.jam_pulang ? 'Sudah Check-Out' : 'Check-Out Sekarang'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card Info Ketentuan Presensi */}
          <div className="card-bento bg-slate-50 border border-slate-200/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <Info size={15} className="text-amber-600" />
              <span>Ketentuan Presensi GPS</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Presensi mencatat titik lokasi GPS perangkat Anda. Pastikan browser diizinkan mengakses lokasi saat menekan tombol check-in atau check-out.
            </p>
          </div>

        </div>

        {/* ── RIGHT COLUMN (60% / 7-span) : Attendance History Table ── */}
        <div className="lg:col-span-7">
          <div className="card-bento overflow-hidden p-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Riwayat Presensi Saya</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Daftar rekaman presensi harian</p>
              </div>
              <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                {riwayat.length} Hari
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Masuk</th>
                    <th className="px-4 py-3">Pulang</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Peta GPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayat.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-xs italic">
                        Belum ada riwayat presensi.
                      </td>
                    </tr>
                  ) : (
                    riwayat.map((item, idx) => (
                      <tr key={item.presensi_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">{item.jam_masuk || '-'}</td>
                        <td className="px-4 py-3 font-mono text-slate-700">{item.jam_pulang || '-'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.jam_masuk ? (
                              <button
                                onClick={() =>
                                  setMapModal({
                                    open: true,
                                    lat: item.latitude_masuk || -6.958742,
                                    lng: item.longitude_masuk || 110.285810,
                                    title: `Lokasi Check-In`,
                                    timestamp: `${item.tanggal} | ${item.jam_masuk}`,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md hover:bg-amber-200 transition-colors"
                              >
                                <MapPin size={10} className="text-amber-700" />
                                <span>In</span>
                              </button>
                            ) : null}
                            {item.jam_pulang ? (
                              <button
                                onClick={() =>
                                  setMapModal({
                                    open: true,
                                    lat: item.latitude_pulang || -6.958742,
                                    lng: item.longitude_pulang || 110.285810,
                                    title: `Lokasi Check-Out`,
                                    timestamp: `${item.tanggal} | ${item.jam_pulang}`,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md hover:bg-emerald-200 transition-colors"
                              >
                                <MapPin size={10} className="text-emerald-700" />
                                <span>Out</span>
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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

export default PresensiPage;
