import OpenAI from "openai";
import jwt from "jsonwebtoken";
import cors from "../lib/cors";

const OPENAI_SECRET = process.env.OPENAI_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

const openai = new OpenAI({
  apiKey: OPENAI_SECRET,
});

export default async function handler(req, res) {
  await new Promise((resolve, reject) =>
    cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve()))
  );

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid messages format" });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    res.status(200).json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}