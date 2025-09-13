export interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  price: number
  type: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
  durationInMonths: number
  features: string[] | null
  status: 'active' | 'inactive' | 'archived'
  isActive: boolean
  stripePriceId: string | null
  stripeProductId: string | null
  createdAt: string
  updatedAt: string
  subscriptionCount?: number
}

export interface CreateSubscriptionPlanDto {
  name: string
  description?: string
  price: number
  type: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
  durationInMonths: number
  features?: string[]
  status?: 'active' | 'inactive' | 'archived'
  isActive?: boolean
  stripePriceId?: string
  stripeProductId?: string
}

export interface UpdateSubscriptionPlanDto {
  name?: string
  description?: string
  price?: number
  type?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
  durationInMonths?: number
  features?: string[]
  status?: 'active' | 'inactive' | 'archived'
  isActive?: boolean
  stripePriceId?: string
  stripeProductId?: string
}

export interface SubscriptionPlanStats {
  totalPlans: number
  activePlans: number
  inactivePlans: number
  archivedPlans: number
  plansWithSubscriptions: number
  mostPopularPlan: {
    planName: string
    subscriptionCount: number
  } | null
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[]
  total: number
  page: number
  limit: number
  totalPages: number
}
