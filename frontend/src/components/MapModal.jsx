import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Loader2 } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 relative overflow-hidden">
        {/* Modal Header */}
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

        {/* Map Container */}
        <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
          <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                <div className="text-xs">
                  <strong className="block font-bold">{title}</strong>
                  <span className="font-mono text-[11px] text-slate-600">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                  {displayAddress && <p className="text-[10px] text-slate-700 mt-1">{displayAddress}</p>}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Alamat Fisik Lengkap */}
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

        {/* Coordinate details */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
          <span>Latitude: <strong>{lat.toFixed(6)}</strong></span>
          <span>Longitude: <strong>{lng.toFixed(6)}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
