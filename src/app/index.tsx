import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth/session-context';
import { LoginScreen } from '@/screens/auth/login-screen';

export default function IndexRoute() {
  const { isAuthenticated, isPreview, loading } = useSession();

  if (loading) {
    return null;
  }

  if (isAuthenticated || isPreview) {
    return <Redirect href="/home" />;
  }

  return <LoginScreen />;
}
