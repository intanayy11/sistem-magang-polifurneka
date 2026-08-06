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

  // Presensi Kegiatan Luar State
  const [showLuarModal, setShowLuarModal] = useState(false);
  const [keteranganLuar, setKeteranganLuar] = useState('');
  const [luarAksi, setLuarAksi] = useState('masuk');
  const [luarError, setLuarError] = useState('');
  const [liburInfo, setLiburInfo] = useState(null);

  useScrollLock(!!selectedPresensi || showLuarModal);

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
    const now = new Date();
    if (now.getHours() >= 11) {
      setAlert({
        type: 'warning',
        message: 'Batas waktu presensi masuk hari ini telah berakhir (maksimal pukul 11:00 WIB).',
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
      setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal melakukan presensi pulang' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePresensiLuarSubmit = async (e) => {
    e.preventDefault();
    setLuarError('');
    if (!keteranganLuar.trim()) {
      setLuarError('Keterangan kegiatan luar wajib diisi.');
      return;
    }

    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    if (luarAksi === 'masuk') {
      if (currentHour >= 11) {
        setLuarError('Batas waktu presensi masuk hari ini telah berakhir (maksimal pukul 11:00 WIB).');
        return;
      }
    } else {
      const isFridayNow = new Date().getDay() === 5;
      const minHour = 16;
      const minMinute = isFridayNow ? 30 : 0;

      if (currentHour < minHour || (currentHour === minHour && currentMinute < minMinute)) {
        const jamTarget = isFridayNow ? '16.30 WIB' : '16.00 WIB';
        setLuarError(`Belum waktunya presensi pulang. Presensi pulang baru dapat dilakukan mulai pukul ${jamTarget}.`);
        return;
      }
      if (currentHour >= 22) {
        setLuarError('Batas waktu presensi pulang hari ini telah berakhir (maksimal pukul 22:00 WIB).');
        return;
      }
    }

    setActionLoading(true);
    setAlert(null);
    const { latitude, longitude } = await getCoordinates();
    const endpoint = luarAksi === 'masuk' ? '/presensi/check-in' : '/presensi/check-out';

    try {
      const res = await api.post(endpoint, {
        latitude,
        longitude,
        lokasi_tipe: 'luar',
        keterangan_luar: keteranganLuar.trim(),
      });
      setShowLuarModal(false);
      setKeteranganLuar('');
      fetchPresensi();

      const rec = res.data.data;
      const isMasuk = luarAksi === 'masuk';
      setMapModal({
        open: true,
        lat: latitude || (isMasuk ? rec?.latitude_masuk : rec?.latitude_pulang) || -6.929428,
        lng: longitude || (isMasuk ? rec?.longitude_masuk : rec?.longitude_pulang) || 110.256226,
        title: `Presensi ${isMasuk ? 'Masuk' : 'Pulang'} (Kegiatan Luar) Berhasil! 🎉`,
        timestamp: `${rec?.tanggal || new Date().toLocaleDateString('id-ID')} | ${isMasuk ? rec?.jam_masuk : rec?.jam_pulang}`,
        alamat: isMasuk ? rec?.alamat_masuk : rec?.alamat_pulang,
      });
    } catch (err) {
      setLuarError(err.response?.data?.message || 'Gagal melakukan presensi kegiatan luar.');
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
  const jamMasukTeks = '07.30 - 11.00 WIB';
  const jamPulangTeks = isFriday ? '16.30 - 22.00 WIB' : '16.00 - 22.00 WIB';

  return (
    <div className="space-y-6">
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

      <div className="card-bento space-y-4">
        <div className="pb-3 border-b border-slate-100 space-y-1">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <span>Presensi Hari Ini</span>
          </h3>
          {!isLibur && (
            <p className="text-xs text-slate-500 font-medium pl-6">
              Jadwal presensi magang hari <strong className="text-slate-700 font-semibold">{hariTeks}</strong> adalah <span className="font-mono text-slate-800 font-bold">Masuk ({jamMasukTeks}) – Pulang ({jamPulangTeks})</span>
            </p>
          )}
        </div>

        {isLibur ? (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 text-center space-y-1">
            <h4 className="text-amber-900 font-bold text-sm">
              {liburInfo?.kategori === 'nasional' ? 'Hari Libur Nasional' : 'Akhir Pekan (Libur Magang)'}
            </h4>
            <p className="text-amber-800/90 text-xs font-bold">{liburInfo?.keterangan || 'Akhir Pekan (Sabtu/Minggu)'}</p>
            <p className="text-amber-800/70 text-[11px] pt-1">Tidak ada pengisian presensi di hari libur.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleCheckIn}
                    disabled={!!today || actionLoading}
                    className="btn-poli-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-extrabold shadow-xs"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                    <span>{today ? 'Sudah Presensi' : 'Masuk (Instansi)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setLuarAksi('masuk');
                      setKeteranganLuar('');
                      setLuarError('');
                      setShowLuarModal(true);
                    }}
                    disabled={!!today || actionLoading}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-bold shadow-2xs cursor-pointer"
                  >
                    <MapPin size={14} className="text-amber-700 shrink-0" />
                    <span>Masuk (Kegiatan Luar)</span>
                  </button>
                </div>
              </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleCheckOut}
                    disabled={!today || !!today?.jam_pulang || actionLoading}
                    className="btn-poli-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-extrabold shadow-xs"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                    <span>{today?.jam_pulang ? 'Sudah Pulang' : 'Pulang (Instansi)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setLuarAksi('pulang');
                      setKeteranganLuar('');
                      setLuarError('');
                      setShowLuarModal(true);
                    }}
                    disabled={!today || !!today?.jam_pulang || actionLoading}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-bold shadow-2xs cursor-pointer"
                  >
                    <MapPin size={14} className="text-amber-700 shrink-0" />
                    <span>Pulang (Kegiatan Luar)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

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
                <th className="px-5 py-3.5">Tipe Lokasi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Peta GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs italic">
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
                    <td className="px-5 py-3.5 font-semibold text-slate-800 group-hover:text-amber-900 transition-colors whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">{item.jam_masuk || '-'}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">{item.jam_pulang || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        item.lokasi_tipe === 'luar'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.lokasi_tipe || 'instansi'}
                      </span>
                      {item.lokasi_tipe === 'luar' && item.keterangan_luar && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5 max-w-[140px] truncate" title={item.keterangan_luar}>
                          {item.keterangan_luar}
                        </p>
                      )}
                    </td>
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
                                alamat: item.alamat_masuk || null,
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
                                alamat: item.alamat_pulang || null,
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

      {selectedPresensi && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 relative">
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

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-600">Status Kehadiran:</span>
                <StatusBadge status={selectedPresensi.status} />
              </div>

              {selectedPresensi.lokasi_tipe === 'luar' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                    <MapPin size={13} className="text-amber-700" />
                    <span>Kegiatan Luar Instansi</span>
                  </div>
                  <p className="text-slate-800 font-medium text-xs pt-1 leading-relaxed">
                    {selectedPresensi.keterangan_luar || '-'}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-amber-900 text-[10px]">Presensi Masuk</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPresensi.jam_masuk || '--:--:--'}</span>
                </div>
                {selectedPresensi.jam_masuk && (
                  <div className="pt-2 border-t border-amber-200/60 text-[11px] space-y-1">
                    {selectedPresensi.alamat_masuk && (
                      <p className="text-slate-800 font-medium leading-relaxed">
                        <strong className="text-amber-900 font-bold">Alamat:</strong> {selectedPresensi.alamat_masuk}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
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
                            alamat: p.alamat_masuk || null,
                          });
                        }}
                        className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline"
                      >
                        <MapPin size={12} className="text-amber-700" />
                        <span>Buka Peta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-emerald-900 text-[10px]">Presensi Pulang</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPresensi.jam_pulang || '--:--:--'}</span>
                </div>
                {selectedPresensi.jam_pulang && (
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] space-y-1">
                    {selectedPresensi.alamat_pulang && (
                      <p className="text-slate-800 font-medium leading-relaxed">
                        <strong className="text-emerald-900 font-bold">Alamat:</strong> {selectedPresensi.alamat_pulang}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
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
                            alamat: p.alamat_pulang || null,
                          });
                        }}
                        className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:underline"
                      >
                        <MapPin size={12} className="text-emerald-700" />
                        <span>Buka Peta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

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

      {showLuarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin size={18} className="text-amber-600" />
                <span>Presensi Kegiatan Luar</span>
              </h3>
              <button onClick={() => setShowLuarModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {luarError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
                {luarError}
              </div>
            )}

            <form onSubmit={handlePresensiLuarSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipe Presensi
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setLuarAksi('masuk')}
                    disabled={!!today}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      luarAksi === 'masuk'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    Presensi Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setLuarAksi('pulang')}
                    disabled={!today || !!today?.jam_pulang}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      luarAksi === 'pulang'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    Presensi Pulang
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Keterangan Kegiatan Luar <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  value={keteranganLuar}
                  onChange={(e) => setKeteranganLuar(e.target.value)}
                  placeholder="Contoh: Perjalanan dinas survei lokasi supplier kayu di Boja, Kendal..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLuarModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-poli-primary px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                  <span>Kirim Presensi Luar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
