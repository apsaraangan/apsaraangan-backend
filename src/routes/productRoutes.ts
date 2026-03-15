import express from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { Product } from "../models/Product.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public: list products, optionally filtered
router.get("/", async (req, res) => {
  try {
    const { categorySlug, collection, readyToShip } = req.query;
    const filter: Record<string, unknown> = {};

    if (categorySlug) filter.categorySlug = categorySlug;
    if (collection) filter.collection = collection;
    if (readyToShip === "true") filter.readyToShip = true;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Public: single product with suggested items
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const suggested = await Product.find({
      categorySlug: product.categorySlug,
      _id: { $ne: product._id },
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({ product, suggested });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

async function processProductImages(req: express.Request): Promise<string[]> {
  const urls: string[] = [];

  const imageUrlsRaw = req.body.imageUrls;
  if (imageUrlsRaw) {
    try {
      const parsed = typeof imageUrlsRaw === "string" ? JSON.parse(imageUrlsRaw) : imageUrlsRaw;
      if (Array.isArray(parsed)) urls.push(...parsed.filter((u: unknown) => typeof u === "string"));
    } catch (_) {}
  }

  const singleUrl = req.body.imageUrl as string | undefined;
  if (singleUrl && !urls.includes(singleUrl)) urls.unshift(singleUrl);

  const filesObj = req.files as { image?: Express.Multer.File[]; images?: Express.Multer.File[] } | undefined;
  const allFiles: Express.Multer.File[] = [];
  if (filesObj?.image?.length) allFiles.push(...filesObj.image);
  if (filesObj?.images?.length) allFiles.push(...filesObj.images);
  for (const file of allFiles) {
    const b64 = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "apsara-angan/products",
    });
    urls.push(result.secure_url);
  }

  return urls;
}

async function processProductVideo(req: express.Request): Promise<string | undefined> {
  const filesObj = req.files as { video?: Express.Multer.File[] } | undefined;
  const file = filesObj?.video?.[0];
  if (!file) return undefined;

  const b64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "apsara-angan/products",
    resource_type: "video",
  });
  return result.secure_url;
}

// Admin: add a new product
router.post(
  "/admin",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
      if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        name,
        price,
        categorySlug,
        categoryName,
        collection,
        description,
        inStock,
        readyToShip,
        videoUrl,
      } = req.body;

      if (!name || !price || !categorySlug || !categoryName || !collection) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const imageUrls = await processProductImages(req);
      if (imageUrls.length === 0) {
        return res.status(400).json({ message: "At least one image is required" });
      }

      const uploadedVideoUrl = await processProductVideo(req);

      const product = await Product.create({
        name,
        price: Number(price),
        categorySlug,
        categoryName,
        collection,
        description,
        inStock: inStock !== undefined ? inStock === "true" || inStock === true : true,
        readyToShip: readyToShip === "true" || readyToShip === true,
        imageUrl: imageUrls[0],
        imageUrls,
        videoUrl: uploadedVideoUrl || videoUrl || undefined,
      });

      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create product" });
    }
  }
);

// Admin: update product
router.put(
  "/admin/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
      if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const {
        name,
        price,
        categorySlug,
        categoryName,
        collection,
        description,
        inStock,
        readyToShip,
        videoUrl,
      } = req.body;

      if (name !== undefined) product.name = name;
      if (price !== undefined) product.price = Number(price);
      if (categorySlug !== undefined) product.categorySlug = categorySlug;
      if (categoryName !== undefined) product.categoryName = categoryName;
      if (collection !== undefined) product.collection = collection;
      if (description !== undefined) product.description = description;
      if (inStock !== undefined) product.inStock = inStock === "true" || inStock === true;
      if (readyToShip !== undefined) product.readyToShip = readyToShip === "true" || readyToShip === true;
      const uploadedVideoUrl = await processProductVideo(req);
      if (uploadedVideoUrl) {
        product.videoUrl = uploadedVideoUrl;
      } else if (videoUrl !== undefined) {
        product.videoUrl = videoUrl || undefined;
      }

      const newImageUrls = await processProductImages(req);
      if (newImageUrls.length > 0) {
        product.imageUrls = newImageUrls;
        product.imageUrl = newImageUrls[0];
      }

      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update product" });
    }
  }
);

// Admin: delete product
router.delete("/admin/:id", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
    if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;

