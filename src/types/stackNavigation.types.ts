/**
 * Stack Navigation Types
 */

/**
 * Stack Navigator screen options
 */
export interface StackScreenOptions {
  headerShown: boolean;
  gestureEnabled: boolean;
  headerTintColor: string;
  headerBackTitleVisible: boolean;
  cardStyle: {
    backgroundColor: string;
  };
}

/**
 * Initial route name type
 */
export type InitialRouteName = string;
