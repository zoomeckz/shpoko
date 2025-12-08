import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import raccoonMascot from "@/assets/raccoon-mascot.png";
import { z } from "zod";

const signUpSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Username can only contain letters, numbers, and spaces"),
});

const signInSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUpWithUsername, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        signInSchema.parse({ username });
      } else {
        signUpSchema.parse({ username });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(username);
        if (error) {
          toast({
            title: "Login Failed",
            description: "Username not found. Please check your username or create a new account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/");
        }
      } else {
        const { error } = await signUpWithUsername(username);
        if (error) {
          if (error.message.includes("already")) {
            toast({
              title: "Username Taken",
              description: "This username is already taken. Please choose another.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome to Shpoko!",
            description: "Your account has been created. Start learning!",
          });
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={raccoonMascot} alt="Raccoon mascot" className="w-24 h-24" />
          </div>
          <CardTitle className="text-3xl font-bold text-blue-600">
            {isLogin ? "Welcome Back!" : "Join Shpoko"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your username to continue learning"
              : "Choose a username to start your Bulgarian learning journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={errors.username ? "border-red-500" : ""}
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Log In" : "Start Learning"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "New to Shpoko?" : "Already have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-blue-600"
            >
              {isLogin ? "Create an account" : "Log in"}
            </Button>
          </div>

          {!isLogin && (
            <p className="mt-4 text-sm text-center text-muted-foreground">
              📚 Your progress will be saved automatically. Add your email later to unlock premium features!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;