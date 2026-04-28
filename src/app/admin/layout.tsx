import { Suspense } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500 animate-pulse">Loading dashboard...</div>}>
      {children}
    </Suspense>
  );
}
