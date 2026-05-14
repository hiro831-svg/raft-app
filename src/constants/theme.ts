export const COLORS = {
  brand: {
    primary:    '#C05A00',
    dark:       '#8C3D00',
    darker:     '#5C2500',
    background: '#1A0A00',
  },
  gold: {
    accent: '#D4A017',
    light:  '#FFD966',
  },
  neutral: {
    50:  '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  success: '#16A34A',
  warning: '#CA8A04',
  error:   '#DC2626',
  white:   '#FFFFFF',
  black:   '#000000',
} as const;

export const MATERIAL_LABELS: Record<string, string> = {
  leather: '革',
  metal:   '金属',
  other:   'その他',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:     '受付中',
  accepted:    '受注確認',
  in_progress: '製作中',
  shipped:     '発送済み',
  delivered:   '配達完了',
  cancelled:   'キャンセル',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:     '#CA8A04',
  accepted:    '#2563EB',
  in_progress: '#7C3AED',
  shipped:     '#0891B2',
  delivered:   '#16A34A',
  cancelled:   '#DC2626',
};
