// YouTube API service for fetching educational videos
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || 'AIzaSyCVLt6lrrgZWhDofV_w9CqniOmb0nFm0Ag'; // Get from environment variable
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Add function to check API key validity
const checkApiKeyValidity = async (): Promise<boolean> => {
  try {
    console.log('Checking YouTube API key validity...');
    // Make a simple API call to test the key
    const testUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=test&maxResults=1&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API key validation failed:', errorData);
      
      if (errorData?.error?.errors) {
        const error = errorData.error.errors[0];
        if (error.reason === 'quotaExceeded') {
          console.error('YouTube API quota exceeded. Please try again tomorrow or use a different API key.');
          return false;
        } else if (error.reason === 'keyInvalid') {
          console.error('YouTube API key is invalid. Please check your key in the .env file.');
          return false;
        }
      }
      
      console.error(`API key check failed with status: ${response.status}`);
      return false;
    }
    
    console.log('YouTube API key is valid and working.');
    return true;
  } catch (error) {
    console.error('Error checking API key validity:', error);
    return false;
  }
};

// Define skill level-specific topics and terms for more targeted results
const skillLevelTopics = {
  Beginner: {
    topics: [
      'investing basics',
      'stock market for beginners',
      'personal finance fundamentals',
      'investment types explained',
      'beginner investing guide',
      'what is a stock',
      'how to start investing',
      'investing terminology'
    ],
    excludeTerms: 'advanced,technical analysis,day trading,options'
  },
  Intermediate: {
    topics: [
      'investment strategies',
      'portfolio diversification',
      'fundamental analysis',
      'dividend investing',
      'ETF investing strategies',
      'value investing',
      'growth investing',
      'investment risk management'
    ],
    excludeTerms: 'beginner,introduction,basics'
  },
  Advanced: {
    topics: [
      'technical analysis',
      'options trading',
      'derivatives explained',
      'advanced portfolio management',
      'quantitative investing',
      'financial statement analysis',
      'hedge fund strategies',
      'risk arbitrage',
      'advanced market concepts'
    ],
    excludeTerms: 'beginner,introduction,basics'
  }
};

interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface VideoSearchResponse {
  items: VideoItem[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  levelRelevance: number; // Added to indicate how relevant to the current level
}

/**
 * Get relevant financial education videos based on level and query
 * @param level 'Beginner' | 'Intermediate' | 'Advanced'
 * @param query Additional search terms to narrow down results
 * @param maxResults Maximum number of videos to return
 * @returns Promise with array of video results
 */
export const getEducationalVideos = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  query: string = '',
  maxResults: number = 6
): Promise<Video[]> => {
  // Select a topic based on the level, or use default topic if no match
  const levelConfig = skillLevelTopics[level] || skillLevelTopics.Beginner;
  
  // If user provided a specific query, use it with level-specific qualifiers
  // Otherwise, select a random topic from the level-specific topics
  let combinedQuery = query 
    ? `${level} ${query} investing finance education` 
    : `${level} ${levelConfig.topics[Math.floor(Math.random() * levelConfig.topics.length)]}`;

  console.log(`Searching YouTube for: ${combinedQuery}`);
  
  try {
    // First check if the API key is valid
    const isApiKeyValid = await checkApiKeyValidity();
    if (!isApiKeyValid) {
      console.error('Skipping YouTube API call due to invalid API key');
      return [];
    }
    
    // Add exclusion terms to avoid content for inappropriate levels  
    const excludeTerms = levelConfig.excludeTerms ? `&excludeTerms=${levelConfig.excludeTerms}` : '';
    
    // Enhanced API request with more parameters for better targeting
    const apiUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(combinedQuery)}${excludeTerms}&maxResults=${maxResults * 2}&type=video&relevanceLanguage=en&videoDuration=medium&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;
    console.log(`Making API request to: ${apiUrl.replace(YOUTUBE_API_KEY, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`YouTube API error (${response.status}):`, errorData);
      
      // Check for specific error types
      if (errorData?.error?.errors) {
        const error = errorData.error.errors[0];
        console.error(`YouTube API error reason: ${error.reason}, message: ${error.message}`);
      }
      
      throw new Error(`Failed to fetch videos from YouTube API: ${response.status}`);
    }
    
    const data: VideoSearchResponse = await response.json();
    console.log(`Received ${data.items?.length || 0} videos from YouTube API`);
    
    if (!data.items || data.items.length === 0) {
      console.warn('No videos found in YouTube API response');
      return [];
    }
    
    // Additional filtering to ensure quality results
    const videos = data.items
      .filter(item => {
        // Filter out videos with generic or misleading titles
        if (!item.snippet || !item.snippet.title) {
          return false;
        }
        
        const title = item.snippet.title.toLowerCase();
        return !title.includes('scam') && !title.includes('get rich quick');
      })
      .map(item => {
        // Calculate level relevance score based on title and description
        const titleLower = item.snippet.title.toLowerCase();
        const descLower = item.snippet.description ? item.snippet.description.toLowerCase() : '';
        const combinedText = `${titleLower} ${descLower}`;
        
        // Calculate relevance based on how many level-specific terms appear in content
        let levelRelevance = combinedText.includes(level.toLowerCase()) ? 10 : 0;
        
        // Check for topic matches
        levelConfig.topics.forEach(topic => {
          if (combinedText.includes(topic.toLowerCase())) {
            levelRelevance += 5;
          }
        });
        
        // Check for excluded terms
        if (levelConfig.excludeTerms) {
          levelConfig.excludeTerms.split(',').forEach(term => {
            if (combinedText.includes(term.toLowerCase())) {
              levelRelevance -= 5;
            }
          });
        }
        
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnail: item.snippet.thumbnails?.medium?.url || '',
          channelTitle: item.snippet.channelTitle || '',
          publishedAt: item.snippet.publishedAt || new Date().toISOString(),
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          levelRelevance: Math.max(1, levelRelevance) // Ensure minimum relevance of 1
        };
      })
      // Sort by level relevance and return top results
      .sort((a, b) => b.levelRelevance - a.levelRelevance)
      .slice(0, maxResults);
    
    console.log(`Returning ${videos.length} filtered videos from YouTube API`);
    return videos;
  } catch (error) {
    console.error('Error fetching educational videos:', error);
    return [];
  }
};

/**
 * Get videos from specifically curated educational playlists
 * @param level Skill level to filter by
 * @returns Promise with video results
 */
export const getCuratedEducationalVideos = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced'
): Promise<Video[]> => {
  // Curated playlist IDs for different skill levels
  const playlistIds = {
    Beginner: 'PL8uhW8cclCs4sjhnBGnFfA34JzpS7cYFy', // Two Cents: Personal Finance Basics
    Intermediate: 'PLI84Sf1yi0RRWGJ4f_6EqFFpFLm8m4lQq', // The Plain Bagel: Investment Fundamentals
    Advanced: 'PL0yJLUak0QxhuxDLEHGqUDg2idQmJ9Q_2'  // Patrick Boyle: Advanced Trading
  };
  
  const playlistId = playlistIds[level] || playlistIds.Beginner;
  console.log(`Fetching curated playlist: ${playlistId} for level: ${level}`);
  
  try {
    // Get playlist items
    const apiUrl = `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&maxResults=10&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
    console.log(`Making playlist API request: ${apiUrl.replace(YOUTUBE_API_KEY, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube playlist API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch videos from curated playlist: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.items?.length || 0} videos from playlist`);
    
    if (!data.items || data.items.length === 0) {
      console.warn('No videos found in playlist');
      return [];
    }
    
    // Define an interface for the playlist item
    interface PlaylistItem {
      snippet?: {
        resourceId?: {
          videoId?: string;
        };
        title?: string;
        description?: string;
        thumbnails?: {
          medium?: {
            url?: string;
          };
        };
        channelTitle?: string;
        publishedAt?: string;
      };
    }
    
    const videos = data.items
      .filter((item: PlaylistItem) => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId)
      .map((item: PlaylistItem) => ({
        id: item.snippet!.resourceId!.videoId!,
        title: item.snippet!.title || `${level} Investment Video`,
        description: item.snippet!.description || `Educational video for ${level} investors`,
        thumbnail: item.snippet!.thumbnails?.medium?.url || '',
        channelTitle: item.snippet!.channelTitle || '',
        publishedAt: item.snippet!.publishedAt || new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${item.snippet!.resourceId!.videoId!}`,
        levelRelevance: 10 // Curated content is highly relevant
      }));
    
    console.log(`Returning ${videos.length} videos from playlist`);
    return videos;
  } catch (error) {
    console.error('Error fetching curated videos:', error);
    return [];
  }
};

/**
 * Get personalized video recommendations based on user's skill level
 * @param level User's skill level: 'Beginner' | 'Intermediate' | 'Advanced'
 * @param interests Optional array of user interests to further personalize recommendations
 * @returns Promise with video results tailored to the user's level
 */
export const getPersonalizedRecommendations = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  interests: string[] = []
): Promise<Video[]> => {
  console.log(`Getting personalized recommendations for ${level} level with interests: ${interests.join(', ')}`);
  
  try {
    // Create a personalized query based on user's interests if available
    let personalizedQuery = '';
    
    if (interests && interests.length > 0) {
      // Combine up to 3 interests to avoid too specific queries
      personalizedQuery = interests.slice(0, 3).join(' ');
      console.log(`Created personalized query: ${personalizedQuery}`);
    }
    
    // First, verify the API key
    const isApiKeyValid = await checkApiKeyValidity();
    if (!isApiKeyValid) {
      console.warn('API key validation failed, skipping main API call and trying curated playlists');
      const playlistVideos = await getCuratedEducationalVideos(level);
      
      if (playlistVideos && playlistVideos.length > 0) {
        return playlistVideos;
      }
      
      console.warn('Curated playlists also failed, falling back to mock data');
      return getMockVideos(level);
    }
    
    // First try regular search API
    console.log('Attempting to fetch videos from YouTube Search API...');
    let videos = await getEducationalVideos(level, personalizedQuery, 5);
    
    // If no videos found, try curated playlists
    if (!videos || videos.length === 0) {
      console.log('No videos found from search API, trying curated playlists');
      videos = await getCuratedEducationalVideos(level);
    }
    
    // If still no videos, use backup method with generic topics
    if (!videos || videos.length === 0) {
      console.log('No videos from curated playlists either, trying generic search');
      videos = await getEducationalVideos('Beginner', 'stock market investing basics', 5);
    }
    
    // Fallback to mock data if all else fails
    if (!videos || videos.length === 0) {
      console.log('All API methods failed, using mock data');
      videos = getMockVideos(level);
    } else {
      console.log(`Successfully retrieved ${videos.length} real videos from YouTube`);
    }
    
    // Check if we're using mock data and log it
    if (videos.some(video => video.id.includes('beginner') || video.id.includes('intermediate') || video.id.includes('advanced'))) {
      console.warn('WARNING: Using mock video data. Please check your YouTube API key and quota.');
    }
    
    return videos;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    console.log('Returning mock data due to error');
    return getMockVideos(level);
  }
};

/**
 * Get mock videos when API fails
 */
function getMockVideos(level: 'Beginner' | 'Intermediate' | 'Advanced'): Video[] {
  console.log(`Generating mock videos for ${level} level`);
  
  const mockData: Record<string, Video[]> = {
    Beginner: [
      {
        id: 'beginner-1',
        title: 'Stock Market For Beginners 2023',
        description: 'Learn the basics of the stock market and how to start investing with confidence. Perfect for absolute beginners.',
        thumbnail: 'https://i.ytimg.com/vi/ZCFkWDdmXG8/mqdefault.jpg',
        channelTitle: 'Financial Education',
        publishedAt: '2023-01-15T14:30:00Z',
        url: 'https://www.youtube.com/watch?v=ZCFkWDdmXG8',
        levelRelevance: 10
      },
      {
        id: 'beginner-2',
        title: 'How To Invest For Beginners (2023 Step-by-Step)',
        description: 'A complete step-by-step guide to investing in the stock market for beginners with little money.',
        thumbnail: 'https://i.ytimg.com/vi/gFQNPmLKj1k/mqdefault.jpg',
        channelTitle: 'Graham Stephan',
        publishedAt: '2023-02-10T18:15:00Z',
        url: 'https://www.youtube.com/watch?v=gFQNPmLKj1k',
        levelRelevance: 9
      },
      {
        id: 'beginner-3',
        title: 'ETFs vs Mutual Funds Explained For Beginners',
        description: 'Understanding the difference between ETFs and mutual funds and which is better for new investors.',
        thumbnail: 'https://i.ytimg.com/vi/q_eQTXrEAxM/mqdefault.jpg',
        channelTitle: 'The Plain Bagel',
        publishedAt: '2023-03-22T12:45:00Z',
        url: 'https://www.youtube.com/watch?v=q_eQTXrEAxM',
        levelRelevance: 8
      },
      {
        id: 'beginner-4',
        title: 'How The Stock Market Works In 30 Minutes',
        description: 'A simple explanation of how the stock market works, including key terms and concepts every investor should know.',
        thumbnail: 'https://i.ytimg.com/vi/p7HKvqRI_Bo/mqdefault.jpg',
        channelTitle: 'The Swedish Investor',
        publishedAt: '2023-04-05T09:30:00Z',
        url: 'https://www.youtube.com/watch?v=p7HKvqRI_Bo',
        levelRelevance: 7
      },
      {
        id: 'beginner-5',
        title: 'Investment Accounts Explained: The Best Types For Beginners',
        description: 'Learn about the different types of investment accounts and which ones you should start with as a beginner.',
        thumbnail: 'https://i.ytimg.com/vi/xY2D0bi-150/mqdefault.jpg',
        channelTitle: 'Investing With Rose',
        publishedAt: '2023-05-12T15:20:00Z',
        url: 'https://www.youtube.com/watch?v=xY2D0bi-150',
        levelRelevance: 6
      }
    ],
    Intermediate: [
      {
        id: 'intermediate-1',
        title: 'Value Investing: Finding Undervalued Stocks',
        description: 'How to identify undervalued companies using fundamental analysis techniques from professional investors.',
        thumbnail: 'https://i.ytimg.com/vi/kZCIXc-xfQA/mqdefault.jpg',
        channelTitle: 'Learn to Invest',
        publishedAt: '2023-01-25T11:45:00Z',
        url: 'https://www.youtube.com/watch?v=kZCIXc-xfQA',
        levelRelevance: 10
      },
      {
        id: 'intermediate-2',
        title: 'Dividend Investing Strategy for Passive Income',
        description: 'Build a portfolio of quality dividend stocks for consistent passive income and long-term growth.',
        thumbnail: 'https://i.ytimg.com/vi/8YuWAZzGDwE/mqdefault.jpg',
        channelTitle: 'Joseph Carlson',
        publishedAt: '2023-02-18T14:30:00Z',
        url: 'https://www.youtube.com/watch?v=8YuWAZzGDwE',
        levelRelevance: 9
      },
      {
        id: 'intermediate-3',
        title: 'Technical Analysis: Chart Patterns That Work',
        description: 'Learn the most reliable chart patterns for predicting price movements in stocks and other assets.',
        thumbnail: 'https://i.ytimg.com/vi/eynxyoKgpng/mqdefault.jpg',
        channelTitle: 'Trading Rush',
        publishedAt: '2023-03-30T10:15:00Z',
        url: 'https://www.youtube.com/watch?v=eynxyoKgpng',
        levelRelevance: 8
      },
      {
        id: 'intermediate-4',
        title: 'Reading Financial Statements: Income Statement Deep Dive',
        description: 'How to analyze company income statements to make better investment decisions. Perfect for intermediate investors.',
        thumbnail: 'https://i.ytimg.com/vi/yZfZRcJ3zQo/mqdefault.jpg',
        channelTitle: 'New Money',
        publishedAt: '2023-04-22T16:20:00Z',
        url: 'https://www.youtube.com/watch?v=yZfZRcJ3zQo',
        levelRelevance: 7
      },
      {
        id: 'intermediate-5',
        title: 'Portfolio Allocation Strategies For Market Volatility',
        description: 'Learn how to position your portfolio to withstand market turbulence while maintaining growth potential.',
        thumbnail: 'https://i.ytimg.com/vi/JvEas_zZ4fM/mqdefault.jpg',
        channelTitle: 'Ben Felix',
        publishedAt: '2023-05-28T13:40:00Z',
        url: 'https://www.youtube.com/watch?v=JvEas_zZ4fM',
        levelRelevance: 6
      }
    ],
    Advanced: [
      {
        id: 'advanced-1',
        title: 'Options Trading Strategies for Consistent Returns',
        description: 'Advanced options strategies used by professional traders to generate income and hedge risk in any market.',
        thumbnail: 'https://i.ytimg.com/vi/SD7sw4oPVtU/mqdefault.jpg',
        channelTitle: 'Option Alpha',
        publishedAt: '2023-01-18T09:30:00Z',
        url: 'https://www.youtube.com/watch?v=SD7sw4oPVtU',
        levelRelevance: 10
      },
      {
        id: 'advanced-2',
        title: 'Quantitative Trading Strategies For Retail Investors',
        description: 'How to implement data-driven trading strategies using tools available to individual investors.',
        thumbnail: 'https://i.ytimg.com/vi/xIwPC94cXig/mqdefault.jpg',
        channelTitle: 'QuantPy',
        publishedAt: '2023-02-27T15:45:00Z',
        url: 'https://www.youtube.com/watch?v=xIwPC94cXig',
        levelRelevance: 9
      },
      {
        id: 'advanced-3',
        title: 'Factor Investing: Beyond Market Beta',
        description: 'Understanding how to use factor investing to target specific return drivers in sophisticated portfolios.',
        thumbnail: 'https://i.ytimg.com/vi/8aAYRHPhbVQ/mqdefault.jpg',
        channelTitle: 'Patrick Boyle',
        publishedAt: '2023-03-15T11:20:00Z',
        url: 'https://www.youtube.com/watch?v=8aAYRHPhbVQ',
        levelRelevance: 8
      },
      {
        id: 'advanced-4',
        title: 'Algorithmic Trading: Building Your First Strategy',
        description: 'Step-by-step guide to creating and backtesting a quantitative trading algorithm with Python.',
        thumbnail: 'https://i.ytimg.com/vi/xfzGZB4HhEE/mqdefault.jpg',
        channelTitle: 'Quantitative Finance',
        publishedAt: '2023-04-12T14:10:00Z',
        url: 'https://www.youtube.com/watch?v=xfzGZB4HhEE',
        levelRelevance: 7
      },
      {
        id: 'advanced-5',
        title: 'Advanced Portfolio Hedging Using VIX Derivatives',
        description: 'How professional investors use volatility instruments to protect their portfolios during market downturns.',
        thumbnail: 'https://i.ytimg.com/vi/a7DkT-e4Eac/mqdefault.jpg',
        channelTitle: 'Market Measures',
        publishedAt: '2023-05-20T17:30:00Z',
        url: 'https://www.youtube.com/watch?v=a7DkT-e4Eac',
        levelRelevance: 6
      }
    ]
  };
  
  return mockData[level] || mockData.Beginner;
}

export default {
  getEducationalVideos,
  getCuratedEducationalVideos,
  getPersonalizedRecommendations
};