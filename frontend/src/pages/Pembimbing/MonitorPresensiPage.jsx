import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import { MapPin, Users, Clock } from 'lucide-react';

const MonitorPresensiPage = () => {
  const [pesertaList, setPesertaList] = useState([]);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingPeserta, setLoadingPeserta] = useState(true);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const [mapModal, setMapModal] = useState({ open: false, lat: null, lng: null, title: '', timestamp: '' });

  const fetchPeserta = async () => {
    try {
      const res = await api.get('/pembimbing/peserta');
      if (res.data.status === 'success') {
        setPesertaList(res.data.data);
        if (res.data.data.length > 0) {
          handleSelectPeserta(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPeserta(false);
    }
  };

  const handleSelectPeserta = async (peserta) => {
    setSelectedPeserta(peserta);
    setLoadingRiwayat(true);
    setRiwayat([]);
    try {
      const res = await api.get(`/presensi/peserta/${peserta.user_id}`);
      if (res.data.status === 'success') {
        setRiwayat(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  const totalHadir = riwayat.filter(r => r.status === 'Hadir' || r.status === 'Terlambat').length;
  const totalAlpha = riwayat.filter(r => r.status === 'Alpha').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Monitor Presensi & Lokasi GPS</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Pantau riwayat kehadiran dan titik lokasi check-in/check-out peserta magang bimbingan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar: Peserta List */}
        <div className="lg:col-span-1">
          <div className="card-clean overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Users size={16} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Peserta Bimbingan</h3>
            </div>
            {loadingPeserta ? (
              <div className="p-6 text-center text-xs text-slate-400">Memuat...</div>
            ) : pesertaList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Belum ada peserta bimbingan.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pesertaList.map((p) => (
                  <button
                    key={p.user_id}
                    onClick={() => handleSelectPeserta(p)}
                    className={`w-full text-left px-4 py-3.5 transition-all ${
                      selectedPeserta?.user_id === p.user_id
                        ? 'bg-amber-50 border-l-4 border-[#E8A800]'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 text-xs">{p.nama}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.nim_nis || '-'}</div>
                    {p.asal_instansi && (
                      <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1 py-0.5 inline-block mt-1">{p.asal_instansi}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main: Presensi Table */}
        <div className="lg:col-span-3">
          {selectedPeserta ? (
            <div className="space-y-4">
              {/* Selected Peserta Header */}
              <div className="card-clean p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedPeserta.nama}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedPeserta.email} {selectedPeserta.nim_nis ? `· NIM/NIS: ${selectedPeserta.nim_nis}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                    <div className="text-lg font-bold text-emerald-800">{totalHadir}</div>
                    <div className="text-[10px] text-emerald-600 uppercase font-semibold">Hadir</div>
                  </div>
                  <div className="text-center bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                    <div className="text-lg font-bold text-rose-800">{totalAlpha}</div>
                    <div className="text-[10px] text-rose-600 uppercase font-semibold">Alpha</div>
                  </div>
                  <div className="text-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <div className="text-lg font-bold text-slate-800">{riwayat.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total</div>
                  </div>
                </div>
              </div>

              {/* Presensi Table */}
              <div className="card-clean overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Riwayat Presensi & Lokasi GPS</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Jam Masuk</th>
                        <th className="px-4 py-3">Jam Pulang</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Lokasi GPS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingRiwayat ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-xs">
                            Memuat riwayat presensi...
                          </td>
                        </tr>
                      ) : riwayat.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-xs">
                            Belum ada riwayat presensi untuk peserta ini.
                          </td>
                        </tr>
                      ) : (
                        riwayat.map((item, idx) => (
                          <tr key={item.presensi_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-700">{item.jam_masuk || '-'}</td>
                            <td className="px-4 py-3 font-mono text-slate-700">{item.jam_pulang || '-'}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {item.latitude_masuk ? (
                                  <button
                                    onClick={() => setMapModal({
                                      open: true,
                                      lat: item.latitude_masuk,
                                      lng: item.longitude_masuk,
                                      title: `Check-In · ${selectedPeserta.nama}`,
                                      timestamp: `${new Date(item.tanggal).toLocaleDateString('id-ID')} | ${item.jam_masuk}`
                                    })}
                                    className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-1 rounded-lg hover:bg-amber-200 transition-colors"
                                    title="Lihat lokasi check-in di peta"
                                  >
                                    <MapPin size={11} />
                                    <span>In</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-300 text-[11px]">-</span>
                                )}
                                {item.latitude_pulang ? (
                                  <button
                                    onClick={() => setMapModal({
                                      open: true,
                                      lat: item.latitude_pulang,
                                      lng: item.longitude_pulang,
                                      title: `Check-Out · ${selectedPeserta.nama}`,
                                      timestamp: `${new Date(item.tanggal).toLocaleDateString('id-ID')} | ${item.jam_pulang}`
                                    })}
                                    className="inline-flex items-center gap-1 text-[11px] bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded-lg hover:bg-slate-300 transition-colors"
                                    title="Lihat lokasi check-out di peta"
                                  >
                                    <MapPin size={11} />
                                    <span>Out</span>
                                  </button>
                                ) : null}
                                {!item.latitude_masuk && !item.latitude_pulang && (
                                  <span className="text-[11px] text-slate-300 italic">Tidak ada GPS</span>
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
            </div>
          ) : (
            <div className="card-clean p-12 text-center">
              <MapPin size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Pilih peserta untuk melihat riwayat presensi & lokasi GPS</p>
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

export default MonitorPresensiPage;
