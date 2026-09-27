'use client';

import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('./FloodMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
      กำลังโหลดแผนที่ อ.พนมสารคาม...
    </div>
  ),
});

export default function MapWrapper(props: any) {
  return (
    <div className="h-[480px] w-full">
      <FloodMap {...props} />
    </div>
  );
}