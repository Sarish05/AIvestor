// Backend-based YouTube service for making API calls through our backend
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

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
 * Helper function to make API calls to our backend
 */
const apiCall = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/youtube${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling backend YouTube API ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Helper function to make POST API calls to our backend
 */
const apiPostCall = async (endpoint: string, data: any): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/youtube${endpoint}`, {
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
    console.error(`Error calling backend YouTube API ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Get relevant financial education videos based on level and query through backend
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
  try {
    console.log(`Fetching educational videos from backend for level: ${level}, query: ${query}`);
    const params = new URLSearchParams();
    params.append('level', level);
    if (query) params.append('q', query);
    params.append('maxResults', maxResults.toString());
    
    return await apiCall(`/educational?${params.toString()}`);
  } catch (error) {
    console.error('Error fetching educational videos from backend:', error);
    return [];
  }
};

/**
 * Get curated educational videos from specific channels through backend
 * @param level User's skill level
 * @param maxResults Maximum number of videos to return
 * @returns Promise with array of curated video results
 */
export const getCuratedEducationalVideos = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner',
  maxResults: number = 6
): Promise<Video[]> => {
  try {
    console.log(`Fetching curated educational videos from backend for level: ${level}`);
    const params = new URLSearchParams();
    params.append('level', level);
    params.append('maxResults', maxResults.toString());
    
    return await apiCall(`/curated?${params.toString()}`);
  } catch (error) {
    console.error('Error fetching curated educational videos from backend:', error);
    return [];
  }
};

/**
 * Get personalized video recommendations through backend
 * @param level User's skill level
 * @param interests Array of user interests
 * @param maxResults Maximum number of videos to return
 * @returns Promise with array of personalized video recommendations
 */
export const getPersonalizedRecommendations = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner',
  interests: string[] = [],
  maxResults: number = 6
): Promise<Video[]> => {
  try {
    console.log(`Fetching personalized recommendations from backend for level: ${level}, interests:`, interests);
    
    return await apiPostCall('/personalized', {
      level,
      interests,
      maxResults
    });
  } catch (error) {
    console.error('Error fetching personalized recommendations from backend:', error);
    return [];
  }
};

/**
 * Check YouTube API key status through backend
 * @returns Promise with API status information
 */
export const checkApiKeyValidity = async (): Promise<{apiKeyValid: boolean, status: string}> => {
  try {
    console.log('Checking YouTube API key validity via backend');
    return await apiCall('/api-status');
  } catch (error) {
    console.error('Error checking API key validity via backend:', error);
    return {
      apiKeyValid: false,
      status: 'Failed to check API status'
    };
  }
};
