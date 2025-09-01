import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, RotateCcw } from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const VALID_OTP = "123456"; // Static OTP for demo

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      navigate("/auth/forgot-password");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp === VALID_OTP) {
      localStorage.setItem("otpVerified", "true");
      toast({
        title: "OTP Verified",
        description: "You can now reset your password.",
      });
      navigate("/auth/reset-password");
    } else {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect.",
        variant: "destructive",
      });
      setOtp("");
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTimeLeft(300);
    setCanResend(false);
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your email.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Time remaining: <span className="font-mono font-medium text-primary">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-destructive">OTP expired</p>
              )}
            </div>

            <Button 
              onClick={handleVerifyOTP} 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code? Resend available in {formatTime(timeLeft)}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Demo OTP: 123456
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;