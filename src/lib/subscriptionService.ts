const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status: string;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan?: SubscriptionPlan;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

class SubscriptionService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  async getPlans(): Promise<{ success: boolean; data: SubscriptionPlan[] }> {
    return this.request('/subscription-plans');
  }

  async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{ success: boolean; data: CheckoutSession }> {
    return this.request('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId, successUrl, cancelUrl }),
    });
  }

  async getSubscriptionStatus(): Promise<{ success: boolean; data: { hasActiveSubscription: boolean; subscription: Subscription | null } }> {
    return this.request('/subscriptions/status');
  }

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    return this.request('/subscriptions/cancel', {
      method: 'DELETE',
    });
  }
}

export const subscriptionService = new SubscriptionService();
