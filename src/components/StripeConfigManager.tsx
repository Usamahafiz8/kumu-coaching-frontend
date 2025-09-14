'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface StripeConfig {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  currency: string;
  mode: string;
  accountId?: string;
  isConfigured: boolean;
}

export default function StripeConfigManager() {
  const [config, setConfig] = useState<StripeConfig>({
    currency: 'usd',
    mode: 'test',
    isConfigured: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stripe/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch Stripe configuration');

      const data = await response.json();
      setConfig(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stripe/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Failed to save Stripe configuration');

      setSuccess('Stripe configuration saved successfully!');
      await fetchConfig(); // Refresh the config
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stripe/test-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult({ success: true, data: data.data });
        setSuccess('Stripe connection test successful!');
      } else {
        setTestResult({ success: false, error: data.message });
        setError(`Connection test failed: ${data.message}`);
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof StripeConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
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
        <h2 className="text-2xl font-bold text-gray-900">Stripe Configuration</h2>
        <div className="flex items-center gap-2">
          {config.isConfigured ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Configured
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.secretKey || ''}
                  onChange={(e) => handleInputChange('secretKey', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="sk_test_... or sk_live_..."
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Your Stripe secret key (starts with sk_test_ or sk_live_)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publishable Key
              </label>
              <input
                type="text"
                value={config.publishableKey || ''}
                onChange={(e) => handleInputChange('publishableKey', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="pk_test_... or pk_live_..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Your Stripe publishable key (starts with pk_test_ or pk_live_)
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret
            </label>
            <div className="relative">
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.webhookSecret || ''}
                onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="whsec_..."
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Webhook endpoint secret for verifying Stripe webhooks
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                value={config.mode}
                onChange={(e) => handleInputChange('mode', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Use test mode for development, live mode for production
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={config.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="cad">CAD</option>
                <option value="aud">AUD</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Default currency for payments
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account ID
              </label>
              <input
                type="text"
                value={config.accountId || ''}
                onChange={(e) => handleInputChange('accountId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="acct_..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Your Stripe account ID (optional)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !config.secretKey}
            className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <TestTube className="h-4 w-4" />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            Connection Test Result
          </h4>
          <pre className={`mt-2 text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Security Note</h4>
        <p className="text-sm text-blue-700">
          Secret keys and webhook secrets are encrypted and stored securely in the database. 
          Only administrators can view and modify these settings.
        </p>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Where to Find Your Stripe Keys
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Step 1: Access Stripe Dashboard</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://dashboard.stripe.com</a></li>
              <li>Sign in to your Stripe account</li>
              <li>If you don't have an account, create one at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">stripe.com</a></li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Step 2: Get Your API Keys</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>In the Stripe Dashboard, click on <strong>"Developers"</strong> in the left sidebar</li>
              <li>Click on <strong>"API keys"</strong></li>
              <li>You'll see two keys:</li>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Publishable key</strong> (starts with pk_test_ or pk_live_) - This is safe to use in frontend code</li>
                <li><strong>Secret key</strong> (starts with sk_test_ or sk_live_) - Keep this secret, never expose in frontend</li>
              </ul>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Step 3: Set Up Webhooks (Optional but Recommended)</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>In the Stripe Dashboard, go to <strong>"Developers" → "Webhooks"</strong></li>
              <li>Click <strong>"Add endpoint"</strong></li>
              <li>Set the endpoint URL to: <code className="bg-gray-100 px-2 py-1 rounded text-xs">http://yourdomain.com/stripe/webhook</code></li>
              <li>Select the events you want to listen for (recommended: payment_intent.succeeded, customer.subscription.created, etc.)</li>
              <li>Click <strong>"Add endpoint"</strong></li>
              <li>Click on the created webhook to get the <strong>Signing secret</strong> (starts with whsec_)</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Step 4: Test vs Live Mode</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">TEST</span>
                <div>
                  <strong>Test Mode:</strong> Use test keys (pk_test_ and sk_test_) for development and testing. No real money is charged.
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mr-2">LIVE</span>
                <div>
                  <strong>Live Mode:</strong> Use live keys (pk_live_ and sk_live_) for production. Real money will be charged.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Quick Test Keys (For Development Only)</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p>For testing purposes, you can use these test keys:</p>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="space-y-1">
                  <div><strong>Publishable Key:</strong> <code className="bg-gray-200 px-1 rounded text-xs">pk_test_51234567890abcdef...</code></div>
                  <div><strong>Secret Key:</strong> <code className="bg-gray-200 px-1 rounded text-xs">sk_test_51234567890abcdef...</code></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Note: These are example keys. Use your actual test keys from your Stripe dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
