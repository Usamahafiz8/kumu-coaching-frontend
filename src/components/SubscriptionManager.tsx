'use client';

import { useState, useEffect } from 'react';
import { subscriptionService, SubscriptionPlan, Subscription } from '../lib/subscriptionService';

export default function SubscriptionManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getSubscriptionStatus(),
      ]);
      
      setPlans(plansResponse.data);
      setSubscription(subscriptionResponse.data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessing(planId);
      setError(null);

      const successUrl = `${window.location.origin}/subscription/success`;
      const cancelUrl = `${window.location.origin}/subscription/cancel`;

      const response = await subscriptionService.createCheckoutSession(
        planId,
        successUrl,
        cancelUrl
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setProcessing('cancel');
      setError(null);

      await subscriptionService.cancelSubscription();
      await loadData(); // Reload data to update subscription status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Plans</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Amount:</span>
              <span className="ml-2">${subscription.amount} {subscription.currency}</span>
            </div>
            <div>
              <span className="font-medium">Next Billing:</span>
              <span className="ml-2">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
          </div>
          {subscription.status === 'active' && (
            <button
              onClick={handleCancel}
              disabled={processing === 'cancel'}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {processing === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>

              {plan.features && plan.features.length > 0 && (
                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processing === plan.id || subscription?.status === 'active'}
                className={`w-full py-2 px-4 rounded font-medium ${
                  subscription?.status === 'active'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {processing === plan.id ? 'Processing...' : 
                 subscription?.status === 'active' ? 'Current Plan' : 
                 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscription plans available.</p>
        </div>
      )}
    </div>
  );
}
