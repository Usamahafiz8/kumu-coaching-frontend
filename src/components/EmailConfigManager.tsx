'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Send,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface EmailConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  secure: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  enabled: boolean;
  isConfigured: boolean;
}

export default function EmailConfigManager() {
  const [config, setConfig] = useState<EmailConfig>({
    host: '',
    port: '587',
    user: '',
    pass: '',
    secure: 'false',
    fromEmail: '',
    fromName: '',
    replyTo: '',
    enabled: false,
    isConfigured: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/email/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch email configuration');

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
      const response = await fetch(`${API_BASE_URL}/admin/email/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Failed to save email configuration');

      setSuccess('Email configuration saved successfully!');
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
      const response = await fetch(`${API_BASE_URL}/admin/email/test-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult({ success: true, message: data.message });
        setSuccess('Email connection test successful!');
      } else {
        setTestResult({ success: false, message: data.message });
        setError(`Connection test failed: ${data.message}`);
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter an email address');
      return;
    }

    setSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/email/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ to: testEmail }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Test email sent successfully!');
      } else {
        setError(`Failed to send test email: ${data.message}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleInputChange = (field: keyof EmailConfig, value: string | boolean) => {
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
        <h2 className="text-2xl font-bold text-gray-900">Email Configuration</h2>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="smtp.gmail.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your SMTP server hostname
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => handleInputChange('port', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="587"
              />
              <p className="mt-1 text-sm text-gray-500">
                SMTP server port (587 for TLS, 465 for SSL)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={config.user}
                onChange={(e) => handleInputChange('user', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-email@gmail.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your SMTP username (usually your email)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.pass}
                  onChange={(e) => handleInputChange('pass', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your-app-password"
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
                Your SMTP password or app-specific password
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.secure === 'true'}
                onChange={(e) => handleInputChange('secure', e.target.checked ? 'true' : 'false')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Use secure connection (SSL/TLS)</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Enable for SSL (port 465) or TLS (port 587)
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={config.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="noreply@yourdomain.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email address that appears as sender
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={config.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kumu Coaching"
              />
              <p className="mt-1 text-sm text-gray-500">
                Name that appears as sender
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply To Email
              </label>
              <input
                type="email"
                value={config.replyTo}
                onChange={(e) => handleInputChange('replyTo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="support@yourdomain.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email address for replies (optional)
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Email Service</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Enable or disable the email service
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Email</h3>
          
          <div className="flex gap-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="test@example.com"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTest || !testEmail}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {sendingTest ? 'Sending...' : 'Send Test'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Send a test email to verify your configuration
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
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
          <p className={`mt-2 text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Popular SMTP Settings</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Gmail:</strong> smtp.gmail.com, Port: 587, Secure: TLS</p>
          <p><strong>Outlook:</strong> smtp-mail.outlook.com, Port: 587, Secure: TLS</p>
          <p><strong>Yahoo:</strong> smtp.mail.yahoo.com, Port: 587, Secure: TLS</p>
          <p><strong>Custom SMTP:</strong> Use your hosting provider's SMTP settings</p>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          How to Set Up Email Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Gmail Setup (Recommended for Testing)</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to your <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Account settings</a></li>
              <li>Click on <strong>"Security"</strong> in the left sidebar</li>
              <li>Enable <strong>"2-Step Verification"</strong> if not already enabled</li>
              <li>Go to <strong>"App passwords"</strong> and generate a new app password</li>
              <li>Use these settings:</li>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>SMTP Host:</strong> smtp.gmail.com</li>
                <li><strong>SMTP Port:</strong> 587</li>
                <li><strong>Username:</strong> your-gmail@gmail.com</li>
                <li><strong>Password:</strong> your-app-password (not your regular password)</li>
                <li><strong>Secure:</strong> TLS (checked)</li>
              </ul>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Outlook/Hotmail Setup</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to your <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Outlook account</a></li>
              <li>Click on the gear icon → <strong>"View all Outlook settings"</strong></li>
              <li>Go to <strong>"Mail" → "Sync email"</strong></li>
              <li>Enable <strong>"Let devices and apps use POP"</strong></li>
              <li>Use these settings:</li>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>SMTP Host:</strong> smtp-mail.outlook.com</li>
                <li><strong>SMTP Port:</strong> 587</li>
                <li><strong>Username:</strong> your-email@outlook.com</li>
                <li><strong>Password:</strong> your-outlook-password</li>
                <li><strong>Secure:</strong> TLS (checked)</li>
              </ul>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Yahoo Mail Setup</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to your <a href="https://mail.yahoo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Yahoo Mail</a></li>
              <li>Click on the gear icon → <strong>"More settings"</strong></li>
              <li>Go to <strong>"Mailboxes" → "Your email address"</strong></li>
              <li>Click <strong>"Generate app password"</strong></li>
              <li>Use these settings:</li>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>SMTP Host:</strong> smtp.mail.yahoo.com</li>
                <li><strong>SMTP Port:</strong> 587</li>
                <li><strong>Username:</strong> your-email@yahoo.com</li>
                <li><strong>Password:</strong> your-app-password</li>
                <li><strong>Secure:</strong> TLS (checked)</li>
              </ul>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Custom SMTP (Hosting Provider)</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Contact your hosting provider for SMTP settings</li>
              <li>Common hosting providers:</li>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>cPanel Hosting:</strong> Usually mail.yourdomain.com, Port 587 or 465</li>
                <li><strong>Bluehost:</strong> mail.yourdomain.com, Port 465 (SSL) or 587 (TLS)</li>
                <li><strong>GoDaddy:</strong> smtpout.secureserver.net, Port 465 (SSL) or 587 (TLS)</li>
                <li><strong>SiteGround:</strong> mail.yourdomain.com, Port 465 (SSL) or 587 (TLS)</li>
              </ul>
              <li>Use your hosting account email and password</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Port and Security Settings</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">TLS</span>
                <div>
                  <strong>Port 587 (TLS):</strong> Most common, secure connection. Check "Use secure connection" and select TLS.
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">SSL</span>
                <div>
                  <strong>Port 465 (SSL):</strong> Older but still secure. Check "Use secure connection" and select SSL.
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mr-2">NONE</span>
                <div>
                  <strong>Port 25 (No encryption):</strong> Not recommended for security reasons.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Testing Your Configuration</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Fill in all the SMTP settings above</li>
              <li>Click <strong>"Test Connection"</strong> to verify your settings</li>
              <li>If successful, click <strong>"Save Configuration"</strong></li>
              <li>Use the <strong>"Send Test Email"</strong> feature to test email delivery</li>
              <li>Check your email inbox (and spam folder) for the test email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
