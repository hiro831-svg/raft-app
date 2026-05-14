/**
 * Stripe payment stub.
 * @stripe/stripe-react-native is removed for web-first development.
 * Replace this file with a real Stripe integration when targeting native builds.
 */

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export interface PaymentSheetParams {
  amount: number;
  currency?: string;
  description?: string;
  customerId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export function useStripePayment() {
  async function startPayment(params: PaymentSheetParams): Promise<PaymentResult> {
    // Mock: simulate a successful payment after a short delay.
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, paymentIntentId: `pi_mock_${Date.now()}` };
  }

  return { startPayment };
}

export function formatPrice(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
