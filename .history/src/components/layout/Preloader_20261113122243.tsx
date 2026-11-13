'use client';
import dynamic from 'next/dynamic';

const GimbalCamera = dynamic(() => import('@/components/ui/GimbalCamera'), { ssr: false });

<div className="h-[70vh]">
  <GimbalCamera />
</div>