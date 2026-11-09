import { createContext, use, useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import type { CollectionDraft, MusicCollection } from './types';

type CollectionsContextValue = {
  collections: MusicCollection[];
  createCollection: (draft: CollectionDraft) => MusicCollection;
  updateCollection: (id: string, draft: CollectionDraft) => void;
  deleteCollection: (id: string) => void;
  getCollection: (id: string) => MusicCollection | undefined;
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function coverIndexFor(name: string) {  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) % 4;
}

/**
 * Almacén de borradores en memoria para la primera etapa visual.
 *
 * No persiste datos ni se presenta como información real. En la segunda etapa
 * este provider se sustituirá por consultas a Supabase:
 *   supabase.from('collections').select().order('updated_at', { ascending: false })
 * y las mutaciones usarán insert/update/delete con RLS por user_id.
 */
export function CollectionsProvider({ children }: PropsWithChildren) {
  const [collections, setCollections] = useState<MusicCollection[]>([]);

  const createCollection = useCallback((draft: CollectionDraft) => {
    const now = new Date().toISOString();
    const collection: MusicCollection = {
      id: createId(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      coverIndex: coverIndexFor(draft.name),
      createdAt: now,
      updatedAt: now,
    };

    setCollections((current) => [collection, ...current]);
    return collection;
  }, []);

  const updateCollection = useCallback((id: string, draft: CollectionDraft) => {
    setCollections((current) =>
      current.map((collection) =>
        collection.id === id
          ? {
              ...collection,
              name: draft.name.trim(),
              description: draft.description.trim(),
              updatedAt: new Date().toISOString(),
            }
          : collection,
      ),
    );
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((current) => current.filter((collection) => collection.id !== id));
  }, []);

  const getCollection = useCallback(
    (id: string) => collections.find((collection) => collection.id === id),
    [collections],
  );

  const value = useMemo<CollectionsContextValue>(
    () => ({
      collections,
      createCollection,
      updateCollection,
      deleteCollection,
      getCollection,
    }),
    [collections, createCollection, deleteCollection, getCollection, updateCollection],
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const value = use(CollectionsContext);

  if (!value) {
    throw new Error('useCollections debe usarse dentro de CollectionsProvider');
  }

  return value;
}
