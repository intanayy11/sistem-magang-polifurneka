import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import DovetailDivider from '../../components/DovetailDivider';
import useScrollLock from '../../hooks/useScrollLock';
import Pagination from '../../components/Pagination';
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

const ITEMS_PER_PAGE = 10;

const RiwayatPresensiPage = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [filteredRiwayat, setFilteredRiwayat] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);
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
        return (
          tglStr.includes(q) ||
          statusStr.includes(q)
        );
      });
      setFilteredRiwayat(filtered);
    }
  }, [searchQuery, riwayat]);

  return (
    <div className="space-y-4">
      {/* Tabel Riwayat */}
      <div className="card-bento overflow-hidden p-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <History size={22} className="text-[#E8A800]" />
                <span>Riwayat Presensi Magang</span>
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Daftar lengkap seluruh rekam jejak presensi harian Anda selama periode magang. Klik pada baris tabel untuk melihat rincian detail presensi.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto shrink-0">
              <Calendar size={14} className="text-amber-600" />
              <span>Total {riwayat.length} Hari Presensi</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
            {/* Search Box */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari tanggal / status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#E8A800] focus:ring-2 focus:ring-amber-200 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Bersihkan pencarian"
                >
                  <X size={12} />
                </button>
              )}
            </div>
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
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Peta GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-4 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 w-16 bg-slate-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredRiwayat.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                    Tidak ada rekaman riwayat presensi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRiwayat
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((item, idx) => (
                  <tr
                    key={item.presensi_id}
                    onClick={() => setSelectedPresensi(item)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                    title="Klik untuk melihat detail presensi"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 group-hover:text-amber-900 transition-colors whitespace-nowrap">
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

        {/* Footer Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRiwayat.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="hari presensi"
        />
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
