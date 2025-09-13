export interface Influencer {
  id: string;
  userId: string;
  commissionRate: number;
  totalEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  status: 'active' | 'inactive' | 'suspended';
  stripeAccountId?: string;
  bankAccountId?: string;
  notes?: string;
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number;
  averageCommission: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  promoCodes: PromoCode[];
}

export interface PromoCode {
  id: string;
  code: string;
  influencerId: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isExpired: boolean;
  remainingUses: number;
}

export interface Commission {
  id: string;
  influencerId: string;
  subscriptionId: string;
  subscriptionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paidAt?: string;
  payoutId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  influencer: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  subscription: {
    id: string;
    plan: {
      name: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface CreateInfluencerDto {
  userId: string;
  commissionRate?: number;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface UpdateInfluencerDto {
  commissionRate?: number;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
  stripeAccountId?: string;
  bankAccountId?: string;
}

export interface CreatePromoCodeDto {
  code: string;
  influencerId: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
  description?: string;
}

export interface UpdatePromoCodeDto {
  code?: string;
  type?: 'percentage' | 'fixed_amount';
  value?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
  description?: string;
}

export interface ValidatePromoCodeDto {
  code: string;
  orderAmount: number;
}

export interface PromoCodeValidationResponse {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  promoCode?: {
    id: string;
    code: string;
    type: string;
    value: number;
    maxDiscount?: number;
    description?: string;
  };
  error?: string;
}

export interface CreateWithdrawalRequestDto {
  amount: number;
  notes?: string;
}

export interface WithdrawalRequest {
  id: string;
  influencerId: string;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt?: string;
  payoutId?: string;
  notes?: string;
  influencer: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface InfluencerStats {
  influencer: Influencer;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalCommissionAmount: number;
  availableBalance: number;
  totalWithdrawn: number;
}
