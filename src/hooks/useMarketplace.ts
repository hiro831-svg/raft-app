import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../lib/supabase';
import type { Idea, MaterialType } from '../lib/types';

const PAGE_SIZE = 20;

export function useMarketplace(material?: MaterialType) {
  const [ideas, setIdeas]       = useState<Idea[]>([]);
  const [loading, setLoading]   = useState(true);
  const [hasMore, setHasMore]   = useState(true);
  const offsetRef               = useRef(0);

  const fetchPage = useCallback(
    async (reset = false) => {
      if (reset) { offsetRef.current = 0; setHasMore(true); }
      try {
        const data = await db.listIdeas({
          material,
          limit:  PAGE_SIZE,
          offset: offsetRef.current,
        });
        setIdeas((prev) => reset ? data : [...prev, ...data]);
        offsetRef.current += data.length;
        if (data.length < PAGE_SIZE) setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [material],
  );

  useEffect(() => {
    setLoading(true);
    fetchPage(true);
  }, [fetchPage]);

  async function toggleFavorite(ideaId: string) {
    const isFav = await db.toggleFavorite(ideaId);
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, is_favorited: isFav } : i)),
    );
  }

  return {
    ideas,
    loading,
    hasMore,
    loadMore:       () => fetchPage(false),
    refresh:        () => fetchPage(true),
    toggleFavorite,
  };
}
