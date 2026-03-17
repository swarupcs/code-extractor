import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { useAppSelector } from './hooks';



// ─── Auth Selectors ───────────────────────────────────────────────────────────


export const useAuthUser = () => useAppSelector((state) => state.auth.user);

export const useAuthToken = () => useAppSelector((state) => state.auth.token);

export const useIsAuthenticated = () =>
  useAppSelector((state) => state.auth.token !== null);


/**To be deleted */
// export const selectCurrentUser = (state: RootState) => state.auth.user;
// export const selectAuthToken = (state: RootState) => state.auth.token;
// export const selectIsAuthenticated = createSelector(
//   selectCurrentUser,
//   selectAuthToken,
//   (user, token) => !!user && !!token
// );
// export const selectAuthLoading = (state: RootState) => state.auth.loading;
// export const selectAuthError = (state: RootState) => state.auth.error;

// ─── Workspace Selectors ──────────────────────────────────────────────────────

export const useCurrentWorkspaceId = () =>
  useAppSelector((s: RootState) => s.workspace.currentWorkspaceId);

// export const selectIsCurrentUserAdmin = createSelector(
//   selectCurrentWorkspace,
//   selectCurrentUser,
//   (workspace, user) =>
//     workspace?.members.some(
//       (m) => m.memberId._id === user?._id && m.role === 'admin'
//     ) ?? false
// );

// ─── Channel Selectors ────────────────────────────────────────────────────────
export const useCurrentChannelId = () =>
  useAppSelector((s: RootState) => s.channel.currentChannelId);

export const useCurrentDMId = () =>
  useAppSelector((s: RootState) => s.channel.currentDMId);

export const useUnreadCounts = () =>
  useAppSelector((s: RootState) => s.channel.unreadCounts);

export const useUnreadCount = (channelId: string) =>
  useAppSelector((s: RootState) => s.channel.unreadCounts[channelId] ?? 0);
// ─── Message Selectors ────────────────────────────────────────────────────────

// export const selectMessages = (state: RootState) => state.messages.messages;
// export const selectMessagesLoading = (state: RootState) => state.messages.loading;
// export const selectSendingMessage = (state: RootState) => state.messages.sendingMessage;

// ─── Socket Selectors ─────────────────────────────────────────────────────────

// export const selectSocketConnected = (state: RootState) => state.socket.connected;
// export const selectCurrentChannelId = (state: RootState) => state.socket.currentChannelId;
