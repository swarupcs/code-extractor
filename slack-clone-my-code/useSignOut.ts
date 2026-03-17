import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAppDispatch from "../useAppDispatch";
import { clearCredentials } from "@/features/authSlice";
import { signOutRequest } from "@/services/auth.service";

/**
 * Mutation hook for sign-out.
 *
 * On success (and on error — best-effort):
 *  1. Clears JWT from localStorage.
 *  2. Dispatches `clearCredentials` → Redux + redux-persist wipes persisted auth.
 *  3. Invalidates all cached TanStack Query data so stale user-specific
 *     data is not shown after a different user signs in.
 *
 * Usage:
 * ```tsx
 * const { mutate: signOut, isPending } = useSignOut();
 * signOut();
 * ```
 */
export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const clearLocal = () => {
    localStorage.removeItem('token');
    dispatch(clearCredentials());
    // Nuke all cached query data — prevents data leaking between sessions
    queryClient.clear();
  };

  return useMutation({
    mutationFn: () => signOutRequest(),
    onSuccess: clearLocal,
    // Clear locally even if the server call fails
    onError: clearLocal,
  });
};
