const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');

/**
 * @route GET /api/youtube/educational
 * @desc Get educational videos based on level and query
 * @query level - Skill level (Beginner, Intermediate, Advanced)
 * @query q - Search query (optional)
 * @query maxResults - Number of videos (default: 6)
 */
router.get('/educational', async (req, res) => {
  try {
    const level = req.query.level || 'Beginner';
    const query = req.query.q || '';
    const maxResults = parseInt(req.query.maxResults) || 6;
    
    // Validate level
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Must be Beginner, Intermediate, or Advanced' });
    }
    
    const videos = await youtubeService.getEducationalVideos(level, query, maxResults);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching educational videos:', error.message);
    res.status(500).json({ error: 'Failed to fetch educational videos' });
  }
});

/**
 * @route GET /api/youtube/curated
 * @desc Get curated educational videos from specific channels
 * @query level - Skill level (Beginner, Intermediate, Advanced)
 * @query maxResults - Number of videos (default: 6)
 */
router.get('/curated', async (req, res) => {
  try {
    const level = req.query.level || 'Beginner';
    const maxResults = parseInt(req.query.maxResults) || 6;
    
    // Validate level
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Must be Beginner, Intermediate, or Advanced' });
    }
    
    const videos = await youtubeService.getCuratedEducationalVideos(level, maxResults);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching curated videos:', error.message);
    res.status(500).json({ error: 'Failed to fetch curated videos' });
  }
});

/**
 * @route POST /api/youtube/personalized
 * @desc Get personalized video recommendations
 * @body level - Skill level (Beginner, Intermediate, Advanced)
 * @body interests - Array of user interests
 * @body maxResults - Number of videos (default: 6)
 */
router.post('/personalized', async (req, res) => {
  try {
    const { level = 'Beginner', interests = [], maxResults = 6 } = req.body;
    
    // Validate level
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Must be Beginner, Intermediate, or Advanced' });
    }
    
    // Validate interests
    if (!Array.isArray(interests)) {
      return res.status(400).json({ error: 'Interests must be an array' });
    }
    
    const videos = await youtubeService.getPersonalizedRecommendations(level, interests, maxResults);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error.message);
    res.status(500).json({ error: 'Failed to fetch personalized recommendations' });
  }
});

/**
 * @route GET /api/youtube/api-status
 * @desc Check YouTube API key status
 */
router.get('/api-status', async (req, res) => {
  try {
    const isValid = await youtubeService.checkApiKeyValidity();
    res.json({ 
      apiKeyValid: isValid,
      status: isValid ? 'YouTube API is working' : 'YouTube API key is invalid or quota exceeded'
    });
  } catch (error) {
    console.error('Error checking API status:', error.message);
    res.status(500).json({ error: 'Failed to check API status' });
  }
});

module.exports = router;
