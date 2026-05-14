import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, X, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { db } from '../lib/supabase';
import { COLORS, MATERIAL_LABELS } from '../constants/theme';
import type { MaterialType } from '../lib/types';

const MATERIALS: MaterialType[] = ['leather', 'metal', 'other'];

interface CreateIdeaScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateIdeaScreen({ onBack, onSuccess }: CreateIdeaScreenProps) {
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [price, setPrice]         = useState('');
  const [material, setMaterial]   = useState<MaterialType>('leather');
  const [tagInput, setTagInput]   = useState('');
  const [tags, setTags]           = useState<string[]>([]);
  const [images, setImages]       = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 8));
    }
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput('');
  }

  async function handleSubmit() {
    if (!title.trim())       { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    if (!price || isNaN(parseFloat(price))) { Alert.alert('エラー', '正しい価格を入力してください'); return; }
    if (images.length === 0) { Alert.alert('エラー', '画像を1枚以上追加してください'); return; }

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const uri of images) {
        const fileName = `ideas/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const url = await db.uploadImage('idea-images', uri, fileName);
        uploadedUrls.push(url);
      }

      await db.createIdea({
        title:       title.trim(),
        description: description.trim() || null,
        price:       parseFloat(price),
        material,
        tags,
        image_urls:  uploadedUrls,
        status:      'active',
      });

      Alert.alert('出品完了', 'アイデアを出品しました！', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (err: unknown) {
      Alert.alert('エラー', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Nav */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-200 bg-white">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <ChevronLeft size={24} color={COLORS.neutral[700]} />
          </TouchableOpacity>
          <Text className="text-neutral-900 font-bold text-lg">アイデアを出品</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="タイトル *"
            value={title}
            onChangeText={setTitle}
            placeholder="例: 手縫いレザーウォレットのデザイン"
          />

          <Input
            label="説明"
            value={description}
            onChangeText={setDesc}
            placeholder="アイデアの詳細をご記入ください"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          {/* Material */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">素材 *</Text>
          <View className="flex-row gap-2 mb-4">
            {MATERIALS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMaterial(m)}
                className={[
                  'flex-1 py-3 rounded-2xl border items-center',
                  material === m ? 'bg-brand-500 border-brand-500' : 'bg-white border-neutral-200',
                ].join(' ')}
              >
                <Text className={material === m ? 'text-white font-semibold' : 'text-neutral-600 font-semibold'}>
                  {MATERIAL_LABELS[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="販売価格 (円) *"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="3000"
          />

          {/* Tags */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">タグ（最大10個）</Text>
          <View className="flex-row items-center mb-2">
            <View className="flex-1 bg-white border border-neutral-300 rounded-2xl px-4 py-2.5 mr-2">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="#タグを追加"
                placeholderTextColor={COLORS.neutral[400]}
                onSubmitEditing={addTag}
                returnKeyType="done"
                className="text-neutral-900"
              />
            </View>
            <TouchableOpacity
              onPress={addTag}
              className="w-10 h-10 bg-brand-500 rounded-2xl items-center justify-center"
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="flex-row items-center bg-brand-50 border border-brand-200 px-3 py-1 rounded-full"
                >
                  <Text className="text-brand-600 text-xs">#{tag}</Text>
                  <X size={10} color={COLORS.brand.primary} className="ml-1" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Images */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            デザイン画像 *（最大8枚）
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {images.map((uri) => (
              <View key={uri} className="relative">
                <Image source={{ uri }} className="w-20 h-20 rounded-2xl" />
                <TouchableOpacity
                  onPress={() => setImages((prev) => prev.filter((i) => i !== uri))}
                  className="absolute -top-1.5 -right-1.5 bg-error rounded-full w-5 h-5 items-center justify-center"
                >
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 8 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-20 h-20 bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl items-center justify-center"
              >
                <Camera size={24} color={COLORS.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>

          <Button
            label="出品する"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
