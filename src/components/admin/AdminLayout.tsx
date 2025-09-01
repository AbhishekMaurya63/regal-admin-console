import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      <div className="w-64 fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;