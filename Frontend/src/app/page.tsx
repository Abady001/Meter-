'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('mp-auth-token');
    if (!token) {
      router.push('/login');
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) return null;
  return <AppShell />;
}
