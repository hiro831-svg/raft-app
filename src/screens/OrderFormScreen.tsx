import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Camera,
  X,
  CheckCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { db } from '../lib/supabase';
import { useStripePayment, formatPrice } from '../lib/stripe';
import { COLORS, MATERIAL_LABELS } from '../constants/theme';
import type { Idea, MaterialType } from '../lib/types';

const MATERIALS: MaterialType[] = ['leather', 'metal', 'other'];
const UNIT_PRICE: Record<MaterialType, number> = {
  leather: 5000,
  metal:   8000,
  other:   3000,
};

interface OrderFormScreenProps {
  idea?: Idea;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export function OrderFormScreen({ idea, onBack, onSuccess }: OrderFormScreenProps) {
  const [title, setTitle]         = useState(idea ? `${idea.title}の加工依頼` : '');
  const [description, setDesc]    = useState('');
  const [material, setMaterial]   = useState<MaterialType>(idea?.material ?? 'leather');
  const [customText, setCustom]   = useState('');
  const [quantity, setQuantity]   = useState('1');
  const [images, setImages]       = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState<'form' | 'confirm' | 'done'>('form');

  const { startPayment } = useStripePayment();

  const qty        = Math.max(1, parseInt(quantity, 10) || 1);
  const unitPrice  = UNIT_PRICE[material];
  const totalPrice = unitPrice * qty;

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [
        ...prev,
        ...result.assets.map((a) => a.uri),
      ].slice(0, 5));
    }
  }

  function removeImage(uri: string) {
    setImages((prev) => prev.filter((i) => i !== uri));
  }

  function validate() {
    if (!title.trim())  { Alert.alert('エラー', 'タイトルを入力してください'); return false; }
    if (!description.trim()) { Alert.alert('エラー', '内容を入力してください'); return false; }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Upload images
      const uploadedUrls: string[] = [];
      for (const uri of images) {
        const fileName = `orders/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const url = await db.uploadImage('order-images', uri, fileName);
        uploadedUrls.push(url);
      }

      // Create order
      const order = await db.createOrder({
        idea_id:     idea?.id ?? null,
        title:       title.trim(),
        description: description.trim(),
        material,
        image_urls:  uploadedUrls,
        custom_text: customText.trim() || null,
        quantity:    qty,
        unit_price:  unitPrice,
        total_price: totalPrice,
        notes:       null,
      });

      // Payment
      const result = await startPayment({
        amount:      totalPrice,
        currency:    'JPY',
        description: order.title,
      });

      if (result.success) {
        setStep('done');
        setTimeout(() => onSuccess(order.id), 1500);
      } else {
        Alert.alert('お支払いエラー', result.error ?? 'お支払いに失敗しました');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '注文の作成に失敗しました';
      Alert.alert('エラー', msg);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'done') {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center px-8">
        <CheckCircle size={72} color={COLORS.success} />
        <Text className="text-2xl font-bold text-neutral-900 mt-4">注文完了！</Text>
        <Text className="text-neutral-500 text-center mt-2">
          ご注文を受け付けました。職人が確認次第ご連絡いたします。
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* ── Nav ─────────────────────────────────────────── */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-200 bg-white">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <ChevronLeft size={24} color={COLORS.neutral[700]} />
          </TouchableOpacity>
          <Text className="text-neutral-900 font-bold text-lg">加工依頼フォーム</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Linked idea notice */}
          {idea && (
            <Card className="mb-4 p-4 bg-brand-50 border border-brand-100" elevated={false}>
              <Text className="text-brand-700 text-sm font-semibold">
                💡 アイデアを参考にした依頼
              </Text>
              <Text className="text-brand-600 text-xs mt-1">{idea.title}</Text>
            </Card>
          )}

          <Input
            label="依頼タイトル *"
            value={title}
            onChangeText={setTitle}
            placeholder="例: レザーウォレットに名前を刻印"
          />

          <Input
            label="依頼内容 *"
            value={description}
            onChangeText={setDesc}
            placeholder="詳細をご記入ください（サイズ、仕様など）"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          {/* Material selector */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">素材 *</Text>
          <View className="flex-row gap-2 mb-4">
            {MATERIALS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMaterial(m)}
                className={[
                  'flex-1 py-3 rounded-2xl border items-center',
                  material === m
                    ? 'bg-brand-500 border-brand-500'
                    : 'bg-white border-neutral-200',
                ].join(' ')}
              >
                <Text
                  className={[
                    'font-semibold text-sm',
                    material === m ? 'text-white' : 'text-neutral-600',
                  ].join(' ')}
                >
                  {MATERIAL_LABELS[m]}
                </Text>
                <Text
                  className={[
                    'text-xs mt-0.5',
                    material === m ? 'text-white/80' : 'text-neutral-400',
                  ].join(' ')}
                >
                  {formatPrice(UNIT_PRICE[m])}/個
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="刻印・印刷テキスト（任意）"
            value={customText}
            onChangeText={setCustom}
            placeholder="例: John Smith / ありがとう"
          />

          <Input
            label="数量"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />

          {/* Image picker */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            参考画像（最大5枚）
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {images.map((uri) => (
              <View key={uri} className="relative">
                <Image source={{ uri }} className="w-20 h-20 rounded-2xl" />
                <TouchableOpacity
                  onPress={() => removeImage(uri)}
                  className="absolute -top-1.5 -right-1.5 bg-error rounded-full w-5 h-5 items-center justify-center"
                >
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-20 h-20 bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl items-center justify-center"
              >
                <Camera size={24} color={COLORS.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>

          {/* Price summary */}
          <Card className="p-4 mb-6">
            <Text className="text-neutral-700 font-semibold mb-3">お見積もり</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-neutral-500 text-sm">単価</Text>
              <Text className="text-neutral-700 text-sm">{formatPrice(unitPrice)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-neutral-500 text-sm">数量</Text>
              <Text className="text-neutral-700 text-sm">{qty}個</Text>
            </View>
            <View className="border-t border-neutral-100 pt-2 mt-2 flex-row justify-between">
              <Text className="text-neutral-900 font-bold">合計（税込）</Text>
              <Text className="text-brand-500 font-bold text-lg">{formatPrice(totalPrice)}</Text>
            </View>
          </Card>

          <Button
            label="注文・お支払いへ進む"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
            variant="secondary"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
