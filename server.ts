import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post("/api/translate-word", async (req, res) => {
    try {
      const { word, context, lang } = req.body;
      
      const prompt = `You are a helpful language learning assistant. 
Translate the word "${word}" based on its context: "${context}".
The source language is ${lang}.
Return a JSON object with the following strictly defined fields:
- "word": The original word.
- "translation": The translation in Traditional Chinese.
- "pos": The part of speech.
- "grammar_note": A brief grammar note (e.g., gender, case, conjugation).
- "example": A short example sentence using the word in ${lang} and its translation in Chinese.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              translation: { type: Type.STRING },
              pos: { type: Type.STRING },
              grammar_note: { type: Type.STRING },
              example: { type: Type.STRING },
            },
            required: ["word", "translation", "pos", "grammar_note", "example"],
          },
        },
      });

      const text = response.text;
      if (text) {
        res.json(JSON.parse(text));
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error: any) {
      console.error("Error in /api/translate-word:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/translate-sentence", async (req, res) => {
    try {
      const { sentence, context, lang } = req.body;

      const prompt = `You are a helpful language learning assistant.
Translate the following sentence and analyze its grammatical structure.
Sentence: "${sentence}"
Context: "${context}"
Language: ${lang}

Return a JSON object with:
- "translation": The full translation in Traditional Chinese.
- "grammar_note": A breakdown of the grammatical structure or key phrasing points in Traditional Chinese.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              grammar_note: { type: Type.STRING },
            },
            required: ["translation", "grammar_note"],
          },
        },
      });

      const text = response.text;
      if (text) {
        res.json(JSON.parse(text));
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error: any) {
      console.error("Error in /api/translate-sentence:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
