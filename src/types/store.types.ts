import type { Store, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { Persistor } from 'redux-persist';

/**
 * Redux Store Types
 */

/**
 * Persist configuration
 */
export interface PersistConfig {
  key: string;
  storage: any;
  whitelist: string[];
}

/**
 * Root state type
 */
export interface RootState {
  userRole: any;
}

/**
 * App dispatch type — ThunkDispatch so async thunks are accepted without casting
 */
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

/**
 * App store type
 */
export type AppStore = Store<RootState>;

/**
 * App persistor type
 */
export type AppPersistor = Persistor;
