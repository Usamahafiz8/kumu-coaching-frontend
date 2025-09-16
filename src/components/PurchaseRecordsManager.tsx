'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  CreditCard,
  User,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface PurchaseRecord {
  id: string;
  userId: string;
  planId: string;
  promoCodeId?: string;
  stripeSessionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeProductId: string;
  originalPrice: number;
  finalPrice: number;
  discountAmount?: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  userAgent?: string;
  ipAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
  };
  promoCode?: {
    id: string;
    code: string;
  };
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-blue-100 text-blue-800',
};

const STATUS_ICONS = {
  pending: Clock,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
  refunded: AlertCircle,
};

export default function PurchaseRecordsManager() {
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPurchaseRecords();
  }, []);

  const fetchPurchaseRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/purchase-records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch purchase records');

      const data = await response.json();
      setPurchaseRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = purchaseRecords.filter(record => {
    const matchesSearch = 
      record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.stripeSessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const recordDate = new Date(record.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return recordDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return recordDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (record: PurchaseRecord) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'User', 'Email', 'Plan', 'Original Price', 'Final Price', 
      'Discount', 'Status', 'Payment Method', 'Date', 'Stripe Session ID'
    ];
    
    const csvData = filteredRecords.map(record => [
      record.id,
      `${record.user?.firstName} ${record.user?.lastName}`,
      record.user?.email || '',
      record.plan?.name || '',
      record.originalPrice,
      record.finalPrice,
      record.discountAmount || 0,
      record.status,
      'Stripe',
      new Date(record.createdAt).toLocaleDateString(),
      record.stripeSessionId
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalRevenue = () => {
    return filteredRecords
      .filter(record => record.status === 'completed')
      .reduce((sum, record) => sum + record.finalPrice, 0);
  };

  const getTotalDiscounts = () => {
    return filteredRecords
      .filter(record => record.status === 'completed')
      .reduce((sum, record) => sum + (record.discountAmount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Purchase Records</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold text-gray-900">{filteredRecords.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${getTotalRevenue().toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Discounts</p>
              <p className="text-3xl font-bold text-gray-900">${getTotalDiscounts().toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredRecords.length > 0 
                  ? Math.round((filteredRecords.filter(r => r.status === 'completed').length / filteredRecords.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const StatusIcon = STATUS_ICONS[record.status];
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.user?.firstName} {record.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{record.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.plan?.name}</div>
                      <div className="text-sm text-gray-500">${record.plan?.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${record.finalPrice} {record.currency}
                      </div>
                      {record.discountAmount && record.discountAmount > 0 && (
                        <div className="text-sm text-green-600">
                          -${record.discountAmount} discount
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[record.status]}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No purchase records found.</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Purchase Record Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Name:</strong> {selectedRecord.user?.firstName} {selectedRecord.user?.lastName}</p>
                    <p><strong>Email:</strong> {selectedRecord.user?.email}</p>
                    <p><strong>User ID:</strong> {selectedRecord.userId}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Purchase Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Plan:</strong> {selectedRecord.plan?.name}</p>
                    <p><strong>Original Price:</strong> ${selectedRecord.originalPrice}</p>
                    <p><strong>Final Price:</strong> ${selectedRecord.finalPrice}</p>
                    {selectedRecord.discountAmount && (
                      <p><strong>Discount:</strong> ${selectedRecord.discountAmount}</p>
                    )}
                    <p><strong>Currency:</strong> {selectedRecord.currency}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedRecord.status]}`}>
                        {selectedRecord.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stripe Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Session ID:</strong> {selectedRecord.stripeSessionId}</p>
                    <p><strong>Customer ID:</strong> {selectedRecord.stripeCustomerId}</p>
                    <p><strong>Price ID:</strong> {selectedRecord.stripePriceId}</p>
                    <p><strong>Product ID:</strong> {selectedRecord.stripeProductId}</p>
                    {selectedRecord.stripeSubscriptionId && (
                      <p><strong>Subscription ID:</strong> {selectedRecord.stripeSubscriptionId}</p>
                    )}
                    {selectedRecord.stripePaymentIntentId && (
                      <p><strong>Payment Intent ID:</strong> {selectedRecord.stripePaymentIntentId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Created:</strong> {new Date(selectedRecord.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(selectedRecord.updatedAt).toLocaleString()}</p>
                    {selectedRecord.ipAddress && (
                      <p><strong>IP Address:</strong> {selectedRecord.ipAddress}</p>
                    )}
                    {selectedRecord.notes && (
                      <p><strong>Notes:</strong> {selectedRecord.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
