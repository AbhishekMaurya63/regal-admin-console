import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { postDataHandlerWithToken } from "@/config/services";
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  Package, 
  MessageSquare, 
  User, 
  LogOut,
  Shield
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const handleLogout = async () => {
    try {
    await postDataHandlerWithToken('logout')
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminEmail");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/auth/login");
    }catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: FolderTree, label: "Category Management", path: "/admin/categories" },
    { icon: Package, label: "Product Management", path: "/admin/products" },
    { icon: MessageSquare, label: "Query Management", path: "/admin/queries" },
    { icon: User, label: "Profile", path: "/admin/profile" },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;