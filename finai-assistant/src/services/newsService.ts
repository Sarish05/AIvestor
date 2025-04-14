// News API Integration for real-time financial news
// This uses the NewsAPI.org service

const NEWS_API_KEY = '9dbdf33740aa42e9a71925ef0c9d411d';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

/**
 * Fetch financial news based on a query
 * @param query Search term or phrase
 * @param pageSize Number of results to return (max 100)
 * @returns Promise with news articles
 */
export const fetchFinancialNews = async (
  query: string = 'finance OR stock OR market OR investment',
  pageSize: number = 10
): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(
        query
      )}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API request failed with status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching financial news:', error);
    return [];
  }
};

/**
 * Fetch top headlines for business category
 * @param country Country code (default 'in' for India)
 * @param pageSize Number of results to return
 * @returns Promise with news articles
 */
export const fetchBusinessHeadlines = async (
  country: string = 'in',
  pageSize: number = 10
): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?country=${country}&category=business&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API request failed with status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching business headlines:', error);
    return [];
  }
};

/**
 * Fetch news about a specific company or stock
 * @param companyName Name of the company or stock symbol
 * @param pageSize Number of results to return
 * @returns Promise with news articles
 */
export const fetchCompanyNews = async (
  companyName: string,
  pageSize: number = 5
): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(
        companyName
      )}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API request failed with status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data.articles;
  } catch (error) {
    console.error(`Error fetching news for ${companyName}:`, error);
    return [];
  }
};

/**
 * Format news articles as a string for the AI
 * @param articles Array of news articles
 * @returns Formatted string with news information
 */
export const formatNewsAsString = (articles: NewsArticle[]): string => {
  if (articles.length === 0) {
    return 'No recent news articles found.';
  }

  return articles
    .map(
      (article, index) => `
Article ${index + 1}: ${article.title}
Source: ${article.source.name}
Date: ${new Date(article.publishedAt).toLocaleString()}
${article.description ? `Summary: ${article.description}` : ''}
${article.url ? `URL: ${article.url}` : ''}
`
    )
    .join('\n');
}; 