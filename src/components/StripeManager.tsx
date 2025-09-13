'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Key, 
  Settings, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { StripeConfig, StripeKeys } from '../types/stripe'

interface StripeManagerProps {
  token: string
}

export default function StripeManager({ token }: StripeManagerProps) {
  const [config, setConfig] = useState<StripeConfig | null>(null)
  const [keys, setKeys] = useState<StripeKeys | null>(null)
  const [loading, setLoading] = useState(true)
  const [showKeys, setShowKeys] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [formData, setFormData] = useState<Partial<StripeKeys>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStripeConfig()
  }, [])

  const fetchStripeConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/config`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setConfig(data.data)
      }
    } catch (error) {
      console.error('Error fetching Stripe config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateKeys = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/stripe/keys`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        setShowUpdateModal(false)
        setFormData({})
        fetchStripeConfig()
        alert('Stripe keys updated successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update Stripe keys')
      }
    } catch (error) {
      console.error('Error updating Stripe keys:', error)
      alert('Failed to update Stripe keys')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/stripe/test-connection`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        alert('Stripe connection test successful!')
      } else {
        const error = await response.json()
        alert(error.message || 'Stripe connection test failed')
      }
    } catch (error) {
      console.error('Error testing Stripe connection:', error)
      alert('Failed to test Stripe connection')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Stripe Configuration</h2>
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Test Connection
          </button>
          <button
            onClick={() => setShowUpdateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Settings className="h-5 w-5 mr-2" />
            Update Keys
          </button>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mode</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {config?.mode || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Key className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Publishable Key</p>
              <p className="text-lg font-bold text-gray-900">
                {config?.publishableKey ? 'Configured' : 'Not Set'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currency</p>
              <p className="text-lg font-bold text-gray-900 uppercase">
                {config?.currency || 'USD'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            {config?.publishableKey ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-bold text-gray-900">
                {config?.publishableKey ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configuration Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publishable Key
              </label>
              <div className="relative">
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={config?.publishableKey || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(!showKeys)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showKeys ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <div className={`px-3 py-2 border rounded-md ${
                config?.mode === 'live' 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <div className="flex items-center">
                  {config?.mode === 'live' ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {config?.mode === 'live' ? 'Live Mode' : 'Test Mode'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={config?.currency || 'USD'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Status
              </label>
              <div className={`px-3 py-2 border rounded-md ${
                config?.publishableKey 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {config?.publishableKey ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {config?.publishableKey ? 'Fully Configured' : 'Not Configured'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Security Notes</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Never share your Stripe secret keys publicly</li>
                <li>Use test keys during development and live keys only in production</li>
                <li>Keep your webhook secret secure and never expose it in client-side code</li>
                <li>Regularly rotate your API keys for security</li>
                <li>Monitor your Stripe dashboard for any suspicious activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Update Keys Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stripe Configuration</h3>
              <form onSubmit={handleUpdateKeys} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={formData.secretKey || ''}
                    onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                    placeholder="sk_test_... or sk_live_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishable Key
                  </label>
                  <input
                    type="text"
                    value={formData.publishableKey || ''}
                    onChange={(e) => setFormData({ ...formData, publishableKey: e.target.value })}
                    placeholder="pk_test_... or pk_live_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    value={formData.webhookSecret || ''}
                    onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                    placeholder="whsec_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode
                    </label>
                    <select
                      value={formData.mode || 'test'}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'test' | 'live' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="test">Test Mode</option>
                      <option value="live">Live Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={formData.currency || 'usd'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      placeholder="usd, eur, gbp, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
