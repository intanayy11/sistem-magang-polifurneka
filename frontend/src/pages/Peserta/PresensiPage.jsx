import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import DovetailDivider from '../../components/DovetailDivider';
import { Clock, Calendar, MapPin, Loader2, ChevronRight, AlertTriangle } from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import { isTodayWeekend, isMagangSelesai } from '../../utils/dateHelpers';

const PresensiPage = () => {
  const { user } = useAuth();
  const magangSelesai = isMagangSelesai(user);
  const [today, setToday] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [liburInfo, setLiburInfo] = useState(null);

  // Map Modal
  const [mapModal, setMapModal] = useState({ open: false, lat: null, lng: null, title: '', timestamp: '', alamat: '' });

  const fetchPresensi = async () => {
    try {
      const res = await api.get('/presensi/riwayat');
      if (res.data.status === 'success') {
        setToday(res.data.data.today);
        setRiwayat(res.data.data.riwayat);
        setLiburInfo(res.data.data.libur_info);
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
          type: 'error',
          message: 'Fitur Geolocation tidak didukung oleh browser Anda.',
        });
        resolve({ latitude: null, longitude: null });
        return;
      }
      setLocationStatus('Mendapatkan titik lokasi GPS akurat perangkat Anda...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('');
          const accuracy = Math.round(position.coords.accuracy || 0);
          if (accuracy > 150) {
            console.warn(`GPS accuracy low: ${accuracy}m`);
          }
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy,
          });
        },
        (error) => {
          setLocationStatus('');
          if (error.code === error.PERMISSION_DENIED) {
            setAlert({
              type: 'warning',
              message: 'Izin GPS ditolak. Silakan izinkan akses lokasi melalui ikon gembok 🔒 di sebelah URL browser atau aktifkan GPS pada pengaturan perangkat Anda.',
            });
          } else if (error.code === error.TIMEOUT) {
            setAlert({
              type: 'warning',
              message: 'Pencarian lokasi GPS waktu habis (timeout). Pastikan GPS perangkat Anda aktif dan coba lagi.',
            });
          }
          resolve({ latitude: null, longitude: null });
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    const now = new Date();
    if (now.getHours() >= 9) {
      setAlert({
        type: 'warning',
        message: 'Batas waktu presensi masuk hari ini telah berakhir (maksimal pukul 09:00 WIB).',
      });
      return;
    }

    setActionLoading(true);
    setAlert(null);
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-in', { latitude, longitude, lokasi_tipe: 'instansi' });
      fetchPresensi();
      const rec = res.data.data;
      setMapModal({
        open: true,
        lat: latitude || rec?.latitude_masuk || -6.929428,
        lng: longitude || rec?.longitude_masuk || 110.256226,
        title: 'Presensi Masuk Berhasil! 🎉',
        timestamp: `${rec?.tanggal || new Date().toLocaleDateString('id-ID')} | ${rec?.jam_masuk || ''}`,
        alamat: rec?.alamat_masuk || null,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.userFriendlyMessage || err.response?.data?.message || 'Gagal melakukan presensi masuk',
      });
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

    if (currentHour >= 22) {
      setAlert({
        type: 'warning',
        message: 'Batas waktu presensi pulang hari ini telah berakhir (maksimal pukul 22:00 WIB).',
      });
      return;
    }

    setActionLoading(true);
    const { latitude, longitude } = await getCoordinates();
    try {
      const res = await api.post('/presensi/check-out', { latitude, longitude, lokasi_tipe: 'instansi' });
      fetchPresensi();
      const rec = res.data.data;
      setMapModal({
        open: true,
        lat: latitude || rec?.latitude_pulang || -6.929428,
        lng: longitude || rec?.longitude_pulang || 110.256226,
        title: 'Presensi Pulang Berhasil! 🎉',
        timestamp: `${rec?.tanggal || new Date().toLocaleDateString('id-ID')} | ${rec?.jam_pulang || ''}`,
        alamat: rec?.alamat_pulang || null,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.userFriendlyMessage || err.response?.data?.message || 'Gagal melakukan presensi pulang',
      });
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
  const isLibur = liburInfo?.is_libur || isWeekend;
  const isFriday = new Date().getDay() === 5;
  const hariTeks = isFriday ? "Jum'at" : "Senin s.d. Kamis";
  const jamMasukTeks = '07.30 - 09.00 WIB';
  const jamPulangTeks = isFriday ? '16.30 - 22.00 WIB' : '16.00 - 22.00 WIB';

  return (
    <div className="space-y-4">
      {locationStatus && (
        <div className="p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 bg-blue-50 text-blue-900 border border-blue-200">
          <Loader2 size={16} className="animate-spin shrink-0 text-blue-600" />
          <span>{locationStatus}</span>
        </div>
      )}

      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      {/* Banner Masa Magang Selesai */}
      {magangSelesai && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-900">Masa magang Anda telah selesai.</p>
            <p className="text-xs text-amber-800 mt-0.5">Anda tidak dapat melakukan presensi baru. Data riwayat masih bisa dilihat di bawah.</p>
          </div>
        </div>
      )}

      <div className="card-bento space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Clock size={22} className="text-[#E8A800]" />
              <span>Presensi Harian Magang</span>
            </h2>
            {!isLibur && (
              <p className="text-xs text-slate-500 font-medium pl-8">
                Jadwal presensi magang hari <strong className="text-slate-700 font-semibold">{hariTeks}</strong> adalah <span className="font-mono text-slate-800 font-bold">Masuk ({jamMasukTeks}) – Pulang ({jamPulangTeks})</span>
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto shrink-0">
            <Calendar size={14} className="text-amber-600" />
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {isLibur || magangSelesai ? (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 text-center space-y-1">
            <h4 className="text-amber-900 font-bold text-sm">
              {magangSelesai ? 'Masa Magang Selesai' : liburInfo?.kategori === 'nasional' ? 'Hari Libur Nasional' : 'Akhir Pekan (Libur Magang)'}
            </h4>
            <p className="text-amber-800/90 text-xs font-bold">{magangSelesai ? 'Presensi tidak tersedia.' : (liburInfo?.keterangan || 'Akhir Pekan (Sabtu/Minggu)')}</p>
            <p className="text-amber-800/70 text-[11px] pt-1">{magangSelesai ? 'Anda masih bisa melihat riwayat presensi di bawah.' : 'Tidak ada pengisian presensi di hari libur.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Presensi Masuk Instansi */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between gap-4 shadow-2xs">
              <div>
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

                <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {today?.jam_masuk ? today.jam_masuk : '--:--:--'}
                </div>

                {today?.jam_masuk && (
                  <button
                    onClick={() =>
                      setMapModal({
                        open: true,
                        lat: today.latitude_masuk || -6.958742,
                        lng: today.longitude_masuk || 110.285810,
                        title: 'Lokasi Presensi Masuk',
                        timestamp: `Jam Masuk: ${today.jam_masuk}`,
                        alamat: today.alamat_masuk || null,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-3 py-1.5 rounded-xl font-bold transition-all"
                  >
                    <MapPin size={13} className="text-amber-600" />
                    <span>Lihat Peta Masuk</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleCheckIn}
                disabled={!!today || actionLoading}
                className="btn-poli-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-extrabold shadow-xs w-full"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                <span>{today ? 'Sudah Presensi Hari Ini' : 'Presensi Masuk'}</span>
              </button>
            </div>

            {/* Presensi Pulang Instansi */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between gap-4 shadow-2xs">
              <div>
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

                <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {today?.jam_pulang ? today.jam_pulang : '--:--:--'}
                </div>

                {today?.jam_pulang && (
                  <button
                    onClick={() =>
                      setMapModal({
                        open: true,
                        lat: today.latitude_pulang || -6.958742,
                        lng: today.longitude_pulang || 110.285810,
                        title: 'Lokasi Presensi Pulang',
                        timestamp: `Jam Pulang: ${today.jam_pulang}`,
                        alamat: today.alamat_pulang || null,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-3 py-1.5 rounded-xl font-bold transition-all"
                  >
                    <MapPin size={13} className="text-amber-600" />
                    <span>Lihat Peta Pulang</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleCheckOut}
                disabled={!today || !!today?.jam_pulang || actionLoading}
                className="btn-poli-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-extrabold shadow-xs w-full"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                <span>{today?.jam_pulang ? 'Sudah Pulang' : 'Presensi Pulang'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1 px-1">
        <Link
          to="/peserta/riwayat-presensi"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 hover:text-amber-700 hover:underline transition-all bg-amber-50/80 border border-amber-200/90 px-3.5 py-2 rounded-xl shadow-2xs group"
        >
          <span>Riwayat Presensi</span>
          <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform text-amber-600" />
        </Link>
      </div>

      <MapModal
        isOpen={mapModal.open}
        onClose={() => setMapModal({ ...mapModal, open: false })}
        latitude={mapModal.lat}
        longitude={mapModal.lng}
        title={mapModal.title}
        timestamp={mapModal.timestamp}
        alamat={mapModal.alamat}
      />
    </div>
  );
};

export default PresensiPage;
