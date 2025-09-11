//import express from "express";
//import { handleLLMQuery } from "../src/llm/service";  // needs updating
//import { z } from "zod";

const express = require("express");
const { handleLLMQuery } = require("../llm/service");
const { z } = require("zod");

const router = express.Router();

const QuerySchema = z.object({
  meterId: z.string(),
  question: z.string().min(3),
});

router.post("/query", async (req, res) => {
  try {
    const validated = QuerySchema.parse(req.body);
    const answer = await handleLLMQuery(validated);
    res.json({ answer });
  } catch (error) {
    console.error("LLM Error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;
