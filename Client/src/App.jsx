import Login from "@/pages/Login";
import SignupPage from "@/pages/SignUp";
import GoogleCallback from "@/pages/GoogleCallback";
import Dashboard from "@/pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import PrivateRoute from "@/components/common/PrivateRoute";
import PublicRoute from "@/components/common/PublicRoute";
import { useEffect, useState } from "react";
import ChatSideBar from "@/components/chat/ChatSideBar";
import Home from "./pages/chat/Home";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function App() {
  const { initializeAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("auth-user");
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        initializeAuth(user, token);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("auth-user");
      }
    }
    setIsLoading(false);
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Initializing application..." />
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* Signup page */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Google OAuth callback */}
        <Route path="/google-callback" element={<GoogleCallback />} />

        {/* Private routes - only for authenticated users */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
