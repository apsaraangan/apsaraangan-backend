import express from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { GalleryImage } from "../models/GalleryImage.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
  if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Public: list all gallery images
router.get("/", async (_req, res) => {
  try {
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch gallery images" });
  }
});

// Admin: seed gallery (must be before /admin to match /admin/seed)
router.post("/admin/seed", requireAdmin, async (_req, res) => {
  try {
    const seedData = [
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773151863/c6_weq1kd.jpg", alt: "Bridal jewellery set", customerName: "Priya's Wedding" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773151930/c7_iamfyb.jpg", alt: "Statement earrings", customerName: "Ananya's Special Day" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773152204/c8_ybgies.jpg", alt: "Haldi ceremony jewellery", customerName: "Simran's Haldi" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773152270/c9_oedfof.jpg", alt: "Elegant jewellery portrait", customerName: "Riya's Photoshoot" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773152338/c10_d7skum.jpg", alt: "Luxury bridal set", customerName: "Neha's Reception" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773152396/c11_pbvgzz.jpg", alt: "Hair jewellery", customerName: "Kavya's Mehendi" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773152447/c12_cwegvr.jpg", alt: "Kaleera set", customerName: "Aisha's Wedding" },
      { imageUrl: "https://res.cloudinary.com/dcs53etlz/image/upload/v1773152496/c13_ucsjlv.jpg", alt: "Hathphool design", customerName: "Diya's Celebration" },
    ];
    const created = await GalleryImage.insertMany(seedData);
    res.json({ message: `Seeded ${created.length} gallery images` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to seed gallery" });
  }
});

// Admin: add new gallery image
router.post("/admin", upload.single("image"), requireAdmin, async (req, res) => {
  try {
    const { alt, customerName, imageUrl } = req.body;

    if (!customerName) {
      return res.status(400).json({ message: "customerName is required" });
    }

    let finalImageUrl = imageUrl as string | undefined;

    if (!finalImageUrl) {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Image file or imageUrl is required" });
      }
      const b64 = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "apsara-angan/gallery",
      });
      finalImageUrl = result.secure_url;
    }

    const galleryImage = await GalleryImage.create({
      imageUrl: finalImageUrl,
      alt: alt || "Jewelry worn by customer",
      customerName,
    });

    res.status(201).json(galleryImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create gallery image" });
  }
});

// Admin: update gallery image
router.put("/admin/:id", upload.single("image"), requireAdmin, async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    const { alt, customerName, imageUrl } = req.body;

    if (customerName !== undefined) image.customerName = customerName;
    if (alt !== undefined) image.alt = alt;

    let finalImageUrl = imageUrl as string | undefined;
    if (!finalImageUrl && req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "apsara-angan/gallery",
      });
      finalImageUrl = result.secure_url;
    }
    if (finalImageUrl) image.imageUrl = finalImageUrl;

    await image.save();
    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update gallery image" });
  }
});

// Admin: delete gallery image
router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Gallery image not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete gallery image" });
  }
});

export default router;
