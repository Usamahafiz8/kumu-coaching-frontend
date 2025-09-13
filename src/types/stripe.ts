export interface StripeConfig {
  publishableKey: string
  mode: 'test' | 'live'
  currency: string
}

export interface StripeKeys {
  secretKey: string
  publishableKey: string
  webhookSecret: string
  mode: 'test' | 'live'
  currency: string
}

export interface StripeProduct {
  id: string
  name: string
  description: string | null
  active: boolean
  metadata: Record<string, any>
  created: number
}

export interface StripePrice {
  id: string
  product: string
  unit_amount: number
  currency: string
  recurring: {
    interval: string
    interval_count: number
  } | null
  active: boolean
  metadata: Record<string, any>
}

export interface StripeSubscription {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  items: {
    data: Array<{
      price: StripePrice
    }>
  }
  metadata: Record<string, any>
}

export interface StripeCustomer {
  id: string
  email: string
  name: string | null
  created: number
  metadata: Record<string, any>
}

export interface StripePayment {
  id: string
  amount: number
  currency: string
  status: string
  customer: string
  subscription: string | null
  created: number
  metadata: Record<string, any>
}
