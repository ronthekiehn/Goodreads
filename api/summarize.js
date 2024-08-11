const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { reviews } = req.body;

    const prompt = `You are review aggregator for the site Goodreads. You are to write a review consensus based off of the following top 10 reviews. Make it short and snappy, 3 sentences at most. Make sure to use phrases like 'Readers said', and make sure to focus on reader's opinions about the book, try not to summarize the book itself. Here are the reviews: ${reviews}`;

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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });
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