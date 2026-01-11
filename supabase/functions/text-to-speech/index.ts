import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TextToSpeechRequest {
  text: string;
  lang?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, lang = "bg" }: TextToSpeechRequest = await req.json();
    
    if (!text || typeof text !== "string") {
      throw new Error("Text is required and must be a string");
    }
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      throw new Error("Text cannot be empty");
    }
    
    if (trimmedText.length > 200) {
      throw new Error("Text must be 200 characters or less");
    }

    console.log("Generating speech for:", trimmedText.substring(0, 50), "lang:", lang);

    // Use Google Translate TTS - free and excellent Bulgarian support
    const encodedText = encodeURIComponent(trimmedText);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      console.error("Google TTS error:", response.status);
      throw new Error(`Google TTS error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(arrayBuffer);

    console.log("Speech generated successfully, size:", arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
