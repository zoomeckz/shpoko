import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Product IDs mapped to premium duration in days
const PREPAID_PRODUCTS: Record<string, number> = {
  "prod_TZAtUCVfnO1NaO": 90,  // 3 months
  "prod_TZAu48Qeb8wbC4": 180, // 6 months
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions first
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let hasActivePremium = false;
    let subscriptionEnd: string | null = null;
    let productId: string | null = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      hasActivePremium = true;
      logStep("Active subscription found", { subscriptionId: subscription.id, productId, endDate: subscriptionEnd });
    } else {
      // Check for one-time payments (prepaid plans)
      logStep("No active subscription, checking one-time payments");
      
      const checkoutSessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 10,
      });

      for (const session of checkoutSessions.data) {
        if (session.payment_status === "paid" && session.mode === "payment") {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          
          for (const item of lineItems.data) {
            const priceProductId = item.price?.product as string;
            const daysToAdd = PREPAID_PRODUCTS[priceProductId];
            
            if (daysToAdd) {
              const purchaseDate = new Date(session.created * 1000);
              const endDate = new Date(purchaseDate);
              endDate.setDate(endDate.getDate() + daysToAdd);
              
              if (endDate > new Date()) {
                subscriptionEnd = endDate.toISOString();
                productId = priceProductId;
                hasActivePremium = true;
                logStep("Active prepaid plan found", { productId, endDate: subscriptionEnd });
                break;
              }
            }
          }
          if (hasActivePremium) break;
        }
      }
    }

    // Update user's premium status in profiles
    if (hasActivePremium) {
      await supabaseClient
        .from("profiles")
        .update({ 
          is_premium: true, 
          premium_until: subscriptionEnd 
        })
        .eq("id", user.id);
      logStep("Profile updated with premium status");
    } else {
      logStep("No active premium found");
      await supabaseClient
        .from("profiles")
        .update({ 
          is_premium: false, 
          premium_until: null 
        })
        .eq("id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActivePremium,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
