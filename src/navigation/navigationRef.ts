import { createNavigationContainerRef } from '@react-navigation/native';

// Shared navigation ref so non-screen modules (e.g. the tutorial overlay) can
// trigger navigation without prop drilling or circular imports.
export const navigationRef = createNavigationContainerRef<any>();
