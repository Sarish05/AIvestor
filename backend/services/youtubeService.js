const axios = require('axios');

// YouTube API service for fetching educational videos
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

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
      'budgeting basics',
      'emergency fund',
      'compound interest explained'
    ],
    channels: [
      'UC7_gcs09iThXybpVgjHZ_7w', // PBS Digital Studios
      'UC4DcmjDOJNsQe6BHVRU8oJQ', // Business Insider
      'UCFCEuCsyWP0YkP3CZ3Mr01Q'  // Ben Felix
    ]
  },
  Intermediate: {
    topics: [
      'portfolio diversification',
      'ETF vs mutual funds',
      'value investing strategies',
      'technical analysis basics',
      'dividend investing',
      'risk management',
      'asset allocation',
      'market volatility',
      'retirement planning',
      'tax-efficient investing'
    ],
    channels: [
      'UC7_gcs09iThXybpVgjHZ_7w',
      'UCFCEuCsyWP0YkP3CZ3Mr01Q',
      'UC4DcmjDOJNsQe6BHVRU8oJQ'
    ]
  },
  Advanced: {
    topics: [
      'options trading strategies',
      'derivatives trading',
      'algorithmic trading',
      'quantitative analysis',
      'hedge fund strategies',
      'advanced portfolio theory',
      'financial modeling',
      'international investing',
      'alternative investments',
      'private equity'
    ],
    channels: [
      'UCFCEuCsyWP0YkP3CZ3Mr01Q',
      'UC7_gcs09iThXybpVgjHZ_7w',
      'UC4DcmjDOJNsQe6BHVRU8oJQ'
    ]
  }
};

// Mock data fallback
const MOCK_VIDEOS = [
  {
    id: 'ZCFkWDdmXG8',
    title: 'Stock Market Basics for Beginners - Complete Guide',
    description: 'Learn everything you need to know about investing in the stock market as a beginner.',
    thumbnail: 'https://i.ytimg.com/vi/ZCFkWDdmXG8/mqdefault.jpg',
    channelTitle: 'Finance Academy',
    publishedAt: '2024-01-15T00:00:00Z',
    url: 'https://www.youtube.com/watch?v=ZCFkWDdmXG8',
    levelRelevance: 0.95
  },
  {
    id: 'gFQNPmLKj1k',
    title: 'Understanding Portfolio Diversification',
    description: 'Why diversification is crucial for your investment strategy and how to implement it.',
    thumbnail: 'https://i.ytimg.com/vi/gFQNPmLKj1k/mqdefault.jpg',
    channelTitle: 'Investment Insights',
    publishedAt: '2024-01-10T00:00:00Z',
    url: 'https://www.youtube.com/watch?v=gFQNPmLKj1k',
    levelRelevance: 0.88
  }
];

/**
 * Check API key validity
 * @returns {Promise<boolean>} Whether the API key is valid
 */
const checkApiKeyValidity = async () => {
  try {
    console.log('Checking YouTube API key validity...');
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: 'test',
        maxResults: 1,
        key: YOUTUBE_API_KEY
      }
    });

    console.log('YouTube API key is valid and working.');
    return true;
  } catch (error) {
    console.error('YouTube API key validation failed:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Get relevant financial education videos based on level and query
 * @param {string} level 'Beginner' | 'Intermediate' | 'Advanced'
 * @param {string} query Additional search terms to narrow down results
 * @param {number} maxResults Maximum number of videos to return
 * @returns {Promise<Array>} Array of video results
 */
const getEducationalVideos = async (level = 'Beginner', query = '', maxResults = 6) => {
  const levelConfig = skillLevelTopics[level] || skillLevelTopics.Beginner;
  
  let combinedQuery = query 
    ? `${level} ${query} investing finance education` 
    : `${level} ${levelConfig.topics[Math.floor(Math.random() * levelConfig.topics.length)]}`;

  console.log(`Searching YouTube for: ${combinedQuery}`);
  
  try {
    // First check if the API key is valid
    const isValidKey = await checkApiKeyValidity();
    if (!isValidKey) {
      console.log('API key invalid, returning mock data');
      return MOCK_VIDEOS.slice(0, maxResults);
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: combinedQuery,
        maxResults,
        type: 'video',
        videoDefinition: 'high',
        videoDuration: 'medium',
        order: 'relevance',
        key: YOUTUBE_API_KEY
      }
    });

    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      levelRelevance: calculateRelevance(item.snippet.title, item.snippet.description, level)
    }));
  } catch (error) {
    console.error('Error fetching educational videos:', error.message);
    return MOCK_VIDEOS.slice(0, maxResults);
  }
};

