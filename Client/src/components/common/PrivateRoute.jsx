import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn } = useAuthStore();

  // Redirect to login if not authenticated
  // Save the current location so we can redirect back after login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
