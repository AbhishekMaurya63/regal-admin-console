import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page since this is an admin-only application
    navigate("/auth/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting to Admin Portal...</h1>
        <p className="text-xl text-muted-foreground">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  );
};

export default Index;
