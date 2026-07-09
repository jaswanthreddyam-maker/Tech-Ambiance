import { useAuthContext } from "./AuthProvider";
import type { AuthContextState } from "./types";

export function useAuth(): AuthContextState {
  return useAuthContext();
}
