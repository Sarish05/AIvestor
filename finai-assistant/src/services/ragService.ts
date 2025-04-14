import { searchDocuments, formatDocumentsAsString } from "./documentService";
import { fetchFinancialNews, formatNewsAsString } from "./newsService";

// Gemini API Key
const GEMINI_API_KEY = "AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g";

// System prompt template for the RAG implementation
const createSystemPrompt = (context: string, preferences: string, newsData: string, question: string): string => {
  return `You are AIvestor, a sophisticated financial assistant powered by the latest AI technology.
Your goal is to provide accurate, helpful and ethical financial advice.

Use the following pieces of retrieved context to answer the user's question. 
If you don't know the answer or the context doesn't provide the necessary information, 
just say that you don't know, don't try to make up an answer.

Context: ${context}

User preferences: ${preferences}

Latest financial news: ${newsData}

When answering, provide thoughtful analysis and clear explanations. 
Reference specific information from the context and news when applicable.
Always present information clearly and avoid financial jargon unless necessary.

User's question: ${question}`;
};

// Process a query through the RAG approach
export const processQuery = async (
  query: string, 
  userPreferences: string = ""
): Promise<string> => {
  try {
    // 1. Search for relevant documents
    const docs = await searchDocuments(query);
    
    // 2. Format documents as context string
    const context = formatDocumentsAsString(docs);
    
    // 3. Fetch relevant news
    const newsArticles = await fetchFinancialNews(query, 3);
    const newsData = formatNewsAsString(newsArticles);
    
    // 4. Create the prompt with context and news
    const prompt = createSystemPrompt(context, userPreferences, newsData, query);
    
    // 5. Call Gemini API directly
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error in RAG process:", error);
    return "I'm sorry, I encountered an error processing your request. Please try again.";
  }
}; 