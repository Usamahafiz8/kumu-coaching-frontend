'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InfluencerDashboard from '../../../components/InfluencerDashboard';

export default function InfluencerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // You could add additional authentication checks here
    // For example, checking if the user is actually an influencer
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <InfluencerDashboard />
      </div>
    </div>
  );
}
