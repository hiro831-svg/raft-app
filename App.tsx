import 'react-native-gesture-handler';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/lib/stripe';

// @stripe/stripe-react-native has no web support; import conditionally.
const StripeProvider: React.ComponentType<{
  publishableKey: string;
  children: React.ReactNode;
}> =
  Platform.OS !== 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@stripe/stripe-react-native').StripeProvider
    : ({ children }) => <>{children}</>;

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AppNavigator />
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
