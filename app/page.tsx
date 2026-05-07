'use client';

import dynamic from 'next/dynamic';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">🌍 Click Map → Get Weather</h1>
        <p className="text-center text-sm mt-1">Click anywhere on the map</p>
      </header>
      <div className="flex-1">
        <MapWrapper />
      </div>
    </div>
  );
}