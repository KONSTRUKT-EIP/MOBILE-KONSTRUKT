import { registerRootComponent } from 'expo';
import App from './App'; // TypeScript fera le lien avec ton nouveau App.tsx

// registerRootComponent appelle AppRegistry.registerComponent('main', () => App);
// Cela garantit que l'environnement est configuré de manière appropriée,
// que vous chargiez l'application dans Expo Go ou dans un build natif.
registerRootComponent(App);