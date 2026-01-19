import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isVerified = localStorage.getItem("isVerified");

  if (!isVerified) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
