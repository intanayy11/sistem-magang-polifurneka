import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import { Clock, Calendar, AlertCircle, MapPin, Loader2 } from 'lucide-react';
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
      setAlert({ type: 'success', message: res.data.message + (latitude ? ` 📍 Lokasi GPS berhasil dicatat.` : ' (Lokasi tidak tersedia)') });
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
      setAlert({ type: 'success', message: res.data.message + (latitude ? ` 📍 Lokasi GPS berhasil dicatat.` : ' (Lokasi tidak tersedia)') });
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
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
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Presensi Harian Magang</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Lakukan check-in pada jam masuk dan check-out saat jam pulang. Lokasi GPS Anda akan dicatat otomatis.
        </p>
      </div>

      {locationStatus && (
        <div className="p-4 rounded-xl text-xs flex items-center gap-2.5 bg-blue-50 text-blue-800 border border-blue-200">
          <Loader2 size={16} className="animate-spin shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Check In / Check Out Action Card */}
      <div className="card-clean p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Aksi Presensi Hari Ini</h3>
            {!isWeekend && (
              <p className="text-xs text-slate-500 mt-0.5">
                Standar Jam Masuk: <span className="font-semibold text-slate-700">{jamMasuk}</span> | Standar Jam Pulang: <span className="font-semibold text-slate-700">{jamPulang}</span>
              </p>
            )}
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200/60">
            <Calendar size={14} className="text-amber-600" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* GPS Info Banner */}
        <div className="mb-5 flex items-center gap-2.5 text-[11px] text-emerald-800 bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-200/60">
          <MapPin size={14} className="text-emerald-600 shrink-0" />
          <span>
            <strong>Presensi berbasis GPS aktif.</strong> Lokasi Anda akan dicatat otomatis saat check-in & check-out. 
            Pastikan izin akses lokasi diberikan di browser.
          </span>
        </div>

        {isWeekend ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
            <h4 className="text-slate-800 font-bold text-lg mb-2">Hari Libur Magang</h4>
            <p className="text-slate-500 text-sm">Saat ini adalah hari libur (Sabtu/Minggu). Tidak ada jadwal pengisian presensi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Check In Box */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Presensi Masuk (Check-In)</span>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                  {today?.jam_masuk ? today.jam_masuk : '--:--:--'}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {today ? `Status: ${today.status}` : 'Belum melakukan check-in hari ini.'}
                </p>
                {/* Location link for check-in */}
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
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300/70 font-semibold transition-all shadow-2xs"
                  >
                    <MapPin size={12} className="text-amber-700" />
                    <span>Lihat Peta Lokasi Check-In</span>
                  </button>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleCheckIn}
                  disabled={!!today || actionLoading}
                  className="w-full btn-poli-primary disabled:bg-slate-200 disabled:text-slate-400 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                  <span>{today ? 'Sudah Check-In' : 'Check-In Sekarang'}</span>
                </button>
              </div>
            </div>

            {/* Check Out Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Presensi Pulang (Check-Out)</span>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                  {today?.jam_pulang ? today.jam_pulang : '--:--:--'}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {today?.jam_pulang ? 'Check-out tercatat.' : 'Belum melakukan check-out.'}
                </p>
                {/* Location link for check-out */}
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
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300/70 font-semibold transition-all shadow-2xs"
                  >
                    <MapPin size={12} className="text-emerald-700" />
                    <span>Lihat Peta Lokasi Check-Out</span>
                  </button>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleCheckOut}
                  disabled={!today || !!today?.jam_pulang || actionLoading}
                  className="w-full bg-[#2A180D] hover:bg-[#1C1008] text-amber-400 disabled:bg-slate-200 disabled:text-slate-400 font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs border border-amber-900/40"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} className="text-amber-400" />}
                  <span>{today?.jam_pulang ? 'Sudah Check-Out' : 'Check-Out Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Riwayat Presensi Saya</h3>
          <span className="text-xs text-slate-500 font-medium">Total: {riwayat.length} Catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Jam Masuk</th>
                <th className="px-5 py-3.5">Jam Pulang</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Lokasi GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat presensi.
                  </td>
                </tr>
              ) : (
                riwayat.map((item, idx) => (
                  <tr key={item.presensi_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{item.jam_masuk || '-'}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{item.jam_pulang || '-'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.jam_masuk ? (
                          <button
                            onClick={() =>
                              setMapModal({
                                open: true,
                                lat: item.latitude_masuk || -6.958742,
                                lng: item.longitude_masuk || 110.285810,
                                title: `Lokasi Check-In (${item.peserta?.nama || ''})`,
                                timestamp: `${new Date(item.tanggal).toLocaleDateString('id-ID')} | ${item.jam_masuk}`,
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-900 font-semibold px-2 py-1 rounded-lg hover:bg-amber-200 transition-colors border border-amber-300/60"
                            title="Lihat peta check-in"
                          >
                            <MapPin size={11} className="text-amber-700" />
                            <span>Peta In</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                        {item.jam_pulang ? (
                          <button
                            onClick={() =>
                              setMapModal({
                                open: true,
                                lat: item.latitude_pulang || -6.958742,
                                lng: item.longitude_pulang || 110.285810,
                                title: `Lokasi Check-Out (${item.peserta?.nama || ''})`,
                                timestamp: `${new Date(item.tanggal).toLocaleDateString('id-ID')} | ${item.jam_pulang}`,
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-900 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-300/60"
                            title="Lihat peta check-out"
                          >
                            <MapPin size={11} className="text-emerald-700" />
                            <span>Peta Out</span>
                          </button>
                        ) : (
                          item.jam_masuk ? <span className="text-slate-300 text-[11px]">-</span> : null
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
