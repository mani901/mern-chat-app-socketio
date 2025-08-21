import Login from "@/pages/Login";
import SignupPage from "@/pages/SignUp";
import GoogleCallback from "@/pages/GoogleCallback";
import Dashboard from "@/pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import PrivateRoute from "@/components/common/PrivateRoute";
import PublicRoute from "@/components/common/PublicRoute";
import { useEffect } from "react";
import ChatSideBar from "@/components/chat/ChatSideBar";
import Home from "./pages/chat/Home";

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("auth-user");
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        initializeAuth(user, token);
      } catch {}
    }
  }, [initializeAuth]);

  return (
    <div>
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
            <PublicRoute>
              <Home />
            </PublicRoute>
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
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
