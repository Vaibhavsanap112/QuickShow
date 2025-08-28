import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { SignIn } from "@clerk/clerk-react"; // assuming you're using Clerk for auth

function ProtectedRoute({ user, isAdmin, children }) {

  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("Not Authorized ");
    }
  }, [user, isAdmin]);

  // Case 1: User not logged in → show SignIn
  if (!user) {
    return <div className="min-h-screen flex justify-center items-center">
      <SignIn fallbackRedirectUrl="/admin" />; 
    </div>
  }

  // Case 2: User logged in but not admin → block access
  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Case 3: User logged in & admin → allow
  return children;
}

export default ProtectedRoute;
