import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import prisma from "../../lib/prisma";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables");
}

const openai = new OpenAI({ apiKey });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId, prompt } = req.body;

  const userIdInt = parseInt(userId, 10);

  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: "Invalid userId, must be a number." });
  }

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: userIdInt },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userIdInt,
          username: `user_${userIdInt}`,
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage || !responseMessage.content) {
      throw new Error("OpenAI response message is missing.");
    }

    const response = responseMessage.content;

    await prisma.chatHistory.create({
      data: { userId: userIdInt, prompt, response },
    });

    return res.status(200).json({ response });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : error,
    });
  }
}
