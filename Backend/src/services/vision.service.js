import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Analyzes a food image URL using Gemini Vision.
 * Returns: { quality: "FRESH"|"MEDIUM"|"UNSAFE", reason: string, confidence: number }
 *
 * Gracefully degrades to FRESH if API key is missing or call fails,
 * so the food upload flow is never blocked by vision errors.
 */
export async function analyzeFoodQuality(imageUrl) {
  if (!process.env.GEMINI_API_KEY) {
    console.log("⚠️  GEMINI_API_KEY not set — skipping vision analysis.");
    return { quality: "FRESH", reason: "Vision skipped (no API key)", confidence: 0 };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch image from Cloudinary and convert to base64 inline data
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    const prompt = `You are a certified food safety inspector. Analyze this food image carefully.

Classify the food as exactly one of:
- FRESH: Food looks fresh, good color, no visible spoilage, safe to consume
- MEDIUM: Food shows some signs of aging (slight discoloration, wilting) but may still be edible
- UNSAFE: Clear signs of spoilage — mold, rot, very bad color, contamination

Respond ONLY with a valid JSON object, no other text:
{"quality": "FRESH", "reason": "one sentence explanation", "confidence": 0.95}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ]);

    const text = result.response.text().trim();

    // Safely extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const quality = ["FRESH", "MEDIUM", "UNSAFE"].includes(parsed.quality)
        ? parsed.quality
        : "FRESH";
      return {
        quality,
        reason: parsed.reason || "Analysis complete",
        confidence: Number(parsed.confidence) || 0.8,
      };
    }

    return { quality: "FRESH", reason: "Could not parse vision response", confidence: 0 };
  } catch (err) {
    console.error("🔴 Gemini Vision Error:", err.message);
    // Non-blocking: return safe default so food upload still succeeds
    return { quality: "FRESH", reason: "Vision analysis failed", confidence: 0 };
  }
}
