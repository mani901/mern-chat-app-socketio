import { useCallback } from"react";

export const useGoogleAuth = () => {
  const handleGoogleLogin = useCallback(() => {
    const googleAuthUrl = import.meta.env.VITE_GOOGLE_OAUTH_URL || "http://localhost:8080/api/auth/google";
    window.open(
      googleAuthUrl,
      "google-oauth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );
  }, []);

  return { handleGoogleLogin };
};