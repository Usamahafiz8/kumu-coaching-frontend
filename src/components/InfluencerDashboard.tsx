'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Code,
  Calendar,
  Download,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  Influencer,
  PromoCode,
  Commission,
  InfluencerStats,
  CreateWithdrawalRequestDto,
} from '../types/influencer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function InfluencerDashboard() {
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [stats, setStats] = useState<InfluencerStats | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'promo-codes' | 'commissions' | 'withdrawals'>('overview');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState<CreateWithdrawalRequestDto>({
    amount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchInfluencerData();
  }, []);

  const fetchInfluencerData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch influencer profile
      const profileResponse = await fetch(`${API_BASE_URL}/influencer/my-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) throw new Error('Failed to fetch influencer profile');

      const profileData = await profileResponse.json();
      setInfluencer(profileData);

      // Fetch influencer stats
      const statsResponse = await fetch(`${API_BASE_URL}/influencer/my-dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) throw new Error('Failed to fetch influencer stats');

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch promo codes
      const promoCodesResponse = await fetch(`${API_BASE_URL}/influencer/my/promo-codes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (promoCodesResponse.ok) {
        const promoCodesData = await promoCodesResponse.json();
        setPromoCodes(promoCodesData);
      }

      // Fetch commissions
      const commissionsResponse = await fetch(`${API_BASE_URL}/influencer/my/commissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (commissionsResponse.ok) {
        const commissionsData = await commissionsResponse.json();
        setCommissions(commissionsData.commissions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch influencer data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/influencer/my/withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(withdrawalForm),
      });

      if (!response.ok) throw new Error('Failed to create withdrawal request');

      setShowWithdrawalModal(false);
      setWithdrawalForm({ amount: 0, notes: '' });
      fetchInfluencerData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create withdrawal request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!influencer || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You are not registered as an influencer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {influencer.user.firstName} {influencer.user.lastName}
            </h1>
            <p className="text-gray-600">Influencer Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${influencer.availableBalance.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Available Balance</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalCommissionAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Earnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.influencer.successfulReferrals}
              </div>
              <div className="text-sm text-gray-500">Successful Referrals</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.influencer.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Code className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {promoCodes.length}
              </div>
              <div className="text-sm text-gray-500">Active Promo Codes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('promo-codes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'promo-codes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Promo Codes ({promoCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'commissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Commissions ({commissions.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'withdrawals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Withdrawals
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Commissions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Commissions</h3>
            </div>
            <div className="p-6">
              {commissions.slice(0, 5).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    {getStatusIcon(commission.status)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {commission.subscription.plan.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${commission.commissionAmount.toFixed(2)}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                      {commission.status}
                    </span>
                  </div>
                </div>
              ))}
              {commissions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No commissions yet</p>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Commission Rate:</span>
                <span className="font-medium">{influencer.commissionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Referrals:</span>
                <span className="font-medium">{influencer.totalReferrals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Successful Referrals:</span>
                <span className="font-medium">{influencer.successfulReferrals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Conversion Rate:</span>
                <span className="font-medium">{influencer.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Withdrawn:</span>
                <span className="font-medium">${influencer.totalWithdrawn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(influencer.status)}`}>
                  {influencer.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promo-codes' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Promo Codes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promoCodes.map((promoCode) => (
                  <tr key={promoCode.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{promoCode.code}</div>
                      {promoCode.description && (
                        <div className="text-sm text-gray-500">{promoCode.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promoCode.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promoCode.type === 'percentage' ? `${promoCode.value}%` : `$${promoCode.value}`}
                      {promoCode.maxDiscount && (
                        <div className="text-xs text-gray-500">Max: ${promoCode.maxDiscount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promoCode.usedCount} / {promoCode.usageLimit === 0 ? '∞' : promoCode.usageLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promoCode.status)}`}>
                        {promoCode.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {promoCodes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No promo codes created yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Commission History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {commission.subscription.user.firstName} {commission.subscription.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{commission.subscription.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.subscription.plan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${commission.subscriptionAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${commission.commissionAmount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{commission.commissionRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                        {commission.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {commissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No commissions yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Withdrawal Request</h3>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                disabled={influencer.availableBalance < 10}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                Request Withdrawal
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${influencer.availableBalance.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Available Balance</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${influencer.totalWithdrawn.toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">Total Withdrawn</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${stats.totalCommissionAmount.toFixed(2)}
                </div>
                <div className="text-sm text-purple-600">Total Earnings</div>
              </div>
            </div>
            {influencer.availableBalance < 10 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Minimum withdrawal amount is $10. Current available balance: ${influencer.availableBalance.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Withdrawal</h3>
              <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input
                    type="number"
                    min="10"
                    max={influencer.availableBalance}
                    step="0.01"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Available: ${influencer.availableBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea
                    value={withdrawalForm.notes}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Request Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
