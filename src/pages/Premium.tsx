import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, ArrowLeft, Sparkles, Zap, BookOpen } from "lucide-react";

const Premium = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // For now, show a toast - Stripe integration will be added
    toast({
      title: "Coming Soon!",
      description: "Premium subscriptions will be available soon. Stay tuned!",
    });
    setLoading(false);
  };

  const features = [
    {
      icon: Sparkles,
      title: "15% XP Boost",
      description: "Earn extra XP on all activities",
    },
    {
      icon: BookOpen,
      title: "Premium Lessons",
      description: "Access exclusive advanced lessons",
    },
    {
      icon: Zap,
      title: "Priority Features",
      description: "Be first to try new features",
    },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Show off your dedication on the leaderboard",
    },
  ];

  if (profile?.is_premium) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          streak={profile.streak}
          hearts={5}
          xp={profile.xp}
          dailyGoalProgress={65}
        />
        <main className="max-w-4xl mx-auto p-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <Card className="text-center">
            <CardHeader>
              <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <CardTitle className="text-3xl">You're Premium!</CardTitle>
              <CardDescription>
                Thank you for supporting Raccoonie. Enjoy your premium benefits!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-accent rounded-lg">
                    <feature.icon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        streak={profile?.streak || 0}
        hearts={5}
        xp={profile?.xp || 0}
        dailyGoalProgress={65}
      />

      <main className="max-w-4xl mx-auto p-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-4xl font-bold mb-2">Upgrade to Premium</h1>
          <p className="text-xl text-muted-foreground">
            Accelerate your Bulgarian learning journey
          </p>
        </div>

        <Card className="mb-8 border-yellow-500 border-2">
          <CardHeader className="text-center bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
            <CardTitle className="text-3xl">
              <span className="text-yellow-500">$5</span>
              <span className="text-lg text-muted-foreground">/month</span>
            </CardTitle>
            <CardDescription>Cancel anytime</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold py-6 text-lg"
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By subscribing, you agree to our terms of service. Payments are processed securely via Stripe.
        </p>
      </main>
    </div>
  );
};

export default Premium;
