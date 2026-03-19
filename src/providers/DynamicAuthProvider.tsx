'use client';

import dynamic from 'next/dynamic';

export const DynamicAuthProvider = dynamic(
  () => import('./AuthProvider').then((mod) => mod.AuthProvider),
  { ssr: false }
);
