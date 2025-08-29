import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Mail, Lock, User, ArrowRight, Chrome, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerSchema, otpLoginSchema, verifyOtpSchema } from "@shared/schema";

export default function Login() {
  const { login, register, sendOTP, loginWithOTP } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: {
      email: "",
    },
  });

  const verifyOtpForm = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    try {
      await register(data.username, data.email, data.password);
      toast({
        title: "Account created!",
        description: "Welcome to Velora! Your account has been created successfully.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (data: any) => {
    setIsLoading(true);
    try {
      await sendOTP(data.email);
      setOtpEmail(data.email);
      setOtpSent(true);
      verifyOtpForm.setValue("email", data.email);
      toast({
        title: "OTP sent!",
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: any) => {
    setIsLoading(true);
    try {
      await loginWithOTP(data.email, data.otp);
      toast({
        title: "Welcome!",
        description: "You have been successfully logged in.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen py-8 flex items-center justify-center" data-testid="login-page">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-3xl font-bold mb-2" data-testid="login-title">
              Welcome to Velora
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your AI toolkit and discover new tools
            </p>
          </div>

          <Card className="gradient-border glow-effect">
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4" data-testid="login-form">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input 
                                  placeholder="Enter your email" 
                                  type="email" 
                                  className="pl-10"
                                  {...field} 
                                  data-testid="login-email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input 
                                  placeholder="Enter your password" 
                                  type="password" 
                                  className="pl-10"
                                  {...field} 
                                  data-testid="login-password"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                        data-testid="login-submit"
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4" data-testid="register-form">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input 
                                  placeholder="Choose a username" 
                                  className="pl-10"
                                  {...field} 
                                  data-testid="register-username"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input 
                                  placeholder="Enter your email" 
                                  type="email" 
                                  className="pl-10"
                                  {...field} 
                                  data-testid="register-email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input 
                                  placeholder="Create a password (min 6 characters)" 
                                  type="password" 
                                  className="pl-10"
                                  {...field} 
                                  data-testid="register-password"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                        data-testid="register-submit"
                      >
                        {isLoading ? "Creating account..." : "Create Account"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Alternative Auth Methods */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  data-testid="google-login"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>

                {/* OTP Login */}
                <div className="space-y-3">
                  {!otpSent ? (
                    <Form {...otpForm}>
                      <form onSubmit={otpForm.handleSubmit(handleSendOTP)} className="space-y-3">
                        <FormField
                          control={otpForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input 
                                    placeholder="Email for magic link" 
                                    type="email" 
                                    className="pl-10"
                                    {...field} 
                                    data-testid="otp-email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full"
                          disabled={isLoading}
                          data-testid="send-otp"
                        >
                          {isLoading ? "Sending..." : "Send Magic Link"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...verifyOtpForm}>
                      <form onSubmit={verifyOtpForm.handleSubmit(handleVerifyOTP)} className="space-y-3">
                        <p className="text-sm text-muted-foreground text-center">
                          Enter the 6-digit code sent to {otpEmail}
                        </p>
                        <FormField
                          control={verifyOtpForm.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  placeholder="Enter 6-digit code" 
                                  className="text-center text-lg tracking-widest"
                                  maxLength={6}
                                  {...field} 
                                  data-testid="verify-otp"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpEmail("");
                              verifyOtpForm.reset();
                              otpForm.reset();
                            }}
                            data-testid="otp-back"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                            data-testid="verify-otp-submit"
                          >
                            {isLoading ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
