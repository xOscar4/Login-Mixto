import { useLocalSearchParams } from 'expo-router';

import { CollectionFormScreen } from '@/screens/collections/collection-form-screen';

export default function EditCollectionRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <CollectionFormScreen mode="edit" collectionId={id} />;
}
