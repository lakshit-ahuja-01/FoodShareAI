import express from "express";
import Food from "../models/Food.js";
import Ngo from "../models/Ngo.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.middleware.js";
import { findBestNGO } from "../services/matching.service.js";
import { analyzeFoodQuality } from "../services/vision.service.js";
import { emitToUser } from "../services/socket.service.js";
import { createUploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

// 🔹 NLP urgency analyzer
function analyzeUrgencyNLP(description) {
  if (!description) return 0;
  const text = description.toLowerCase();
  const urgentKeywords = ["urgent", "hurry", "fast", "spoil", "emergency", "soon", "tonight", "perishable"];
  let scoreBoost = 0;
  urgentKeywords.forEach((word) => {
    if (text.includes(word)) scoreBoost += 20;
  });
  return Math.min(scoreBoost, 50);
}

// ✅ GET ALL FOOD
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find()
      .populate("matchedNgo", "name")
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    console.error("GET FOOD ERROR:", err);
    res.status(500).json({ message: "Error fetching food listings" });
  }
});

// ✅ ADD FOOD — with Gemini Vision quality check + AI matching + Socket.io notification
router.post("/add", protect, createUploadMiddleware().array("images", 4), async (req, res, next) => {
  try {
    console.log("🚩 STEP 1: Entering Food Add Route");

    const { title, description, category, quantityValue, quantityUnit, expiryTime, lat, lng } = req.body;
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    // ─── STEP 2: AI Food Quality Detection ──────────────────────────────────
    let aiQuality = "FRESH";
    let aiQualityReason = "No image provided";
    let aiConfidence = 0;

    if (imageUrls.length > 0) {
      console.log("🤖 STEP 2: Running Gemini Vision quality check on first image...");
      const visionResult = await analyzeFoodQuality(imageUrls[0]);
      aiQuality = visionResult.quality;
      aiQualityReason = visionResult.reason;
      aiConfidence = visionResult.confidence;
      console.log(`🔍 Vision Result: ${aiQuality} (${(aiConfidence * 100).toFixed(0)}%) — ${aiQualityReason}`);

      // Block UNSAFE food immediately
      if (aiQuality === "UNSAFE") {
        console.warn("🚫 Food blocked by AI quality check — marked as UNSAFE");
        return res.status(400).json({
          success: false,
          message: "❌ AI Quality Check Failed: The uploaded food image shows signs of spoilage. Please only donate safe, consumable food.",
          aiQuality,
          aiQualityReason,
        });
      }
    }
    // ─── STEP 3: Create Food Document ────────────────────────────────────────
    const food = new Food({
      title,
      description,
      category,
      quantity: { value: Number(quantityValue), unit: quantityUnit },
      expiryTime: new Date(expiryTime),
      images: imageUrls,
      quality: aiQuality,
      aiQualityReport: {
        reason: aiQualityReason,
        confidence: aiConfidence,
        analyzedAt: imageUrls.length > 0 ? new Date() : undefined,
      },
      donor: req.user._id,
      pickupLocation: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    });

    console.log(`🚩 STEP 3: Category: ${food.category}, Coords: ${food.pickupLocation.coordinates}, Quality: ${aiQuality}`);

    // ─── STEP 4: Geo Query for nearby NGOs ───────────────────────────────────
    const availableNgos = await Ngo.find({
      verified: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 50000, // 50km
        },
      },
    });

    console.log(`🚩 STEP 4: Found ${availableNgos.length} verified NGOs within 50km`);

    // ─── STEP 5: AI Matching ──────────────────────────────────────────────────
    if (availableNgos.length > 0) {
      const nlpBoost = analyzeUrgencyNLP(description);
      const result = await findBestNGO(food, availableNgos, nlpBoost);

      if (result && result.bestNgo) {
        console.log("✅ MATCH SUCCESS:", result.bestNgo.name);
        food.matchedNgo = result.bestNgo._id;
        food.status = "matched";

        // Persist notification in MongoDB for the NGO owner
        const notif = await Notification.create({
          userId: result.bestNgo.userId,
          type: "matched",
          title: "🍱 New Food Match!",
          message: `${food.title} (${food.quantity.value}${food.quantity.unit} of ${food.category}) has been matched to your organization and is ready for pickup.`,
          metadata: { foodId: food._id, donorId: req.user._id },
        });

        // Real-time socket push to the NGO owner (if they're online)
        emitToUser(result.bestNgo.userId.toString(), "food:matched", {
          title: notif.title,
          message: notif.message,
          foodId: food._id,
          notificationId: notif._id,
        });
      } else {
        console.log("⚠️ AI Matcher: No suitable NGO found (score too low or category mismatch)");
      }
    } else {
      console.log("⚠️ No NGOs found in this geographic area.");
    }

    // ─── STEP 6: Save & Respond ───────────────────────────────────────────────
    await food.save();
    console.log("🚩 STEP 6: Food saved. Status:", food.status, "| Quality:", food.quality);

    res.status(201).json({
      success: true,
      food,
      aiQualityReport: { quality: aiQuality, reason: aiQualityReason, confidence: aiConfidence },
    });

  } catch (err) {
    console.error("❌ ROUTE FATAL ERROR:", err.stack);
    next(err);
  }
});

// ✅ GET USER'S SCHEDULED PICKUPS
router.get("/my-schedules", protect, async (req, res) => {
  try {
    const schedules = await Food.find({ donor: req.user._id, status: "matched" }).populate("matchedNgo");
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schedules" });
  }
});

export default router;