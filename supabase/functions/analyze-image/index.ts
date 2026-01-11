import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, analysisType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Lovable API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt based on analysis type
    let prompt = "";
    switch (analysisType) {
      case "ocr":
        prompt = `Please extract ALL text visible in this image. Be thorough and include:
- All written text, signs, labels
- Any handwritten text
- Text in any language
- Numbers and symbols

Format the extracted text clearly, preserving the general layout if possible. If no text is found, say "No text detected in this image."`;
        break;
      case "describe":
        prompt = `Please describe this image in detail. Include:
- What objects, people, or scenes are visible
- Colors, compositions, and visual elements
- Any notable details or context
- The overall mood or setting

Be descriptive but concise.`;
        break;
      case "bulgarian":
        prompt = `Analyze this image for Bulgarian language learning purposes:

1. **Text Extraction**: Extract any Bulgarian text visible in the image
2. **Romanization**: Provide the romanized (Latin alphabet) pronunciation
3. **Translation**: Translate the Bulgarian text to English
4. **Pronunciation Guide**: Break down difficult words phonetically
5. **Grammar Notes**: Point out any interesting grammar patterns

If the image contains English or other text, provide the Bulgarian translation with pronunciation.
If no text is found, describe what you see and teach relevant Bulgarian vocabulary for the objects/scene.`;
        break;
      default: // "all" or any other value
        prompt = `Please analyze this image comprehensively:

1. **Description**: Describe what you see in the image (objects, people, scenes, colors)
2. **Text Extraction (OCR)**: Extract any visible text, signs, labels, or writing
3. **Context**: Provide any relevant context or interpretation
4. **Details**: Note any interesting or notable elements

Be thorough but well-organized in your response.`;
    }

    // Ensure proper base64 format
    const imageUrl = imageBase64.startsWith("data:") 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to analyze the image.";

    return new Response(
      JSON.stringify({ analysis, model: "google/gemini-2.5-flash" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
