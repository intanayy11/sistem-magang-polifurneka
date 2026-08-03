import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import DovetailDivider from '../../components/DovetailDivider';
import { Clock, Calendar, MapPin, Loader2, Info, X } from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import { isTodayWeekend } from '../../utils/dateHelpers';
import useScrollLock from '../../hooks/useScrollLock';

const PresensiPage = () => {
  const [today, setToday] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [selectedPresensi, setSelectedPresensi] = useState(null);

  useScrollLock(!!selectedPresensi);

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
        setAlert({
          type: 'warning',
          message: 'Fitur Geolocation tidak didukung oleh browser Anda.',
        });
        resolve({ latitude: null, longitude: null });
        return;
      }
      setLocationStatus('Mendapatkan titik lokasi GPS Anda...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('');
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        (error) => {
          setLocationStatus('');
          if (error.code === error.PERMISSION_DENIED) {
            setAlert({
              type: 'warning',
              message: 'Izin GPS ditolak. Silakan izinkan akses lokasi melalui ikon gembok 🔒 di sebelah URL browser atau aktifkan GPS pada pengaturan perangkat Anda.',
            });
          }
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
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal melakukan presensi masuk' });
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
      setAlert({ type: 'success', message: res.data.message + (latitude ? ` 📍 Lokasi GPS dicatat.` : '') });
      fetchPresensi();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal melakukan presensi pulang' });
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

  const isWeekend = isTodayWeekend();
  const isFriday = new Date().getDay() === 5;
  const hariTeks = isFriday ? "Jum'at" : "Senin s.d. Kamis";
  const jamMasuk = '07.30 WIB';
  const jamPulang = isFriday ? '16.30 WIB' : '16.00 WIB';

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Presensi Harian Magang</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Lakukan presensi masuk dan presensi pulang sesuai jam kerja. Klik baris tabel riwayat untuk melihat detail.
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

      {/* ── TOP SECTION: PRESENSI HARI INI CARD ── */}
      <div className="card-bento space-y-4">
        <div className="pb-3 border-b border-slate-100 space-y-1">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <span>Presensi Hari Ini</span>
          </h3>
          {!isWeekend && (
            <p className="text-xs text-slate-500 font-medium pl-6">
              Jadwal presensi magang hari <strong className="text-slate-700 font-semibold">{hariTeks}</strong> adalah <span className="font-mono text-slate-800 font-bold">{jamMasuk} – {jamPulang}</span>
            </p>
          )}
        </div>

        {isWeekend ? (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 text-center space-y-1">
            <h4 className="text-amber-900 font-bold text-sm">Akhir Pekan (Libur Magang)</h4>
            <p className="text-amber-800/80 text-xs">Tidak ada jadwal pengisian presensi di hari Sabtu & Minggu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Presensi Masuk Box (Left - Clean Surface) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between gap-4 shadow-2xs">
              <div>
                {/* Header Row: Title on Left, Status Badge on Right */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Presensi Masuk</span>
                  {today?.status ? (
                    <StatusBadge status={today.status} />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Belum Presensi
                    </span>
                  )}
                </div>

                {/* Time Display */}
                <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {today?.jam_masuk ? today.jam_masuk : '--:--:--'}
                </div>

                {/* Peta Button (Clean Neutral Style) */}
                {today?.jam_masuk && (
                  <button
                    onClick={() =>
                      setMapModal({
                        open: true,
                        lat: today.latitude_masuk || -6.958742,
                        lng: today.longitude_masuk || 110.285810,
                        title: 'Lokasi Presensi Masuk',
                        timestamp: `Jam Masuk: ${today.jam_masuk}`,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-3 py-1.5 rounded-xl font-bold transition-all"
                  >
                    <MapPin size={13} className="text-amber-600" />
                    <span>Lihat Peta Masuk</span>
                  </button>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckIn}
                disabled={!!today || actionLoading}
                className="w-full btn-poli-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 font-extrabold shadow-xs"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                <span>{today ? 'Sudah Presensi Masuk' : 'Presensi Masuk Sekarang'}</span>
              </button>
            </div>

            {/* Presensi Pulang Box (Right - Clean Surface) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between gap-4 shadow-2xs">
              <div>
                {/* Header Row: Title on Left, Status Badge on Right */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Presensi Pulang</span>
                  {today?.jam_pulang ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Selesai
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {today ? 'Belum Pulang' : 'Belum Presensi'}
                    </span>
                  )}
                </div>

                {/* Time Display */}
                <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {today?.jam_pulang ? today.jam_pulang : '--:--:--'}
                </div>

                {/* Peta Button (Clean Neutral Style) */}
                {today?.jam_pulang && (
                  <button
                    onClick={() =>
                      setMapModal({
                        open: true,
                        lat: today.latitude_pulang || -6.958742,
                        lng: today.longitude_pulang || 110.285810,
                        title: 'Lokasi Presensi Pulang',
                        timestamp: `Jam Pulang: ${today.jam_pulang}`,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-3 py-1.5 rounded-xl font-bold transition-all"
                  >
                    <MapPin size={13} className="text-amber-600" />
                    <span>Lihat Peta Pulang</span>
                  </button>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckOut}
                disabled={!today || !!today?.jam_pulang || actionLoading}
                className="w-full btn-poli-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 font-extrabold shadow-xs"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                <span>{today?.jam_pulang ? 'Sudah Presensi Pulang' : 'Presensi Pulang Sekarang'}</span>
              </button>
            </div>

          </div>
        )}

        {/* Ketentuan Presensi GPS inside the card */}
        <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-1 mt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Info size={14} className="text-amber-600 shrink-0" />
            <span>Ketentuan Presensi GPS</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Presensi mencatat titik lokasi GPS perangkat Anda. Pastikan browser diizinkan mengakses lokasi saat menekan tombol presensi masuk atau presensi pulang.
          </p>
        </div>
      </div>

      {/* ── BOTTOM SECTION: RIWAYAT PRESENSI SAYA (FULL WIDTH) ── */}
      <div className="card-bento overflow-hidden p-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Presensi Saya</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Daftar rekaman presensi harian (Klik baris untuk detail)</p>
          </div>
          <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
            {riwayat.length} Hari Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Masuk</th>
                <th className="px-5 py-3.5">Pulang</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Peta GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                    Belum ada riwayat presensi.
                  </td>
                </tr>
              ) : (
                riwayat.map((item, idx) => (
                  <tr
                    key={item.presensi_id}
                    onClick={() => setSelectedPresensi(item)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                    title="Klik untuk melihat detail presensi"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 group-hover:text-amber-900 transition-colors">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">{item.jam_masuk || '-'}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">{item.jam_pulang || '-'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.jam_masuk ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapModal({
                                open: true,
                                lat: item.latitude_masuk || -6.958742,
                                lng: item.longitude_masuk || 110.285810,
                                title: `Lokasi Presensi Masuk`,
                                timestamp: `${item.tanggal} | ${item.jam_masuk}`,
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/90 font-bold px-2.5 py-1 rounded-md transition-colors"
                          >
                            <MapPin size={11} className="text-amber-600" />
                            <span>In</span>
                          </button>
                        ) : null}
                        {item.jam_pulang ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapModal({
                                open: true,
                                lat: item.latitude_pulang || -6.958742,
                                lng: item.longitude_pulang || 110.285810,
                                title: `Lokasi Presensi Pulang`,
                                timestamp: `${item.tanggal} | ${item.jam_pulang}`,
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/90 font-bold px-2.5 py-1 rounded-md transition-colors"
                          >
                            <MapPin size={11} className="text-amber-600" />
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

      {/* Detail Presensi Modal */}
      {selectedPresensi && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  {new Date(selectedPresensi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => setSelectedPresensi(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-600">Status Kehadiran:</span>
                <StatusBadge status={selectedPresensi.status} />
              </div>

              {/* Presensi Masuk Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-amber-900 text-[10px]">Presensi Masuk</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPresensi.jam_masuk || '--:--:--'}</span>
                </div>
                {selectedPresensi.jam_masuk && (
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-[11px]">
                    <span className="text-amber-800/80">Koordinat GPS Masuk:</span>
                    <button
                      onClick={() => {
                        const p = selectedPresensi;
                        setSelectedPresensi(null);
                        setMapModal({
                          open: true,
                          lat: p.latitude_masuk || -6.958742,
                          lng: p.longitude_masuk || 110.285810,
                          title: 'Lokasi Presensi Masuk',
                          timestamp: `${p.tanggal} | ${p.jam_masuk}`,
                        });
                      }}
                      className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline"
                    >
                      <MapPin size={12} className="text-amber-700" />
                      <span>Buka Peta</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Presensi Pulang Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-emerald-900 text-[10px]">Presensi Pulang</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPresensi.jam_pulang || '--:--:--'}</span>
                </div>
                {selectedPresensi.jam_pulang && (
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-[11px]">
                    <span className="text-emerald-800/80">Koordinat GPS Pulang:</span>
                    <button
                      onClick={() => {
                        const p = selectedPresensi;
                        setSelectedPresensi(null);
                        setMapModal({
                          open: true,
                          lat: p.latitude_pulang || -6.958742,
                          lng: p.longitude_pulang || 110.285810,
                          title: 'Lokasi Presensi Pulang',
                          timestamp: `${p.tanggal} | ${p.jam_pulang}`,
                        });
                      }}
                      className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:underline"
                    >
                      <MapPin size={12} className="text-emerald-700" />
                      <span>Buka Peta</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPresensi(null)}
                className="btn-poli-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
