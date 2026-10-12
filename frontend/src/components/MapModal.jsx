import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Loader2, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Titik Pusat dan Radius Resmi Polifurneka Kendal (Kawasan Industri Kendal)
const POLIFURNEKA_CENTER = [-6.929428, 110.256226];
const POLIFURNEKA_RADIUS = 500; // 500 meter

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const MapModal = ({ isOpen, onClose, latitude, longitude, title, timestamp, alamat }) => {
  useScrollLock(isOpen);
  const [displayAddress, setDisplayAddress] = useState(alamat || null);
  const [fetchingAddress, setFetchingAddress] = useState(false);

  useEffect(() => {
    setDisplayAddress(alamat || null);
    if (!alamat && isOpen && latitude && longitude) {
      setFetchingAddress(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            setDisplayAddress(data.display_name);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setFetchingAddress(false));
    }
  }, [isOpen, latitude, longitude, alamat]);

  if (!isOpen || !latitude || !longitude) return null;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const distance = getDistanceMeters(lat, lng, POLIFURNEKA_CENTER[0], POLIFURNEKA_CENTER[1]);
  const isInsideRadius = distance <= POLIFURNEKA_RADIUS;
  const distanceFormatted = distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance} meter`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 relative overflow-hidden">

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{title || 'Lokasi Presensi'}</h3>
              {timestamp && <p className="text-[11px] text-slate-500 font-mono">{timestamp}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Radius & Geofence Badge */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          isInsideRadius 
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/90 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-1.5 font-semibold">
            {isInsideRadius ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            )}
            <span>{isInsideRadius ? 'Di Dalam Radius Polifurneka' : 'Di Luar Radius Polifurneka (Tugas Luar / Ditolak)'}</span>
          </div>
          <span className="font-mono font-bold text-[11px] bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
            Jarak: {distanceFormatted}
          </span>
        </div>

        <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
          <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Lingkaran Radius 500m Kampus Polifurneka */}
            <Circle
              center={POLIFURNEKA_CENTER}
              radius={POLIFURNEKA_RADIUS}
              pathOptions={{
                color: '#d97706',
                fillColor: '#f59e0b',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <div className="flex items-center gap-1 font-bold text-amber-900">
                    <Building2 size={13} />
                    <span>Area Kampus Polifurneka</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Radius presensi yang diizinkan: 500 meter</p>
                </div>
              </Popup>
            </Circle>

            {/* Titik Pusat Kampus Polifurneka */}
            <Circle
              center={POLIFURNEKA_CENTER}
              radius={18}
              pathOptions={{
                color: '#b45309',
                fillColor: '#b45309',
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div className="text-xs font-semibold text-slate-800">
                  Kampus Polifurneka (Titik Pusat)
                </div>
              </Popup>
            </Circle>

            {/* Titik Lokasi Presensi Mahasiswa */}
            <Marker position={[lat, lng]}>
              <Popup>
                <div className="text-xs">
                  <strong className="block font-bold">{title}</strong>
                  <span className="font-mono text-[11px] text-slate-600">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                  <div className="mt-1 font-semibold text-[11px] text-amber-800">
                    Jarak ke Kampus: {distanceFormatted}
                  </div>
                  {displayAddress && <p className="text-[10px] text-slate-700 mt-1">{displayAddress}</p>}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {fetchingAddress ? (
          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-amber-700 shrink-0" />
            <span>Mendapatkan alamat fisik dari titik lokasi GPS...</span>
          </div>
        ) : displayAddress ? (
          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-0.5">
            <div className="font-bold uppercase tracking-wider text-[10px] text-amber-900 flex items-center gap-1">
              <MapPin size={12} className="text-amber-700" />
              <span>Alamat Terdeteksi GPS:</span>
            </div>
            <p className="font-medium text-slate-800 leading-relaxed pl-4">{displayAddress}</p>
          </div>
        ) : null}

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
          <span>Latitude: <strong>{lat.toFixed(6)}</strong></span>
          <span>Longitude: <strong>{lng.toFixed(6)}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default MapModal;

