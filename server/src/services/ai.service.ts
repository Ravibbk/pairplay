import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import {
  aiGeneratedQuestionsResponseSchema,
  aiGeneratedQuestionItemSchema,
} from '../schemas/ai.schema.js';
import { z } from 'zod';

export class AiService {
  /**
   * Generates personalized couple questions.
   * Uses Gemini API when GEMINI_API_KEY is present and valid.
   * Gracefully and safely falls back to curated database questions on missing key, timeout, or schema failure.
   */
  static async generateQuestions(options: {
    category: string;
    count?: number;
    interests?: string[];
    partnerName?: string;
  }) {
    const count = options.count || 5;
    const category = options.category || 'Deep Connections';

    if (env.GEMINI_API_KEY) {
      try {
        const aiResult = await this.callGeminiApi({
          category,
          count,
          interests: options.interests,
          partnerName: options.partnerName,
        });
        if (aiResult && aiResult.questions.length >= count) {
          return {
            source: 'gemini_ai',
            questions: aiResult.questions.slice(0, count),
          };
        }
      } catch (error) {
        console.warn('⚠️ Gemini AI API call failed or timed out. Gracefully switching to curated questions fallback:', error);
      }
    }

    // Curated Fallback
    const fallbackQuestions = await this.getCuratedFallbackQuestions(category, count);
    return {
      source: 'curated_fallback',
      questions: fallbackQuestions,
    };
  }

  /**
   * Calls Google Gemini REST API with structured JSON output instructions
   */
  private static async callGeminiApi(options: {
    category: string;
    count: number;
    interests?: string[];
    partnerName?: string;
  }): Promise<{ questions: Array<{ text: string; category: string }> } | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const prompt = `You are an expert relationship psychologist and thoughtful game designer for couples.
Generate exactly ${options.count} warm, engaging, emotionally resonant questions for a couple to answer together in the game "How Well Do You Know Me?".
Category: "${options.category}".
${options.interests && options.interests.length > 0 ? `Shared interests: ${options.interests.join(', ')}.` : ''}
${options.partnerName ? `Partner name context: ${options.partnerName}.` : ''}

Rules:
1. Questions must be playful, thoughtful, emotionally safe, and spark intimate conversation.
2. Avoid invasive, overly graphic, toxic, or confrontational prompts.
3. Keep each question concise, punchy, and under 150 characters.
4. Output MUST be strictly valid JSON matching this schema:
{
  "questions": [
    { "text": "Question text here?", "category": "${options.category}" }
  ]
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Gemini API HTTP status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No candidate content returned by Gemini API');
      }

      const parsedJson = JSON.parse(text);
      const validated = aiGeneratedQuestionsResponseSchema.parse(parsedJson);
      return validated;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  /**
   * Fetches curated fallback questions from database
   */
  static async getCuratedFallbackQuestions(category: string, count: number = 5) {
    let questions = await prisma.question.findMany({
      where: { category },
      take: count * 2,
    });

    if (questions.length < count) {
      // If category has fewer questions, fetch any questions to guarantee count
      const more = await prisma.question.findMany({
        take: count * 3,
      });
      questions = [...questions, ...more];
    }

    // Shuffle
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((q) => ({
      text: q.text,
      category: q.category,
    }));
  }

  /**
   * Returns daily spark question
   */
  static async getDailySpark(coupleId?: string | null) {
    const today = new Date().toISOString().split('T')[0];

    // Check if daily spark already exists for today
    let dailySpark = await prisma.dailySpark.findFirst({
      where: {
        date: today,
        coupleId: coupleId || null,
      },
    });

    if (!dailySpark) {
      // Pick a curated question
      const randomQuestions = await prisma.question.findMany({ take: 20 });
      const picked =
        randomQuestions.length > 0
          ? randomQuestions[Math.floor(Math.random() * randomQuestions.length)]
          : { text: "What is one small moment from today you'd love to share?", category: "Daily Habits" };

      dailySpark = await prisma.dailySpark.create({
        data: {
          coupleId: coupleId || null,
          date: today,
          questionText: picked.text,
          category: picked.category,
          isAiGenerated: false,
        },
      });
    }

    return dailySpark;
  }
}
