/**
 * Stripe integration helpers.
 * In production, the PaymentIntent is created on a secure backend
 * (Supabase Edge Function / Stripe API). This file wires up the
 * client-side presentPaymentSheet flow and provides a mock for local dev.
 */
import { useStripe } from '@stripe/stripe-react-native';

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// ── Types ────────────────────────────────────────────────────

export interface PaymentSheetParams {
  amount: number;        // in JPY (or smallest currency unit)
  currency?: string;
  description?: string;
  customerId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

// ── Mock backend call ────────────────────────────────────────
// Replace with a real Supabase Edge Function / server call.
async function fetchPaymentSheetParams(params: PaymentSheetParams): Promise<{
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}> {
  // --- MOCK ---
  // In production: POST to /functions/v1/create-payment-intent
  await new Promise((r) => setTimeout(r, 500));
  return {
    paymentIntent:  `pi_mock_${Date.now()}`,
    ephemeralKey:   `ek_mock_${Date.now()}`,
    customer:       params.customerId ?? `cus_mock_${Date.now()}`,
  };
}

// ── Hook ─────────────────────────────────────────────────────

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function startPayment(params: PaymentSheetParams): Promise<PaymentResult> {
    try {
      const { paymentIntent, ephemeralKey, customer } =
        await fetchPaymentSheetParams(params);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'CraftShare',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: { name: 'CraftShare Customer' },
      });

      if (initError) return { success: false, error: initError.message };

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) return { success: false, error: presentError.message };

      return { success: true, paymentIntentId: paymentIntent };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      return { success: false, error: message };
    }
  }

  return { startPayment };
}

// ── Price formatting helper ──────────────────────────────────

export function formatPrice(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
