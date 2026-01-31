import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// DO NOT instantiate globally if we want dynamic keys
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const prisma = new PrismaClient();

export async function POST(req: Request) {
    let textInput = "";
    try {
        const { text } = await req.json();
        textInput = text;

        if (!text) {
            return NextResponse.json(
                { error: "Text input is required" },
                { status: 400 }
            );
        }

        // 1. Fetch Settings from DB
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['GEMINI_API_KEY', 'GEMINI_MODEL'] }
            }
        });

        const config: Record<string, string> = {};
        settings.forEach(s => config[s.key] = s.value);

        // 2. Determine Key and Model
        const apiKey = config['GEMINI_API_KEY'] || process.env.GEMINI_API_KEY;
        const modelName = config['GEMINI_MODEL'] || "gemini-2.0-flash";

        if (!apiKey) {
            console.error("No API Key found in DB or Env");
            return NextResponse.json(
                { error: "Server misconfiguration: No AI API Key" },
                { status: 500 }
            );
        }

        // 3. Initialize AI with dynamic key
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
      You are "Ibu Pintar", a smart shop assistant. 
      Analyze the following customer voice transcript and extract the intent.
      
      Transcript: "${text}"
      
      Output ONLY a JSON object with this structure (no markdown):
      {
        "action": "search" | "add_to_cart" | "chat",
        "params": {
          "query": string, // for search
          "product": string, // for add_to_cart
          "quantity": number // default 1 if not specified
        },
        "reply": string // A short, friendly, motherly response in Indonesian
      }

      Examples:
      - "Cariin beras" -> {"action": "search", "params": {"query": "beras"}, "reply": "Sebentar ya, Ibu carikan berasnya."}
      - "Mau beli gula 2 bungkus" -> {"action": "add_to_cart", "params": {"product": "gula", "quantity": 2}, "reply": "Oke, Ibu masukkan 2 bungkus gula ke keranjang ya."}
      - "Halo Bu" -> {"action": "chat", "params": {}, "reply": "Halo nak, mau belanja apa hari ini?"}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean markdown if present (handle code blocks more robustly)
        let jsonStr = textResponse.replace(/```json|```/g, "").trim();

        // Attempt to fix common JSON issues if any (simple approach)
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        const data = JSON.parse(jsonStr);
        console.log(`Gemini Output (${modelName}):`, data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Gemini API Error:", error);

        // Keep fallback logic just in case
        console.log("Falling back to simple search due to AI error:", textInput);

        return NextResponse.json({
            action: "search",
            params: { query: textInput },
            reply: "Maaf Ibu sedang sibuk, Ibu carikan manual saja ya."
        });
    }
}
