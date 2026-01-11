import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const analysis = response.choices[0]?.message?.content || "Unable to analyze the image.";

    return new Response(
      JSON.stringify({ analysis, model: "gpt-4o" }),
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
