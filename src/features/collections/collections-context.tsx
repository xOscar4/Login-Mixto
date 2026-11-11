import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useSession } from '@/features/auth/session-context';
import { supabase } from '@/lib/supabase';

import type { CollectionDraft, CollectionRow, MusicCollection } from './types';

const COLLECTION_COLUMNS =
  'id, user_id, name, description, cover_index, created_at, updated_at';

type CollectionsContextValue = {
  collections: MusicCollection[];
  loading: boolean;
  error: string | null;
  refreshCollections: () => Promise<void>;
  createCollection: (draft: CollectionDraft) => Promise<MusicCollection>;
  updateCollection: (id: string, draft: CollectionDraft) => Promise<MusicCollection>;
  deleteCollection: (id: string) => Promise<void>;
  getCollection: (id: string) => MusicCollection | undefined;
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

export function coverIndexFor(name: string) {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) % 4;
}

function mapCollectionRow(row: CollectionRow): MusicCollection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    coverIndex: row.cover_index ?? coverIndexFor(row.name),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sortByUpdatedAt(items: MusicCollection[]) {
  return [...items].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

function describeError(error: { message: string; code?: string }, fallback: string) {
  if (/row-level security/i.test(error.message)) {
    return 'No tienes permiso para acceder a esta colección.';
  }

  if (/relation .*collections.* does not exist/i.test(error.message)) {
    return 'Falta crear la tabla collections en Supabase. Ejecuta el SQL incluido en supabase/collections.sql.';
  }

  if (error.code === 'PGRST116') {
    return 'La colección no existe o no pertenece a tu cuenta.';
  }

  if (/jwt|session/i.test(error.message)) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }

  return error.message || fallback;
}

/**
 * Colecciones reales en Supabase.
 *
 * La seguridad la aplica RLS en la base de datos: cada fila lleva `user_id`
 * y las políticas solo permiten operar sobre las filas del usuario autenticado.
 */
export function CollectionsProvider({ children }: PropsWithChildren) {
  const { user, loading: sessionLoading } = useSession();
  const [collections, setCollections] = useState<MusicCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('collections')
      .select(COLLECTION_COLUMNS)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (queryError) {
      setCollections([]);
      setError(
        describeError(queryError, 'No se pudieron cargar tus colecciones.'),
      );
    } else {
      setCollections(((data ?? []) as CollectionRow[]).map(mapCollectionRow));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCollections();
  }, [loadCollections, sessionLoading]);

  const createCollection = useCallback(
    async (draft: CollectionDraft) => {
      if (!user) {
        throw new Error('Inicia sesión para guardar colecciones.');
      }

      const name = draft.name.trim();
      const description = draft.description.trim();

      const { data, error: insertError } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name,
          description,
          cover_index: coverIndexFor(name),
        })
        .select(COLLECTION_COLUMNS)
        .single();

      if (insertError) {
        throw new Error(
          describeError(insertError, 'No se pudo crear la colección.'),
        );
      }

      const created = mapCollectionRow(data as CollectionRow);
      setCollections((current) => sortByUpdatedAt([created, ...current]));
      return created;
    },
    [user],
  );

  const updateCollection = useCallback(
    async (id: string, draft: CollectionDraft) => {
      if (!user) {
        throw new Error('Inicia sesión para editar colecciones.');
      }

      const name = draft.name.trim();
      const description = draft.description.trim();

      const { data, error: updateError } = await supabase
        .from('collections')
        .update({
          name,
          description,
          cover_index: coverIndexFor(name),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(COLLECTION_COLUMNS)
        .single();

      if (updateError) {
        throw new Error(
          describeError(updateError, 'No se pudo actualizar la colección.'),
        );
      }

      const updated = mapCollectionRow(data as CollectionRow);
      setCollections((current) =>
        sortByUpdatedAt(
          current.map((collection) =>
            collection.id === updated.id ? updated : collection,
          ),
        ),
      );
      return updated;
    },
    [user],
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Inicia sesión para eliminar colecciones.');
      }

      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw new Error(
          describeError(deleteError, 'No se pudo eliminar la colección.'),
        );
      }

      setCollections((current) =>
        current.filter((collection) => collection.id !== id),
      );
    },
    [user],
  );

  const getCollection = useCallback(
    (id: string) => collections.find((collection) => collection.id === id),
    [collections],
  );

  const value = useMemo<CollectionsContextValue>(
    () => ({
      collections,
      loading,
      error,
      refreshCollections: loadCollections,
      createCollection,
      updateCollection,
      deleteCollection,
      getCollection,
    }),
    [
      collections,
      createCollection,
      deleteCollection,
      error,
      getCollection,
      loadCollections,
      loading,
      updateCollection,
    ],
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const value = use(CollectionsContext);

  if (!value) {
    throw new Error('useCollections debe usarse dentro de CollectionsProvider');
  }

  return value;
}
