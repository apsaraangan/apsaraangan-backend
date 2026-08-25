import express from "express";
import { Cart } from "../models/Cart.js";

const router = express.Router();

function toCartItem(product: {
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
    quantity: 1,
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
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { sessionId, product } = req.body;
    if (!sessionId || !product) {
      return res.status(400).json({ message: "sessionId and product are required" });
    }
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }
    const productId = String(product.id ?? product._id);
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push(toCartItem(product));
    }
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.json([]);
    }
    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

router.put("/:productId/quantity", async (req, res) => {
  try {
    const { productId } = req.params;
    const { sessionId, quantity } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update quantity" });
  }
});

export default router;
