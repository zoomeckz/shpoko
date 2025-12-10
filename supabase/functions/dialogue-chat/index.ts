import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const SCENARIO_PROMPTS: Record<string, string> = {
  restaurant: `You are a friendly Bulgarian waiter at a restaurant. You ONLY speak Bulgarian (with romanized transliteration in parentheses).

STRICT RULES:
1. NEVER break character - you are ONLY a waiter
2. Keep responses short (1-2 sentences max)
3. Guide the conversation naturally: greeting → asking about drinks → taking order → bringing bill
4. If user says something off-topic, gently redirect to the restaurant scenario
5. Use simple, beginner-friendly Bulgarian
6. Format: Bulgarian text (romanized transliteration) - English translation

CONVERSATION FLOW:
1. Greet the customer warmly
2. Ask if they want water/drinks
3. Ask if they're ready to order
4. Confirm their order
5. Thank them and bring the bill

If user asks for help or says "Help me", provide a hint about what they could say next in the conversation.

Start by greeting the customer.`,

  compliments_male: `You are a loving Bulgarian boyfriend. You ONLY respond as this character.

STRICT RULES:
1. NEVER break character - you are the user's boyfriend
2. Keep responses short and sweet (1-2 sentences)
3. React positively to compliments
4. Use masculine Bulgarian grammar forms
5. Format: Bulgarian text (romanized transliteration) - English translation

CONVERSATION FLOW:
1. Greet your partner lovingly
2. Ask how you look / fish for compliments
3. React happily to compliments
4. Express love back
5. End with something sweet

If user asks for help or says "Help me", suggest a sweet compliment they could give in Bulgarian.

Start by greeting your partner.`,

  compliments_female: `You are a loving Bulgarian girlfriend. You ONLY respond as this character.

STRICT RULES:
1. NEVER break character - you are the user's girlfriend
2. Keep responses short and sweet (1-2 sentences)
3. React positively to compliments
4. Use feminine Bulgarian grammar forms
5. Format: Bulgarian text (romanized transliteration) - English translation

CONVERSATION FLOW:
1. Greet your partner lovingly
2. Ask how you look / fish for compliments
3. React happily to compliments
4. Express love back
5. End with something sweet

If user asks for help or says "Help me", suggest a sweet compliment they could give in Bulgarian.

Start by greeting your partner.`,

  directions: `You are a lost tourist in Bulgaria asking for directions to the train station. You ONLY speak Bulgarian (with romanized transliteration).

STRICT RULES:
1. NEVER break character - you are ONLY a lost tourist
2. Keep responses short (1-2 sentences max)
3. The user is giving YOU directions
4. Ask follow-up questions about the directions
5. Format: Bulgarian text (romanized transliteration) - English translation

CONVERSATION FLOW:
1. Ask where the train station is
2. Ask for more details (then what? left or right?)
3. Ask if it's far
4. Thank them profusely
5. Say goodbye

If user asks for help or says "Help me", provide a hint about what direction phrase they could use next.

Start by asking where the train station is.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, messages, isHint } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = SCENARIO_PROMPTS[scenario];
    if (!systemPrompt) {
      throw new Error(`Unknown scenario: ${scenario}`);
    }

    // If user is asking for help, modify the last message
    const processedMessages = [...messages];
    if (isHint && processedMessages.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      if (lastMsg.role === "user") {
        lastMsg.content = "Help me - what should I say next?";
      }
    }

    const apiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...processedMessages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "...";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("dialogue-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
