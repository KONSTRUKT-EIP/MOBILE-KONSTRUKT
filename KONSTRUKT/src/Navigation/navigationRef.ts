import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { setSessionExpiredHandler } from '../API/Api';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

setSessionExpiredHandler(() => {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
});
