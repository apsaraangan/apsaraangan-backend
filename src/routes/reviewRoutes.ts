import express from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { Review } from "../models/Review.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

async function resolveReviewImageUrl(
  req: express.Request
): Promise<string | undefined> {
  const imageUrl = req.body.imageUrl as string | undefined;
  if (imageUrl?.trim()) return imageUrl.trim();

  const file = req.file;
  if (!file) return undefined;

  const b64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "apsara-angan/reviews",
  });
  return result.secure_url;
}

// Get all active reviews
router.get("/", async (_req, res) => {
  try {
    const reviews = await Review.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("customerName message imageUrl rating createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Add new review (admin function)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { customerName, message, rating } = req.body;
    const imageUrl = await resolveReviewImageUrl(req);

    if (!customerName) {
      return res.status(400).json({ error: "Customer name is required" });
    }

    if (!imageUrl && !message?.trim()) {
      return res.status(400).json({
        error: "WhatsApp screenshot (image upload or URL) is required",
      });
    }

    const review = new Review({
      customerName,
      message: message?.trim() || undefined,
      imageUrl,
      rating: rating ? Number(rating) : 5,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Update review (admin function)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, message, rating, isActive } = req.body;
    const uploadedImageUrl = await resolveReviewImageUrl(req);

    const updates: Record<string, unknown> = {};
    if (customerName !== undefined) updates.customerName = customerName;
    if (message !== undefined) updates.message = message?.trim() || undefined;
    if (rating !== undefined) updates.rating = Number(rating);
    if (isActive !== undefined) updates.isActive = isActive === "true" || isActive === true;
    if (uploadedImageUrl) updates.imageUrl = uploadedImageUrl;

    const review = await Review.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Delete review (admin function)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Get all reviews (including inactive - admin function)
router.get("/admin/all", async (_req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .select("customerName message imageUrl rating isActive createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
