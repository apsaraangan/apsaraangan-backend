import express from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { SubcategoryCover } from "../models/SubcategoryCover.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
  if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

const SEED_DATA = [
  {
    slug: "resin-full-sets",
    collection: "resin" as const,
    title: "Resin full sets",
    path: "/category/resin-full-sets",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773162980/WhatsApp_Image_2026-03-10_at_6.30.26_PM_hur9kd.jpg",
    order: 0,
  },
  {
    slug: "resin-half-set",
    collection: "resin" as const,
    title: "Resin Half Set",
    path: "/category/resin-half-set",
    imageUrl:
      "https://res.cloudinary.com/drvug594q/image/upload/v1783686627/Screenshot_2026-07-10_at_3.26.36_PM_s6pnaz.png",
    order: 1,
  },
  {
    slug: "resin-neckalce",
    collection: "resin" as const,
    title: "Resin neckalce",
    path: "/category/resin-neckalce",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773163045/WhatsApp_Image_2026-03-10_at_6.30.18_PM_ytlahl.jpg",
    order: 2,
  },
  {
    slug: "resin-earrings",
    collection: "resin" as const,
    title: "Resin earrings",
    path: "/category/resin-earrings",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773163122/WhatsApp_Image_2026-03-10_at_6.31.00_PM_kk7h0d.jpg",
    order: 3,
  },
  {
    slug: "resin-hathphool-rings",
    collection: "resin" as const,
    title: "Resin hathphool & rings",
    path: "/category/resin-hathphool-rings",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773163178/WhatsApp_Image_2026-03-10_at_6.30.30_PM_x1bvtk.jpg",
    order: 4,
  },
  {
    slug: "hair-bindi",
    collection: "resin" as const,
    title: "Hair bindi",
    path: "/category/hair-bindi",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773163374/WhatsApp_Image_2026-03-10_at_6.30.57_PM_ko28pb.jpg",
    order: 5,
  },
  {
    slug: "resin-kaleeras",
    collection: "resin" as const,
    title: "Resin kaleeras",
    path: "/category/resin-kaleeras",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773163663/WhatsApp_Image_2026-03-10_at_6.31.37_PM_aaxjcc.jpg",
    order: 6,
  },
  {
    slug: "resin-earchains",
    collection: "resin" as const,
    title: "Resin earchains",
    path: "/category/resin-earchains",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773167384/WhatsApp_Image_2026-03-10_at_11.24.17_PM_g86tos.jpg",
    order: 7,
  },
  {
    slug: "resin-hair-accessories",
    collection: "resin" as const,
    title: "Hair Accessories",
    path: "/category/resin-hair-accessories",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773163827/Screenshot_2026-03-10_225953_j4b9s9.png",
    order: 8,
  },
  {
    slug: "hair-vein",
    collection: "traditional" as const,
    title: "Hair vein",
    path: "/category/hair-vein",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773164264/WhatsApp_Image_2026-03-10_at_6.31.36_PM_nahrx8.jpg",
    order: 0,
  },
  {
    slug: "mom-to-be-sets",
    collection: "traditional" as const,
    title: "Mom-to-be sets",
    path: "/category/mom-to-be-sets",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773164542/WhatsApp_Image_2026-03-10_at_6.32.21_PM_axfgpg.jpg",
    order: 1,
  },
  {
    slug: "Kaleeras",
    collection: "traditional" as const,
    title: "Kaleeras",
    path: "/category/Kaleeras",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773164411/WhatsApp_Image_2026-03-10_at_6.31.37_PM_1_juytbl.jpg",
    order: 2,
  },
  {
    slug: "ear-chains",
    collection: "traditional" as const,
    title: "Ear chains",
    path: "/category/ear-chains",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773164610/WhatsApp_Image_2026-03-10_at_6.31.53_PM_fqfpno.jpg",
    order: 3,
  },
  {
    slug: "hair-pins-studs",
    collection: "traditional" as const,
    title: "Hair Accessories",
    path: "/category/hair-pins-studs",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773164861/Screenshot_2026-03-10_231703_bh215n.png",
    order: 4,
  },
  {
    slug: "nose-pins",
    collection: "traditional" as const,
    title: "Nose pins",
    path: "/category/nose-pins",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773167617/Screenshot_2026-03-11_000302_g7lpm3.png",
    order: 5,
  },
  {
    slug: "mundavlya",
    collection: "traditional" as const,
    title: "Mundavlya",
    path: "/category/mundavlya",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773167708/Screenshot_2026-03-11_000434_mdvwkz.png",
    order: 6,
  },
  {
    slug: "earcuffs",
    collection: "traditional" as const,
    title: "Ear cuffs",
    path: "/category/earcuffs",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773167899/earcuffs_aqtzqv.jpg",
    order: 7,
  },
  {
    slug: "hathphool",
    collection: "traditional" as const,
    title: "Hathphool",
    path: "/category/hathphool",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773168003/hathphool_jrkdav.webp",
    order: 8,
  },
  {
    slug: "sheesphool-mathapatti",
    collection: "traditional" as const,
    title: "Sheesphool & Mathapatti",
    path: "/category/sheesphool-mathapatti",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773168231/matthapatti_o3i5c6.webp",
    order: 9,
  },
  {
    slug: "necklace-sets",
    collection: "traditional" as const,
    title: "Necklace sets",
    path: "/category/necklace-sets",
    imageUrl:
      "https://res.cloudinary.com/dcs53etlz/image/upload/v1773176749/necklace_mlowxz.webp",
    order: 10,
  },
];

// Public: list all subcategory covers
router.get("/", async (_req, res) => {
  try {
    const covers = await SubcategoryCover.find().sort({ collection: 1, order: 1 });
    res.json(covers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subcategory covers" });
  }
});

// Admin: seed covers from current static images
router.post("/admin/seed", requireAdmin, async (_req, res) => {
  try {
    let created = 0;
    let updated = 0;

    for (const item of SEED_DATA) {
      const existing = await SubcategoryCover.findOne({ slug: item.slug });
      if (existing) {
        existing.set({
          title: item.title,
          path: item.path,
          collection: item.collection,
          imageUrl: item.imageUrl,
          order: item.order,
        });
        await existing.save();
        updated++;
      } else {
        await SubcategoryCover.create(item);
        created++;
      }
    }

    res.json({
      message: `Seeded subcategory covers (${created} created, ${updated} updated)`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to seed subcategory covers" });
  }
});

// Admin: update cover for a subcategory (upsert)
router.put("/admin/:slug", upload.single("image"), requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const { imageUrl, title, path, collection } = req.body;

    const seedItem = SEED_DATA.find((item) => item.slug === slug);

    let finalImageUrl = imageUrl as string | undefined;

    if (!finalImageUrl && req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "apsara-angan/subcategory-covers",
      });
      finalImageUrl = result.secure_url;
    }

    if (!finalImageUrl) {
      const existing = await SubcategoryCover.findOne({ slug });
      if (!existing) {
        return res.status(400).json({ message: "Image file or imageUrl is required" });
      }
      finalImageUrl = existing.imageUrl;
    }

    const cover = await SubcategoryCover.findOneAndUpdate(
      { slug },
      {
        slug,
        title: title || seedItem?.title || slug,
        path: path || seedItem?.path || `/category/${slug}`,
        collection: collection || seedItem?.collection || "resin",
        imageUrl: finalImageUrl,
        order: seedItem?.order ?? 0,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(cover);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update subcategory cover" });
  }
});

export default router;
