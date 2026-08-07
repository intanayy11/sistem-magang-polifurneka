import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import DovetailDivider from '../../components/DovetailDivider';
import useScrollLock from '../../hooks/useScrollLock';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  X,
  ChevronRight,
  History,
  FileText
} from 'lucide-react';

const RiwayatPresensiPage = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [filteredRiwayat, setFilteredRiwayat] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPresensi, setSelectedPresensi] = useState(null);

  useScrollLock(!!selectedPresensi);

  // Map Modal
  const [mapModal, setMapModal] = useState({ open: false, lat: null, lng: null, title: '', timestamp: '', alamat: '' });

  const fetchRiwayat = async () => {
    try {
      const res = await api.get('/presensi/riwayat');
      if (res.data.status === 'success') {
        const dataList = res.data.data.riwayat || [];
        setRiwayat(dataList);
        setFilteredRiwayat(dataList);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat presensi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRiwayat(riwayat);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = riwayat.filter((item) => {
        const tglStr = new Date(item.tanggal).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).toLowerCase();
        const statusStr = (item.status || '').toLowerCase();
        const lokasiStr = (item.lokasi_tipe || '').toLowerCase();
        const ketStr = (item.keterangan_luar || '').toLowerCase();
        return (
          tglStr.includes(q) ||
          statusStr.includes(q) ||
          lokasiStr.includes(q) ||
          ketStr.includes(q)
        );
      });
      setFilteredRiwayat(filtered);
    }
  }, [searchQuery, riwayat]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A800] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History size={20} className="text-amber-600" />
            <span>Riwayat Presensi Magang</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Daftar lengkap seluruh rekam jejak presensi harian Anda selama periode magang.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
          <Calendar size={14} className="text-amber-600" />
          <span>Total {riwayat.length} Hari Presensi</span>
        </div>
      </div>

      <DovetailDivider className="my-2" />

      {/* Tabel Riwayat */}
      <div className="card-bento overflow-hidden p-0">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Data Rekaman Presensi</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Klik pada baris tabel untuk melihat rincian detail presensi.</p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari tanggal / status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Jam Masuk</th>
                <th className="px-5 py-3.5">Jam Pulang</th>
                <th className="px-5 py-3.5">Tipe Lokasi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Peta GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRiwayat.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                    Tidak ada rekaman riwayat presensi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRiwayat.map((item, idx) => (
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

      {/* Modal Detail Presensi */}
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

      {/* Map Modal */}
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

export default RiwayatPresensiPage;