/**
 * Get curated educational videos from specific channels
 * @param {string} level User's skill level
 * @param {number} maxResults Maximum number of videos to return
 * @returns {Promise<Array>} Array of curated video results
 */
const getCuratedEducationalVideos = async (level = 'Beginner', maxResults = 6) => {
  const levelConfig = skillLevelTopics[level] || skillLevelTopics.Beginner;
  
  try {
    const isValidKey = await checkApiKeyValidity();
    if (!isValidKey) {
      return MOCK_VIDEOS.slice(0, maxResults);
    }

    // Get videos from recommended channels for this level
    const channelId = levelConfig.channels[0]; // Use first recommended channel
    
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId,
        maxResults,
        type: 'video',
        order: 'relevance',
        q: 'investing finance education',
        key: YOUTUBE_API_KEY
      }
    });

    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId?.videoId || item.id.videoId}`,
      levelRelevance: calculateRelevance(item.snippet.title, item.snippet.description, level)
    }));
  } catch (error) {
    console.error('Error fetching curated videos:', error.message);
    return MOCK_VIDEOS.slice(0, maxResults);
  }
};

/**
 * Get personalized video recommendations
 * @param {string} level User's skill level
 * @param {Array} interests Array of user interests
 * @param {number} maxResults Maximum number of videos to return
 * @returns {Promise<Array>} Array of personalized video recommendations
 */
const getPersonalizedRecommendations = async (level = 'Beginner', interests = [], maxResults = 6) => {
  try {
    const isValidKey = await checkApiKeyValidity();
    if (!isValidKey) {
      return MOCK_VIDEOS.slice(0, maxResults);
    }

    // Combine level topics with user interests
    const levelConfig = skillLevelTopics[level] || skillLevelTopics.Beginner;
    const queryTerms = interests.length > 0 
      ? interests.concat(levelConfig.topics.slice(0, 2))
      : levelConfig.topics;
    
    const query = queryTerms.join(' OR ') + ' investing finance';
    
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        maxResults,
        type: 'video',
        order: 'relevance',
        key: YOUTUBE_API_KEY
      }
    });

    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      levelRelevance: calculateRelevance(item.snippet.title, item.snippet.description, level)
    }));
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error.message);
    return MOCK_VIDEOS.slice(0, maxResults);
  }
};

/**
 * Calculate relevance score for a video based on title, description, and level
 * @param {string} title Video title
 * @param {string} description Video description
 * @param {string} level User's skill level
 * @returns {number} Relevance score between 0 and 1
 */
const calculateRelevance = (title, description, level) => {
  const levelConfig = skillLevelTopics[level] || skillLevelTopics.Beginner;
  const text = (title + ' ' + description).toLowerCase();
  
  let score = 0;
  let totalTerms = levelConfig.topics.length;
  
  levelConfig.topics.forEach(topic => {
    if (text.includes(topic.toLowerCase())) {
      score += 1;
    }
  });
  
  return Math.min(score / totalTerms + 0.3, 1); // Base score of 0.3 plus topic matches
};

module.exports = {
  getEducationalVideos,
  getCuratedEducationalVideos,
  getPersonalizedRecommendations,
  checkApiKeyValidity
};
