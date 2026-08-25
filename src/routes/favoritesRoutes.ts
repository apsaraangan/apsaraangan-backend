import express from "express";
import { Favorite } from "../models/Favorite.js";

const router = express.Router();

function toFavoriteItem(product: {
  id?: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  inStock?: boolean;
}) {
  return {
    productId: String(product.id),
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
    inStock: product.inStock,
  };
}

router.get("/", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ message: "sessionId is required" });
    }
    let fav = await Favorite.findOne({ sessionId });
    if (!fav) {
      fav = await Favorite.create({ sessionId, items: [] });
    }
    res.json(fav.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { sessionId, product } = req.body;
    if (!sessionId || !product) {
      return res.status(400).json({ message: "sessionId and product are required" });
    }
    let fav = await Favorite.findOne({ sessionId });
    if (!fav) {
      fav = await Favorite.create({ sessionId, items: [] });
    }
    const productId = String(product.id ?? product._id);
    if (!fav.items.some((i) => i.productId === productId)) {
      fav.items.push(toFavoriteItem(product));
      await fav.save();
    }
    res.json(fav.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to favorites" });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    const fav = await Favorite.findOne({ sessionId });
    if (!fav) {
      return res.json([]);
    }
    fav.items = fav.items.filter((i) => i.productId !== productId);
    await fav.save();
    res.json(fav.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove from favorites" });
  }
});

export default router;
