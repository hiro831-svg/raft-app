import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Home, ShoppingBag, Package, User, LayoutDashboard } from 'lucide-react-native';

import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { COLORS } from '../constants/theme';

// Screens
import { LoginScreen }           from '../screens/auth/LoginScreen';
import { RegisterScreen }        from '../screens/auth/RegisterScreen';
import { HomeScreen }            from '../screens/HomeScreen';
import { MarketplaceScreen }     from '../screens/MarketplaceScreen';
import { OrderFormScreen }       from '../screens/OrderFormScreen';
import { ProfileScreen }         from '../screens/ProfileScreen';
import { AdminDashboardScreen }  from '../screens/AdminDashboardScreen';
import { CreateIdeaScreen }      from '../screens/CreateIdeaScreen';

import type { Idea, Order } from '../lib/types';

// ── Stack param lists ────────────────────────────────────────

export type AuthStackParams = {
  Login:    undefined;
  Register: undefined;
};

export type RootStackParams = {
  Tabs:        undefined;
  OrderForm:   { idea?: Idea };
  CreateIdea:  undefined;
};

// ── Auth stack ───────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParams>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login"    component={_LoginWrapper} />
      <AuthStack.Screen name="Register" component={_RegisterWrapper} />
    </AuthStack.Navigator>
  );
}

function _LoginWrapper({ navigation }: any) {
  return (
    <LoginScreen
      onNavigateRegister={() => navigation.navigate('Register')}
      onSuccess={() => {}}
    />
  );
}

function _RegisterWrapper({ navigation }: any) {
  return (
    <RegisterScreen
      onNavigateLogin={() => navigation.navigate('Login')}
      onSuccess={() => navigation.navigate('Login')}
    />
  );
}

// ── Bottom tab navigator ────────────────────────────────────

const Tab = createBottomTabNavigator();

function TabNavigator({ userId, profile }: { userId: string; profile: any }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.brand.primary,
        tabBarInactiveTintColor: COLORS.neutral[400],
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  COLORS.neutral[200],
          borderTopWidth:  1,
          paddingTop:      4,
          height:          64,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 6, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      >
        {(props) => (
          <HomeScreen
            profile={profile}
            onNavigateMarketplace={() => props.navigation.navigate('Marketplace')}
            onNavigateOrderForm={(idea) =>
              (props.navigation as any).getParent()?.navigate('OrderForm', { idea })
            }
            onNavigateIdeaDetail={(idea) =>
              (props.navigation as any).getParent()?.navigate('OrderForm', { idea })
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Marketplace"
        options={{
          tabBarLabel: 'マーケット',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      >
        {(props) => (
          <MarketplaceScreen
            onNavigateIdeaDetail={(idea) =>
              (props.navigation as any).getParent()?.navigate('OrderForm', { idea })
            }
            onNavigateOrderForm={(idea) =>
              (props.navigation as any).getParent()?.navigate('OrderForm', { idea })
            }
            onNavigateCreateIdea={() =>
              (props.navigation as any).getParent()?.navigate('CreateIdea')
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Orders"
        options={{
          tabBarLabel: '注文',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      >
        {() => (
          <AdminDashboardScreen />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'マイページ',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      >
        {(props) => (
          <ProfileScreen
            userId={userId}
            onOrderPress={(_order: Order) => {}}
            onFavoritePress={(_ideaId: string) => {}}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ── Root stack (wraps tabs + modals) ────────────────────────

const RootStack = createNativeStackNavigator<RootStackParams>();

function RootNavigator({ userId, profile }: { userId: string; profile: any }) {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs">
        {() => <TabNavigator userId={userId} profile={profile} />}
      </RootStack.Screen>

      <RootStack.Screen
        name="OrderForm"
        options={{ presentation: 'modal' }}
      >
        {({ route, navigation }) => (
          <OrderFormScreen
            idea={(route.params as any)?.idea}
            onBack={() => navigation.goBack()}
            onSuccess={() => navigation.goBack()}
          />
        )}
      </RootStack.Screen>

      <RootStack.Screen
        name="CreateIdea"
        options={{ presentation: 'modal' }}
      >
        {({ navigation }) => (
          <CreateIdeaScreen
            onBack={() => navigation.goBack()}
            onSuccess={() => navigation.goBack()}
          />
        )}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}

// ── Top-level navigator (auth gate) ─────────────────────────

export function AppNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingSpinner fullScreen message="CraftShare を起動中..." />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? (
        <RootNavigator userId={session.user.id} profile={profile} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
