const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

const EXTENSION_ORIGIN = 'chrome-extension://klpimcobgdoeidognoplffkaajjialid';
const MAX_REVIEWS_LENGTH = 50000;

export default async function handler(req, res) {
    const origin = req.headers.origin;

    if (origin !== EXTENSION_ORIGIN) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { reviews } = req.body || {};

    if (typeof reviews !== 'string' || reviews.length < 1 || reviews.length > MAX_REVIEWS_LENGTH) {
        return res.status(400).json({ error: 'Invalid reviews' });
    }

    const prompt = `You are review aggregator for the site Goodreads. You are to write a review consensus based off of the following top 10 reviews. Make it short and snappy, 3 sentences at most. Make sure to use phrases like 'Readers said'. Here are the reviews: ${reviews}`;

    // Access your API key as an environment variable
    const API_KEY = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // This seems like overkill, but some books were being blocked
    const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ]
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite',
        safetySettings,
        generationConfig: {
          maxOutputTokens: 256,
        },
      });
    try {
        const result = await model.generateContent(prompt,
            
        );
        const response = await result.response;
        const text = await response.text();
        res.status(200).json({ text: text });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
}
