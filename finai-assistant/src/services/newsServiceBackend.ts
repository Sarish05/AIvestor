// Backend-based News service for making API calls through our backend
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

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
 * Helper function to make API calls to our backend
 */
const apiCall = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/news${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling backend news API ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Helper function to make POST API calls to our backend
 */
const apiPostCall = async (endpoint: string, data: any): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/news${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling backend news API ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch financial news based on a query through backend
 * @param query Search term or phrase
 * @param pageSize Number of results to return (max 100)
 * @returns Promise with news articles
 */
export const fetchFinancialNews = async (
  query: string = 'finance OR stock OR market OR investment',
  pageSize: number = 10
): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching financial news from backend for query: ${query}`);
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('pageSize', pageSize.toString());
    
    return await apiCall(`/financial?${params.toString()}`);
  } catch (error) {
    console.error('Error fetching financial news from backend:', error);
    return [];
  }
};

/**
 * Fetch top headlines for business category through backend
 * @param country Country code (default 'in' for India)
 * @param pageSize Number of results to return
 * @returns Promise with news articles
 */
export const fetchBusinessHeadlines = async (
  country: string = 'in',
  pageSize: number = 10
): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching business headlines from backend for country: ${country}`);
    const params = new URLSearchParams();
    params.append('country', country);
    params.append('pageSize', pageSize.toString());
    
    return await apiCall(`/business-headlines?${params.toString()}`);
  } catch (error) {
    console.error('Error fetching business headlines from backend:', error);
    return [];
  }
};

/**
 * Fetch news about a specific company or stock through backend
 * @param companyName Name of the company or stock symbol
 * @param pageSize Number of results to return
 * @returns Promise with news articles
 */
export const fetchCompanyNews = async (
  companyName: string,
  pageSize: number = 5
): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching company news from backend for: ${companyName}`);
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    
    return await apiCall(`/company/${encodeURIComponent(companyName)}?${params.toString()}`);
  } catch (error) {
    console.error(`Error fetching news for ${companyName} from backend:`, error);
    return [];
  }
};

/**
 * Format news articles as a string for the AI through backend
 * @param articles Array of news articles
 * @returns Formatted string with news information
 */
export const formatNewsAsString = async (articles: NewsArticle[]): Promise<string> => {
  try {
    console.log('Formatting news articles via backend');
    const response = await apiPostCall('/format', { articles });
    return response.formattedNews;
  } catch (error) {
    console.error('Error formatting news via backend:', error);
    // Fallback to frontend formatting
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
  }
};
