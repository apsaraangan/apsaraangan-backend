import express from "express";
import { Customer } from "../models/Customer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const customer = await Customer.findOne({ sessionId }).lean();
    if (!customer) {
      return res.status(204).end();
    }

    return res.json({
      name: customer.name,
      number: customer.number,
      defaultAddress: customer.defaultAddress,
      otherAddresses: customer.otherAddresses ?? [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch customer details" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { sessionId, customer } = req.body as {
      sessionId?: string;
      customer?: {
        name?: string;
        number?: string;
        defaultAddress?: string;
        otherAddresses?: string[];
      };
    };

    if (!sessionId || !customer) {
      return res
        .status(400)
        .json({ message: "sessionId and customer are required" });
    }

    const { name, number, defaultAddress } = customer;
    if (!name || !number || !defaultAddress) {
      return res.status(400).json({
        message: "name, number and defaultAddress are required",
      });
    }

    const payload = {
      name,
      number,
      defaultAddress,
      otherAddresses: customer.otherAddresses ?? [],
    };

    const saved = await Customer.findOneAndUpdate(
      { sessionId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      name: saved.name,
      number: saved.number,
      defaultAddress: saved.defaultAddress,
      otherAddresses: saved.otherAddresses ?? [],
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to save customer details" });
  }
});

export default router;

