'use client';

import dynamic from 'next/dynamic';

const ClickableMap = dynamic(() => import('@/components/ClickableMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
});

export default function Home() {
  return <ClickableMap />;
}