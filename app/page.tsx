'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import MapWrapper from '../components/MapWrapper';
import { Waves, Gauge, AlertTriangle, Send, Phone, MapPin, Navigation } from 'lucide-react';

interface Report {
  id: string;
  location_name: string;
  water_depth: string;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [locationName, setLocationName] = useState('');
  const [waterDepth, setWaterDepth] = useState('10-15 ซม. (ท่วมผิวทาง รถเล็กผ่านได้)');
  
  const [lat, setLat] = useState('13.7455');
  const [lng, setLng] = useState('101.3480');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'default' | 'gps' | 'map'>('default');

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('flood_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && !error) setReports(data);
    };

    fetchReports();

    const channel = supabase
      .channel('public:flood_reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flood_reports' }, (payload: any) => {
        setReports((prev) => [payload.new as Report, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('อุปกรณ์ของคุณไม่รองรับการระบุตำแหน่ง GPS');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(5));
        setLng(position.coords.longitude.toFixed(5));
        setLocationStatus('gps');
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('กรุณาอนุญาตให้เข้าถึงตำแหน่งที่ตั้ง (Location) บนเบราว์เซอร์');
        } else {
          alert('ไม่สามารถดึงตำแหน่ง GPS ได้ในขณะนี้');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapSelect = (selectedLat: number, selectedLng: number) => {
    setLat(selectedLat.toFixed(5));
    setLng(selectedLng.toFixed(5));
    setLocationStatus('map');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('flood_reports').insert({
      location_name: locationName,
      water_depth: waterDepth,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });

    setIsSubmitting(false);
    if (!error) {
      setLocationName('');
      setLocationStatus('default');
      alert('บันทึกรายงานเรียบร้อยแล้ว หมุดจะปรากฏบนแผนที่ทันที');
    } else {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ชาวพนม Flood Watch</h1>
              <p className="text-xs text-slate-400">ศูนย์ข้อมูลน้ำและแจ้งเหตุน้ำท่วมเพื่อพี่น้องชาวพนมสารคาม</p>
            </div>
          </div>
          <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            คลองท่าลาด: เฝ้าระวัง
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400 font-medium">ระดับน้ำคลองท่าลาด (สะพานพนม)</span>
                <div className="text-3xl font-bold mt-1 text-amber-400">5.85 <span className="text-sm font-normal text-slate-400">ม.รทก.</span></div>
              </div>
              <Gauge className="w-6 h-6 text-amber-400" />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>ตลิ่ง 6.20 ม.</span>
                <span className="text-amber-400 font-medium">ห่างจากตลิ่ง 0.35 ม.</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[88%]" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400 font-medium">อ่างเก็บน้ำคลองระบม (ต้นน้ำ)</span>
                <div className="text-3xl font-bold mt-1 text-blue-400">82.4% <span className="text-sm font-normal text-slate-400">ความจุ</span></div>
              </div>
              <Waves className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs text-slate-400 mt-4">การระบายน้ำอยู่ในเกณฑ์ควบคุม ยังไม่มีน้ำล้นสปิลเวย์</p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400 font-medium">รายงานจุดน้ำท่วมจากชาวพนม</span>
                <div className="text-3xl font-bold mt-1 text-rose-400">{reports.length} <span className="text-sm font-normal text-slate-400">จุด</span></div>
              </div>
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <p className="text-xs text-slate-400 mt-4">อัปเดต Realtime จากประชาชนในพื้นที่</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold">แผนที่สถานะน้ำท่วมพนมสารคาม</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> สถานีวัดน้ำ</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> จุดน้ำท่วมขัง</span>
              </div>
            </div>
            <MapWrapper reports={reports} onSelectLocation={handleMapSelect} />
            <p className="text-xs text-slate-400 mt-2">* สามารถแตะบนแผนที่ หรือใช้ปุ่มดึง GPS จากโทรศัพท์เพื่อระบุตำแหน่ง</p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2 text-blue-400 mb-1">
                <Send className="w-4 h-4" /> ชาวพนมร่วมใจ แจ้งจุดน้ำท่วม
              </h2>
              <p className="text-xs text-slate-400 mb-4">ระบุจุดน้ำท่วมเพื่อแจ้งเตือนคนในพื้นที่แบบเรียลไทม์</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="w-full py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'กำลังค้นหาตำแหน่ง GPS...' : '📍 ดึงตำแหน่งปัจจุบันของฉัน (GPS)'}
                  </button>
                  
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>
                      {locationStatus === 'gps' && 'ใช้พิกัดจาก GPS เครื่องของคุณแล้ว'}
                      {locationStatus === 'map' && 'ใช้พิกัดจากการจิ้มเลือกบนแผนที่'}
                      {locationStatus === 'default' && 'พิกัดเริ่มต้น: ใจกลางอำเภอพนมสารคาม'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">สถานที่ / ซอย / จุดสังเกต</label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="เช่น ซอยเทศบาล 4 หรือ หน้าวัดพนมพนาวาส"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ระดับความสูงน้ำ</label>
                  <select
                    value={waterDepth}
                    onChange={(e) => setWaterDepth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="10-15 ซม. (ท่วมผิวทาง รถเล็กผ่านได้)">10-15 ซม. (ท่วมผิวทาง รถเล็กผ่านได้)</option>
                    <option value="20-30 ซม. (ระดับฟุตบาท รถควรระวัง)">20-30 ซม. (ระดับฟุตบาท รถควรระวัง)</option>
                    <option value="สูงกว่า 40 ซม. (รถเล็กห้ามผ่าน)">สูงกว่า 40 ซม. (รถเล็กห้ามผ่าน)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium rounded-lg text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {isSubmitting ? 'กำลังบันทึก...' : 'ส่งรายงานน้ำท่วม'}
                </button>
              </form>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/60 text-xs space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-400" /> เบอร์กู้ภัย/ฉุกเฉิน พนมสารคาม:
              </span>
              <div className="flex justify-between text-slate-300">
                <span>เทศบาลตำบลพนมสารคาม:</span>
                <span className="text-blue-400 font-mono font-medium">038-551-444</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>หน่วยกู้ภัยพนมสารคาม:</span>
                <span className="text-rose-400 font-mono font-medium">038-551-555</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}