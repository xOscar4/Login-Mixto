export type MusicCollection = {
  id: string;
  name: string;
  description: string;
  coverIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type CollectionDraft = {
  name: string;
  description: string;
};

/**
 * Fila de `public.collections` tal como llega desde Supabase (snake_case).
 */
export type CollectionRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_index: number | null;
  created_at: string;
  updated_at: string;
};
