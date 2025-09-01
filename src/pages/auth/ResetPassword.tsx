import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const otpVerified = localStorage.getItem("otpVerified");
    if (!otpVerified) {
      navigate("/auth/forgot-password");
    }
  }, [navigate]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return { minLength, hasUpperCase, hasLowerCase, hasNumbers };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.minLength || !validation.hasUpperCase || !validation.hasLowerCase || !validation.hasNumbers) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, and numbers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clear reset session data
    localStorage.removeItem("resetEmail");
    localStorage.removeItem("otpVerified");

    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated!",
    });

    navigate("/auth/login?message=password-updated");
    setIsLoading(false);
  };

  const validation = validatePassword(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {newPassword && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${validation.minLength ? 'text-success' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${validation.minLength ? 'bg-success' : 'bg-muted'}`} />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${validation.hasUpperCase ? 'text-success' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${validation.hasUpperCase ? 'bg-success' : 'bg-muted'}`} />
                    One uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${validation.hasLowerCase ? 'text-success' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${validation.hasLowerCase ? 'bg-success' : 'bg-muted'}`} />
                    One lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${validation.hasNumbers ? 'text-success' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${validation.hasNumbers ? 'bg-success' : 'bg-muted'}`} />
                    One number
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || newPassword !== confirmPassword || !newPassword}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;