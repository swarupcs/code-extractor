
import { signUpRequest } from "@/services/auth.service";
import type { ApiErrorResponse, SignUpPayload } from "@/types";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

/**
 * Mutation hook for user registration.
 *
 * On success: the user is created on the server but NOT signed in.
 * The caller should navigate to sign-in or show a "check your email" message.
 *
 * Usage:
 * ```tsx
 * const { mutate: signUp, isPending, error } = useSignUp();
 * signUp({ email, username, password });
 * ```
 */
export const useSignUp = () => {
  return useMutation({
    mutationFn: (payload: SignUpPayload) => signUpRequest(payload),

    onError: (err: AxiosError<ApiErrorResponse>) => {
      // Error is surfaced via mutation.error — handle toasts in the component
      console.error('[useSignUp] error:', err.response?.data?.message);
    },
  });
};
