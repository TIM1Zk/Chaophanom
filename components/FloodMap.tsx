'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface FloodMapProps {
  reports: Array<{
    id: string;
    location_name: string;
    water_depth: string;
    latitude: number;
    longitude: number;
  }>;
  onSelectLocation: (lat: number, lng: number) => void;
}

// Component สำหรับจับ Event เมื่อผู้ใช้แตะหรือคลิกบนแผนที่
function LocationPicker({ onSelectLocation }: { onSelectLocation: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function FloodMap({ reports, onSelectLocation }: FloodMapProps) {
  // พิกัดใจกลางอำเภอพนมสารคาม
  const phanomCenter: [number, number] = [13.7455, 101.3480];

  return (
    <MapContainer center={phanomCenter} zoom={14} className="h-full w-full rounded-2xl z-0">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* เปิดใช้งานตัวจับคลิกบนแผนที่ */}
      <LocationPicker onSelectLocation={onSelectLocation} />

      {/* หมุดสถานีวัดระดับน้ำคลองท่าลาด (สีน้ำเงิน) */}
      <CircleMarker
        center={[13.7460, 101.3502]}
        pathOptions={{ fillColor: '#3b82f6', color: '#ffffff', weight: 2, fillOpacity: 0.9 }}
        radius={10}
      >
        <Popup>
          <div className="p-1 text-slate-900 font-sans">
            <h4 className="font-bold text-sm">สถานีคลองท่าลาด (สะพานพนมสารคาม)</h4>
            <p className="text-xs text-slate-600 mt-1">ระดับน้ำ: 5.85 ม.รทก.</p>
            <p className="text-xs text-amber-600 font-semibold">สถานะ: เฝ้าระวัง (ตลิ่ง 6.20 ม.)</p>
          </div>
        </Popup>
      </CircleMarker>

      {/* หมุดรายงานน้ำท่วมที่ดึงมาจาก Supabase (สีแดง) */}
      {reports.map((report) => (
        <CircleMarker
          key={report.id}
          center={[report.latitude, report.longitude]}
          pathOptions={{ fillColor: '#ef4444', color: '#ffffff', weight: 2, fillOpacity: 0.9 }}
          radius={8}
        >
          <Popup>
            <div className="p-1 text-slate-900 font-sans">
              <h4 className="font-bold text-sm text-rose-600">น้ำท่วมขัง: {report.location_name}</h4>
              <p className="text-xs text-slate-600 mt-1">ระดับน้ำ: {report.water_depth}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}