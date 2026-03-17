import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '@/features/authSlice';
import channelReducer from '@/features/channelSlice';
// import messageReducer from '@/features/messageSlice';
// import socketReducer from '@/features/socketSlice';
import workspaceReducer from '@/features/workspaceSlice';

// ─── Persist Config ───────────────────────────────────────────────────────────
// Only auth is persisted (user + token) so the user stays signed in on refresh.
// All other slices are server-state owned by TanStack Query — fetched fresh on mount.

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token'] satisfies (keyof ReturnType<
    typeof authReducer
  >)[],
};

// ─── Root Reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  workspace: workspaceReducer,
  channel: channelReducer,
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
