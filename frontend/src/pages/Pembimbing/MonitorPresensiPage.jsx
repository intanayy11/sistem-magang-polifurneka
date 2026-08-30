import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import MapModal from '../../components/MapModal';
import { MapPin, Users, Clock, Calendar, CheckCircle2, AlertCircle, Search, Filter, RefreshCw, X } from 'lucide-react';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

const MonitorPresensiPage = () => {
  const [pesertaList, setPesertaList] = useState([]);
  const [pesertaDataMap, setPesertaDataMap] = useState({}); // { [userId]: [riwayatItems] }
  const [selectedPesertaId, setSelectedPesertaId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPesertaId, searchQuery]);

  const [selectedPresensi, setSelectedPresensi] = useState(null);
  const [mapModal, setMapModal] = useState({ open: false, lat: null, lng: null, title: '', timestamp: '' });

  // Get current date string in WIB local format YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const resPeserta = await api.get('/pembimbing/peserta');
      if (resPeserta.data.status === 'success') {
        const list = resPeserta.data.data;
        setPesertaList(list);

        // Fetch presensi history for all assigned interns concurrently
        const dataMap = {};
        await Promise.all(
          list.map(async (p) => {
            try {
              const resRiwayat = await api.get(`/presensi/peserta/${p.user_id}`);
              if (resRiwayat.data.status === 'success') {
                dataMap[p.user_id] = resRiwayat.data.data;
              }
            } catch (err) {
              dataMap[p.user_id] = [];
            }
          })
        );
        setPesertaDataMap(dataMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute Today's Overview for All Interns
  const todayRecords = pesertaList.map((p) => {
    const history = pesertaDataMap[p.user_id] || [];
    const todayRecord = history.find(r => r.tanggal && r.tanggal.startsWith(todayStr));
    return {
      peserta: p,
      record: todayRecord || null,
      status: todayRecord ? todayRecord.status : 'Belum Absen'
    };
  });

  const totalSudahAbsen = todayRecords.filter(r => r.record && r.record.jam_masuk).length;
  const totalBelumAbsen = todayRecords.length - totalSudahAbsen;

  // Filtered History List for Bottom Section
  const selectedPesertaObj = pesertaList.find(p => String(p.user_id) === String(selectedPesertaId));

  // Flatten or selected history items
  let displayHistory = [];
  if (selectedPesertaId === 'all') {
    pesertaList.forEach(p => {
      const items = pesertaDataMap[p.user_id] || [];
      items.forEach(item => {
        displayHistory.push({ ...item, namaPeserta: p.nama, nimPeserta: p.nim_nis });
      });
    });
    // Sort descending by date
    displayHistory.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } else {
    const items = pesertaDataMap[selectedPesertaId] || [];
    displayHistory = items.map(item => ({
      ...item,
      namaPeserta: selectedPesertaObj?.nama,
      nimPeserta: selectedPesertaObj?.nim_nis
    }));
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayHistory = displayHistory.filter(item =>
      (item.namaPeserta && item.namaPeserta.toLowerCase().includes(q)) ||
      (item.nimPeserta && item.nimPeserta.toLowerCase().includes(q)) ||
      (item.tanggal && item.tanggal.toLowerCase().includes(q))
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Title Card */}
      <div className="card-clean p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin size={22} className="text-[#E8A800]" />
            <span>Monitor Presensi & Lokasi GPS</span>
          </h2>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Calendar size={14} className="text-amber-600" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
              title="Refresh data presensi"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-amber-600" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ── BAGIAN 1 (ATAS): MONITORING PRESENSI HARI INI (SELURUH ANAK BIMBINGAN) ── */}
      <div className="space-y-4">
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-bento flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Anak Bimbingan</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{pesertaList.length} Peserta</div>
            </div>
          </div>

          <div className="card-bento flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sudah Absen Hari Ini</div>
              <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{totalSudahAbsen} Peserta</div>
            </div>
          </div>

          <div className="card-bento flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-800 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Belum Absen Hari Ini</div>
              <div className="text-xl font-extrabold text-rose-800 mt-0.5">{totalBelumAbsen} Peserta</div>
            </div>
          </div>
        </div>

        {/* Tabel Monitoring Presensi Hari Ini */}
        <div className="card-clean overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Status Presensi Anak Bimbingan Hari Ini</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">No</th>
                  <th className="px-5 py-3.5">Nama Peserta</th>
                  <th className="px-5 py-3.5">Jam Masuk</th>
                  <th className="px-5 py-3.5">Jam Pulang</th>
                  <th className="px-5 py-3.5">Status Hari Ini</th>
                  <th className="px-5 py-3.5 text-center">Peta GPS Hari Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                      Memuat data presensi hari ini...
                    </td>
                  </tr>
                ) : todayRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                      Belum ada peserta bimbingan yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  todayRecords.map((item, idx) => (
                    <tr
                      key={item.peserta.user_id}
                      onClick={() => {
                        setSelectedPresensi({
                          namaPeserta: item.peserta.nama,
                          nimPeserta: item.peserta.nim_nis,
                          tanggal: todayStr,
                          jam_masuk: item.record?.jam_masuk || null,
                          jam_pulang: item.record?.jam_pulang || null,
                          status: item.record ? item.record.status : 'Belum Absen',
                          latitude_masuk: item.record?.latitude_masuk,
                          longitude_masuk: item.record?.longitude_masuk,
                          latitude_pulang: item.record?.latitude_pulang,
                          longitude_pulang: item.record?.longitude_pulang,
                          alamat_masuk: item.record?.alamat_masuk || null,
                          alamat_pulang: item.record?.alamat_pulang || null,
                          lokasi_tipe: item.record?.lokasi_tipe || 'instansi',
                          keterangan_luar: item.record?.keterangan_luar || null,
                        });
                      }}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors group"
                      title="Klik untuk melihat detail presensi peserta ini"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors">{item.peserta.nama}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.peserta.nim_nis || '-'}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">
                        {item.record?.jam_masuk || '-'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">
                        {item.record?.jam_pulang || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.record ? (
                            <StatusBadge status={item.record.status} />
                          ) : (
                            <span className="text-rose-700 font-bold text-xs">Belum Absen</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.record?.jam_masuk ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMapModal({
                                  open: true,
                                  lat: item.record.latitude_masuk || -6.958742,
                                  lng: item.record.longitude_masuk || 110.285810,
                                  title: `Presensi Masuk · ${item.peserta.nama}`,
                                  timestamp: `${new Date().toLocaleDateString('id-ID')} | ${item.record.jam_masuk}`,
                                  alamat: item.record.alamat_masuk || null,
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                              title="Lihat lokasi presensi masuk di peta"
                            >
                              <MapPin size={12} className="text-amber-600" />
                              <span>Peta Masuk</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs italic">-</span>
                          )}

                          {item.record?.jam_pulang ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMapModal({
                                  open: true,
                                  lat: item.record.latitude_pulang || -6.958742,
                                  lng: item.record.longitude_pulang || 110.285810,
                                  title: `Presensi Pulang · ${item.peserta.nama}`,
                                  timestamp: `${new Date().toLocaleDateString('id-ID')} | ${item.record.jam_pulang}`,
                                  alamat: item.record.alamat_pulang || null,
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                              title="Lihat lokasi presensi pulang di peta"
                            >
                              <MapPin size={12} className="text-amber-600" />
                              <span>Peta Pulang</span>
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


      {/* ── BAGIAN 2 (BAWAH): RIWAYAT PRESENSI HISTORIS & FILTER PER PESERTA ── */}
      <div className="card-clean overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Riwayat Presensi Historis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter dan lihat rekaman tanggal presensi terdahulu per peserta magang.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari nama / tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
              />
            </div>

            {/* Filter Peserta Selector Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400 shrink-0" />
              <select
                value={selectedPesertaId}
                onChange={(e) => setSelectedPesertaId(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Semua Peserta Bimbingan</option>
                {pesertaList.map(p => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.nama} {p.nim_nis ? `(${p.nim_nis})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Histori */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No</th>
                <th className="px-5 py-3.5">Peserta</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Jam Masuk</th>
                <th className="px-5 py-3.5">Jam Pulang</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Peta GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Memuat riwayat historis...
                  </td>
                </tr>
              ) : displayHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-xs italic">
                    Tidak ada rekaman riwayat presensi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                displayHistory
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((item, idx) => (
                  <tr
                    key={`${item.presensi_id}-${idx}`}
                    onClick={() => {
                      setSelectedPresensi({
                        namaPeserta: item.namaPeserta,
                        nimPeserta: item.nimPeserta,
                        tanggal: item.tanggal,
                        jam_masuk: item.jam_masuk,
                        jam_pulang: item.jam_pulang,
                        status: item.status,
                        latitude_masuk: item.latitude_masuk,
                        longitude_masuk: item.longitude_masuk,
                        latitude_pulang: item.latitude_pulang,
                        longitude_pulang: item.longitude_pulang,
                        alamat_masuk: item.alamat_masuk || null,
                        alamat_pulang: item.alamat_pulang || null,
                        lokasi_tipe: item.lokasi_tipe || 'instansi',
                        keterangan_luar: item.keterangan_luar || null,
                      });
                    }}
                    className="hover:bg-amber-50/60 cursor-pointer transition-colors group"
                    title="Klik untuk melihat detail presensi ini"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 group-hover:text-amber-900 transition-colors">{item.namaPeserta}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.nimPeserta || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">{item.jam_masuk || '-'}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">{item.jam_pulang || '-'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.jam_masuk ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapModal({
                                open: true,
                                lat: item.latitude_masuk || -6.958742,
                                lng: item.longitude_masuk || 110.285810,
                                title: `Presensi Masuk · ${item.namaPeserta}`,
                                timestamp: `${new Date(item.tanggal).toLocaleDateString('id-ID')} | ${item.jam_masuk}`,
                                alamat: item.alamat_masuk || null,
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-2 py-1 rounded-lg transition-colors border border-slate-200"
                            title="Lihat lokasi presensi masuk di peta"
                          >
                            <MapPin size={11} className="text-amber-600" />
                            <span>Peta In</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}

                        {item.jam_pulang ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapModal({
                                open: true,
                                lat: item.latitude_pulang || -6.958742,
                                lng: item.longitude_pulang || 110.285810,
                                title: `Presensi Pulang · ${item.namaPeserta}`,
                                timestamp: `${new Date(item.tanggal).toLocaleDateString('id-ID')} | ${item.jam_pulang}`,
                                alamat: item.alamat_pulang || null,
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-2 py-1 rounded-lg transition-colors border border-slate-200"
                            title="Lihat lokasi presensi pulang di peta"
                          >
                            <MapPin size={11} className="text-amber-600" />
                            <span>Peta Out</span>
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
          totalItems={displayHistory.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="rekaman"
        />
      </div>

      {/* ── DETAIL PRESENSI MODAL (SERUPA PESERTA) ── */}
      {selectedPresensi && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
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
              {/* Peserta Info Header */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <div className="font-extrabold text-slate-900 text-sm">{selectedPresensi.namaPeserta}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {selectedPresensi.nimPeserta ? `NIM/NIS: ${selectedPresensi.nimPeserta}` : 'Peserta Bimbingan Magang'}
                </div>
              </div>

              {/* Status Kehadiran */}

              {/* Presensi Masuk Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-amber-900 text-[10px]">Presensi Masuk</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPresensi.jam_masuk || '--:--:--'}</span>
                </div>
                {selectedPresensi.jam_masuk ? (
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
                            title: `Presensi Masuk · ${p.namaPeserta}`,
                            timestamp: `${new Date(p.tanggal).toLocaleDateString('id-ID')} | ${p.jam_masuk}`,
                            alamat: p.alamat_masuk || null,
                          });
                        }}
                        className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline cursor-pointer"
                      >
                        <MapPin size={12} className="text-amber-700" />
                        <span>Buka Peta GPS</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-amber-200/60 text-[11px] text-slate-400 italic">
                    Belum melakukan presensi masuk
                  </div>
                )}
              </div>

              {/* Presensi Pulang Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-emerald-900 text-[10px]">Presensi Pulang</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPresensi.jam_pulang || '--:--:--'}</span>
                </div>
                {selectedPresensi.jam_pulang ? (
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
                            title: `Presensi Pulang · ${p.namaPeserta}`,
                            timestamp: `${new Date(p.tanggal).toLocaleDateString('id-ID')} | ${p.jam_pulang}`,
                            alamat: p.alamat_pulang || null,
                          });
                        }}
                        className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:underline cursor-pointer"
                      >
                        <MapPin size={12} className="text-emerald-700" />
                        <span>Buka Peta GPS</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-slate-400 italic">
                    Belum melakukan presensi pulang
                  </div>
                )}
              </div>
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

export default MonitorPresensiPage;
