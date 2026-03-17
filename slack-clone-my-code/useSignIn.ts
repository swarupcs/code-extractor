import type { ApiErrorResponse, AuthUser, SignInPayload } from "@/types";
import useAppDispatch from "../useAppDispatch";
import { signInRequest } from "@/services/auth.service";
import { setCredentials } from "@/features/authSlice";
import type { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";


/**
 * Mutation hook for sign-in.
 *
 * On success:
 *  1. Persists the JWT to localStorage (picked up by the axios interceptor).
 *  2. Dispatches `setCredentials` → Redux + redux-persist stores user + token.
 *
 * Usage:
 * ```tsx
 * const { mutate: signIn, isPending, error } = useSignIn();
 * signIn({ email, password });
 * ```
 */
export const useSignIn = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: SignInPayload) => signInRequest(payload),

    onSuccess: (authUser: AuthUser) => {
      // 1. Persist token for axios request interceptor
      localStorage.setItem('token', authUser.token);
      // 2. Sync into Redux — redux-persist will write user + token to localStorage
      dispatch(setCredentials(authUser));
    },

    onError: (err: AxiosError<ApiErrorResponse>) => {
      console.error('[useSignIn] error:', err.response?.data?.message);
    },
  });
};
