import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Sparkles, Zap, BookOpen, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PRICING_TIERS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "€5",
    period: "/month",
    priceId: "price_1Sc4FyER9xS5KAlz2CQrtdjR",
    mode: "subscription" as const,
    savings: null,
    description: "Auto-renews monthly",
  },
  {
    id: "quarterly",
    name: "3 Months",
    price: "€12",
    period: "one-time",
    priceId: "price_1Sc4GjER9xS5KAlzR3XmtNoE",
    mode: "payment" as const,
    savings: "Save 20%",
    description: "Prepaid, no auto-renewal",
  },
  {
    id: "semiannual",
    name: "6 Months",
    price: "€25",
    period: "one-time",
    priceId: "price_1Sc4H8ER9xS5KAlzLFpiB5M5",
    mode: "payment" as const,
    savings: "Save 17%",
    description: "Prepaid, no auto-renewal",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "€50",
    period: "/year",
    priceId: "price_1Sc4HoER9xS5KAlzdqpVgGRe",
    mode: "subscription" as const,
    savings: "Best Value",
    highlight: true,
    description: "Auto-renews yearly",
  },
];

const Premium = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Welcome to Premium!",
        description: "Your subscription is now active. Enjoy your premium benefits!",
      });
      checkSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast({
        title: "Checkout Canceled",
        description: "Your subscription was not completed.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      if (data.subscribed) {
        await refreshProfile();
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSubscribe = async (priceId: string, tierId: string, mode: "subscription" | "payment") => {
    setLoading(tierId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, mode },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
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
      <AppLayout backLabel="Back" maxWidth="4xl">
        <Card className="text-center border-yellow-500 border-2">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
            <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-3xl">You're Premium!</CardTitle>
            <CardDescription>
              Thank you for supporting Shpoko. Enjoy your premium benefits!
            </CardDescription>
            {profile.premium_until && (
              <p className="text-sm text-muted-foreground mt-2">
                Active until: {new Date(profile.premium_until).toLocaleDateString()}
              </p>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
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
            
            <Button
              onClick={handleManageSubscription}
              disabled={loading === "manage"}
              variant="outline"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {loading === "manage" ? "Loading..." : "Manage Subscription"}
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout backLabel="Back" maxWidth="4xl">
      <div className="text-center mb-8">
        <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Upgrade to Premium</h1>
        <p className="text-xl text-muted-foreground">
          Accelerate your Bulgarian learning journey
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
              <feature.icon className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="font-semibold text-sm">{feature.title}</p>
          </div>
        ))}
      </div>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {PRICING_TIERS.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative ${tier.highlight ? 'border-yellow-500 border-2 shadow-lg' : ''}`}
          >
            {tier.savings && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                tier.highlight 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-accent text-foreground'
              }`}>
                {tier.savings}
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSubscribe(tier.priceId, tier.id, tier.mode)}
                disabled={loading === tier.id}
                className={`w-full ${
                  tier.highlight 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black' 
                    : ''
                }`}
                variant={tier.highlight ? "default" : "outline"}
              >
                {loading === tier.id ? "Loading..." : tier.mode === "payment" ? "Buy Now" : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        By subscribing, you agree to our terms of service. Payments are processed securely via Stripe.
      </p>
    </AppLayout>
  );
};

export default Premium;
