import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = () => {
      try {
        // Get token and user data from URL params
        const token = searchParams.get("token");
        const userData = searchParams.get("user");
        const error = searchParams.get("error");

        if (error) {
          console.error("Google auth error:", error);
          navigate("/login?error=" + encodeURIComponent(error));
          return;
        }

        if (!token || !userData) {
          console.error("Missing token or user data");
          navigate(
            "/login?error=" + encodeURIComponent("Authentication failed")
          );
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userData));

        console.log("Google login success:", { user, token });

        // Save token to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("auth-user", JSON.stringify(user));

        // Update Zustand store
        useAuthStore.getState().setAuth(user, token);

        // Redirect to home (dashboard route is mounted at "/")
        navigate("/");
      } catch (error) {
        console.error("Google callback error:", error);
        navigate(
          "/login?error=" +
            encodeURIComponent("Failed to process authentication")
        );
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
}
