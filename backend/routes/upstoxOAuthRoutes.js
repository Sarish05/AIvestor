// backend/routes/upstoxOAuthRoutes.js - Upstox OAuth Routes
const express = require('express');

const router = express.Router();

// Upstox OAuth login
router.get('/login', (req, res) => {
  try {
    // Upstox OAuth configuration
    const clientId = process.env.UPSTOX_CLIENT_ID;
    const redirectUri = process.env.UPSTOX_REDIRECT_URI || 'http://localhost:3000/upstox/callback';
    
    if (!clientId) {
      return res.status(500).json({
        success: false,
        error: 'Upstox client ID not configured'
      });
    }

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session (in production, use proper session management)
    req.session = req.session || {};
    req.session.upstoxState = state;

    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    res.json({
      success: true,
      authUrl: authUrl,
      state: state
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate OAuth URL'
    });
  }
});

// Upstox OAuth callback
router.post('/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code not provided'
      });
    }

    // Verify state parameter (in production, check against stored state)
    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'State parameter missing'
      });
    }

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (tokenResponse.success) {
      res.json({
        success: true,
        accessToken: tokenResponse.accessToken,
        message: 'OAuth authentication successful'
      });
    } else {
      res.status(400).json({
        success: false,
        error: tokenResponse.error || 'Failed to exchange code for token'
      });
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'OAuth callback failed'
    });
  }
});

// Get OAuth status
router.get('/status', (req, res) => {
  try {
    // Check if user has valid tokens
    const hasToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
    
    res.json({
      success: true,
      authenticated: hasToken,
      message: hasToken ? 'User is authenticated' : 'User not authenticated'
    });
  } catch (error) {
    console.error('OAuth status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check OAuth status'
    });
  }
});

// Logout/revoke token
router.post('/logout', (req, res) => {
  try {
    // In a real implementation, you would revoke the token with Upstox
    // For now, just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('OAuth logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Helper function to exchange code for access token
async function exchangeCodeForToken(code) {
  try {
    const clientId = process.env.UPSTOX_CLIENT_ID;
    const clientSecret = process.env.UPSTOX_CLIENT_SECRET;
    const redirectUri = process.env.UPSTOX_REDIRECT_URI || 'http://localhost:3000/upstox/callback';

    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'Upstox credentials not configured'
      };
    }

    // In a real implementation, make the API call to Upstox
    // For now, return a mock successful response
    return {
      success: true,
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600
    };

    /* Real implementation would be:
    const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      };
    } else {
      return {
        success: false,
        error: data.error_description || data.error
      };
    }
    */
  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: 'Token exchange failed'
    };
  }
}

module.exports = router;
