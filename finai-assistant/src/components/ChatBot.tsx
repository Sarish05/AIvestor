import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Input, IconButton, VStack, Avatar, HStack, Spinner, useDisclosure, Button } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiMaximize, FiMinimize, FiX } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';
// Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Ensure this path is correct
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { addDocument } from '../services/documentService';
import { 
  fetchFinancialNews, 
  fetchBusinessHeadlines, 
  fetchCompanyNews, 
  formatNewsAsString,
  NewsArticle 
} from '../services/newsService';

const MotionBox = motion(Box);
const AnimatedBox = animated(Box);

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Interface for user preferences from Firestore
interface UserPreferences {
  investmentGoals?: string[];
  riskTolerance?: string;
  investmentHorizon?: string;
  preferredSectors?: string[];
  preferredAssetClasses?: string[];
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI financial assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  const expandSpring = useSpring({
    width: isExpanded ? '600px' : '380px',
    height: isExpanded ? '80vh' : '500px',
    config: { tension: 280, friction: 60 },
  });

  // Initialize and fetch user preferences
  useEffect(() => {
    // Fetch user preferences
    const fetchUserPreferences = async () => {
      try {
        // Replace 'currentUserId' with actual user ID from your auth system
        const userId = 'currentUserId'; // TODO: get actual user ID
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          setUserPreferences(userDoc.data() as UserPreferences);
        } else {
          // Set sample preferences for testing if user has none
          setUserPreferences({
            investmentGoals: ['Retirement', 'Wealth growth'],
            riskTolerance: 'Moderate',
            investmentHorizon: 'Long-term (10+ years)',
            preferredSectors: ['Technology', 'Healthcare'],
            preferredAssetClasses: ['Stocks', 'ETFs', 'Bonds']
          });
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        // Set default preferences even on error
        setUserPreferences({
          investmentGoals: ['Retirement'],
          riskTolerance: 'Moderate',
          investmentHorizon: 'Medium-term (5-10 years)',
          preferredSectors: ['Technology'],
          preferredAssetClasses: ['ETFs']
        });
      }
    };
    
    fetchUserPreferences();
    
    // Seed financial documents for testing RAG
    const seedFinancialDocuments = async () => {
      await addDocument(
        "Risk tolerance is a measure of how much market volatility an investor can withstand. Conservative investors have low risk tolerance and prefer safer investments. Moderate risk investors can handle some market fluctuations for potentially higher returns. Aggressive investors have high risk tolerance and seek maximum returns despite high volatility.",
        { type: "education", topic: "risk_profile" }
      );
      
      await addDocument(
        "For conservative investors with low risk tolerance, a suitable strategy includes 60-70% bonds, 20-30% blue-chip stocks, and 10% cash or short-term CDs. This provides stability with some growth potential.",
        { type: "strategy", riskProfile: "conservative" }
      );
      
      await addDocument(
        "Moderate risk investors should consider a balanced portfolio of 50-60% stocks (mix of growth and value), 30-40% bonds, and 5-10% alternative investments. This provides growth potential with reasonable stability.",
        { type: "strategy", riskProfile: "moderate" }
      );
      
      await addDocument(
        "Aggressive investors with high risk tolerance might prefer 70-80% stocks (including growth stocks and emerging markets), 10-20% bonds, and 5-10% alternative investments like REITs or commodities. This maximizes growth potential but has higher volatility.",
        { type: "strategy", riskProfile: "aggressive" }
      );
    };

    seedFinancialDocuments();
    
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to determine if text is a greeting or casual conversation
  const isGreetingOrCasual = (text: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const casual = ['how are you', 'what\'s up', 'how\'s it going', 'nice to meet you'];
    
    const lowercaseText = text.toLowerCase();
    
    return greetings.some(greeting => lowercaseText.includes(greeting)) || 
           casual.some(phrase => lowercaseText.includes(phrase)) ||
           lowercaseText.split(' ').length < 3; // Very short messages are likely greetings
  };

  // Function to format the response text with proper paragraphs and spacing
  const formatResponseText = (text: string): string => {
    // Replace single newlines with double newlines for proper paragraphs
    let formatted = text.replace(/\n(?!\n)/g, '\n\n');
    
    // Ensure proper spacing after bullet points
    formatted = formatted.replace(/•\s*(.*?)(?=\n|$)/g, '• $1\n');
    formatted = formatted.replace(/\*\s*(.*?)(?=\n|$)/g, '• $1\n');
    
    // Ensure proper spacing between sections with headers
    formatted = formatted.replace(/([.:!?])\s*\n\s*([A-Z])/g, '$1\n\n$2');
    
    // Ensure double line breaks between numbered items
    formatted = formatted.replace(/(\d+\.)\s*(.*?)(?=\n|$)/g, '$1 $2\n');
    
    return formatted;
  };

  // Function to get relevant news based on user query
  const getRelevantNews = async (query: string): Promise<string> => {
    // Check if query contains specific company names or stock symbols
    const companyRegex = /\b(?:HDFC|SBI|TCS|Reliance|Infosys|ICICI|Wipro|Tata|Adani|Bajaj|Maruti|Suzuki|Bharti|Airtel|Sun|Pharma|ITC|HUL|ONGC|Axis|Bank|Kotak|L&T)\b/i;
    const stockRegex = /\b[A-Z]{2,5}\b/; // Simple regex for stock symbols

    // Explicitly define the type for newsArticles
    let newsArticles: NewsArticle[] = [];
    
    if (companyRegex.test(query)) {
      // Extract company name
      const match = query.match(companyRegex);
      if (match && match[0]) {
        newsArticles = await fetchCompanyNews(match[0]);
      }
    } else if (stockRegex.test(query)) {
      // Extract potential stock symbol
      const match = query.match(stockRegex);
      if (match && match[0]) {
        newsArticles = await fetchCompanyNews(match[0]);
      }
    } else {
      // For general financial queries
      const keywordMap: Record<string, string> = {
        'investment': 'investment strategy market',
        'stock': 'stock market trends',
        'mutual fund': 'mutual funds investment',
        'market': 'market analysis trends',
        'crypto': 'cryptocurrency bitcoin ethereum',
        'gold': 'gold price investment',
        'real estate': 'real estate property market'
      };
      
      // Find relevant keywords in the query
      let searchQuery = 'finance market';
      for (const [keyword, searchTerm] of Object.entries(keywordMap)) {
        if (query.toLowerCase().includes(keyword)) {
          searchQuery = searchTerm;
          break;
        }
      }
      
      newsArticles = await fetchFinancialNews(searchQuery, 5);
    }
    
    return formatNewsAsString(newsArticles);
  };

  const callVertexAI = async (userMessage: string, newsData: string = '', systemPromptText: string = ''): Promise<string> => {
    try {
      // Format user preferences
      const preferencesObj = {
        investmentGoals: userPreferences?.investmentGoals || [],
        riskTolerance: userPreferences?.riskTolerance || 'Moderate',
        investmentHorizon: userPreferences?.investmentHorizon || 'Medium-term',
        preferredSectors: userPreferences?.preferredSectors || [],
        preferredAssetClasses: userPreferences?.preferredAssetClasses || []
      };

      console.log("Calling Flask API...");
      const payload = {
        message: userMessage,
        preferences: preferencesObj,
        systemPrompt: systemPromptText,
        newsData: newsData
      };
      console.log("API payload:", JSON.stringify(payload).substring(0, 200) + "...");

      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Vertex AI:', error);
      throw error; // Re-throw to trigger fallback
    }
  };

  const getAdvancedModelResponse = async (userMessage: string): Promise<string> => {
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
          }
        ]
      });

      // System instruction
      const financialSystemInstruction = `Analyze the current financial market trends and provide a clear, data-driven investment recommendation based on the user's risk appetite, portfolio, and preferences. Use real-time stock data, emerging business insights, and market trends to make firm, actionable suggestions. Consider historical performance, recent economic events, and sector momentum. Avoid vague statements—deliver precise, fact-based guidance. If an investment is risky, state it directly with supporting data, but phrase it in a constructive and non-aggressive manner to maintain a positive user experience. If a trend is strong, highlight the exact reasons and data points backing it. Provide alternative options only if necessary. Also, suggest high-potential emerging industries and businesses based on recent developments. If the user is holding a stock at a loss, acknowledge the situation with empathy and offer rational, unbiased recommendations without unnecessary negativity. At the end, offer additional insights related to the user's past preferences, such as mutual funds, stocks, or risk management strategies. Keep the tone clear, polite, and helpful, ensuring an unbiased and user-friendly experience.`;

      // Format user preferences
      const preferencesText = `User Preferences:
- Investment Goals: ${userPreferences?.investmentGoals?.join(', ') || 'Not specified'}
- Risk Tolerance: ${userPreferences?.riskTolerance || 'Moderate'}
- Investment Horizon: ${userPreferences?.investmentHorizon || 'Medium-term'}
- Preferred Sectors: ${userPreferences?.preferredSectors?.join(', ') || 'Not specified'}
- Preferred Asset Classes: ${userPreferences?.preferredAssetClasses?.join(', ') || 'Not specified'}`;

      // Fix the format: Use a single string prompt instead of an array with roles
      const combinedPrompt = `${financialSystemInstruction}

I'll analyze financial markets and provide clear, data-driven investment recommendations.

${preferencesText}

User Query: ${userMessage}`;

      const result = await model.generateContent(combinedPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Error with advanced model:', error);
      throw error;
    }
  };

  const testSimpleAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:5000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling test API:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      let botResponse: string;

      // Check if the message is a greeting or casual conversation
      const isJustGreeting = isGreetingOrCasual(inputValue);
      
      // Create system prompt based on message type
      let systemPrompt = '';
      
      if (isJustGreeting) {
        systemPrompt = `You are AIvestor, a friendly and conversational AI financial assistant. 
Respond to this greeting in a warm, casual way. Do not give investment advice unless explicitly asked.
Keep your response short and engaging. You could ask if they're interested in learning about investments, 
but don't immediately dive into financial topics.

Respond in well-formatted text with proper spacing between paragraphs. Keep it concise.`;
      } else {
        systemPrompt = `You are AIvestor, a decisive financial analyst and investment advisor for Indian investors.
When users ask about specific stocks or investment decisions, provide DIRECT and CLEAR recommendations.

IMPORTANT: 
1. DO NOT include placeholder text like [insert X]. Use only what you know.
2. DO NOT say "this is not financial advice" or add disclaimers.
3. DO NOT tell users to consult financial advisors.
4. NEVER mention that you lack real-time data - work with what you're given.

For stock-specific questions:
1. Always start with actual data provided in the context (price, news, etc.)
2. Give a clear buy/hold/sell recommendation with a target price
3. Be confident and direct in your assessment
4. Provide specific ETF recommendations with actual ticker symbols

For formatting:
1. Use direct statements like "I recommend buying X" not "you might consider X"
2. Use proper spacing between paragraphs
3. Make your recommendation stand out clearly
4. For Indian stocks, include NSE/BSE ticker symbols

For Indian market questions, provide specific names of actual mutual funds and ETFs available in India.`;
      }

      // Format user preferences in a more structured way
      let userPreferencesText = '';
      if (userPreferences && !isJustGreeting) {
        userPreferencesText = 'User preferences:\n';
        if (userPreferences.investmentGoals && userPreferences.investmentGoals.length > 0) {
          userPreferencesText += `- Investment goals: ${userPreferences.investmentGoals.join(', ')}\n`;
        }
        if (userPreferences.riskTolerance) {
          userPreferencesText += `- Risk tolerance: ${userPreferences.riskTolerance}\n`;
        }
        if (userPreferences.investmentHorizon) {
          userPreferencesText += `- Investment horizon: ${userPreferences.investmentHorizon}\n`;
        }
        if (userPreferences.preferredSectors && userPreferences.preferredSectors.length > 0) {
          userPreferencesText += `- Preferred sectors: ${userPreferences.preferredSectors.join(', ')}\n`;
        }
        if (userPreferences.preferredAssetClasses && userPreferences.preferredAssetClasses.length > 0) {
          userPreferencesText += `- Preferred asset classes: ${userPreferences.preferredAssetClasses.join(', ')}\n`;
        }
      } else if (!isJustGreeting) {
        // Provide default guidance if no preferences set
        userPreferencesText = 'User has not set specific investment preferences yet. Provide general advice and suggest setting up a profile.';
      }

      // Get relevant news data
      let relevantNewsText = '';
      if (!isJustGreeting) {
        try {
          console.log("Fetching relevant news for query:", inputValue);
          relevantNewsText = await getRelevantNews(inputValue);
          console.log("Got news data:", relevantNewsText.substring(0, 100) + "...");
        } catch (error) {
          console.error("Error fetching news:", error);
          relevantNewsText = "Unable to fetch latest news at this time.";
        }
      }

      // Update systemPrompt to include news data
      systemPrompt += `\n\nLatest relevant news for context:
${relevantNewsText}

Consider this news data when providing your financial analysis and recommendations. Use the most relevant pieces to support your advice.`;

      console.log("Sending request to Vertex API with prompt:", `${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
      
      // For non-greetings, use the advanced Flask API first, then fall back to the direct Gemini model
      if (!isJustGreeting) {
        try {
          // Use the main Vertex AI endpoint instead of the test endpoint
          botResponse = await callVertexAI(inputValue, relevantNewsText, systemPrompt);
          botResponse = improvedFormatResponseText(botResponse);
        } catch (error) {
          console.error("Error with Flask API:", error);
          
          try {
            // Then try the JavaScript implementation (with renamed function)
            botResponse = await getAdvancedModelResponse(inputValue);
            botResponse = improvedFormatResponseText(botResponse);
          } catch (error) {
            console.error("Error with advanced model:", error);
            
            // Finally fall back to the basic Gemini model
            console.log("Falling back to basic Gemini API");
            const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
            const model = genAI.getGenerativeModel({ 
              model: "gemini-1.5-pro",
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              }
            });
            const result = await model.generateContent(`${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
            botResponse = result.response.text();
          }
        }
      } else {
        // For greetings, continue using the simple model directly
        const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-pro",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        });
        const result = await model.generateContent(`${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
        botResponse = result.response.text();
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Add a more descriptive error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I encountered an error processing your request. Technical details: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Improved formatting function to handle markdown and ensure better display
  const improvedFormatResponseText = (text: string): string => {
    // Replace all markdown asterisks with clean formatting
    let formatted = text;

    // Remove asterisk-based formatting and replace with clean formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markers
    formatted = formatted.replace(/\*(.*?)\*/g, '$1');     // Remove italics markers

    // Ensure proper spacing after bullet points
    formatted = formatted.replace(/•\s*(.*?)(?=\n|$)/g, '• $1\n');

    // Ensure double newlines between sections
    formatted = formatted.replace(/([.:!?])\s*\n([A-Z])/g, '$1\n\n$2');

    // Ensure paragraphs have proper spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace excessive newlines with double newlines
    formatted = formatted.replace(/\n(?!\n)/g, '\n\n'); // Replace single newlines with double newlines

    // Ensure proper spacing between numbered list items
    formatted = formatted.replace(/(\d+\.)\s*(.*?)(?=\n|$)/g, '$1 $2\n');

    // Ensure proper spacing after section headers (typically ending with colon)
    formatted = formatted.replace(/(.*?):\s*\n/g, '$1:\n\n');

    return formatted;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const suggestedQuestions = [
    "What investment strategy suits my risk profile?",
    "How should I diversify my portfolio?",
    "Explain mutual funds vs. ETFs",
    "What are current market trends?"
  ];

  if (!isOpen) {
    return (
      <MotionBox
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex="999"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          aria-label="Open chat"
          icon={<Avatar src="/finai-logo.png" name="AIvestor Assistant" />}
          onClick={onOpen}
          size="lg"
          rounded="full"
          className="neon-glow"
          bg="brand.500"
          _hover={{ bg: 'brand.600' }}
        />
      </MotionBox>
    );
  }

  return (
    <AnimatePresence>
      <MotionBox
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex="999"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedBox
          style={expandSpring}
          className="glass-card"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          position="relative"
        >
          {/* Chat Header */}
          <Flex
            p={4}
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            justify="space-between"
            align="center"
            bg="rgba(14, 165, 233, 0.1)"
          >
            <HStack>
              <Avatar size="sm" name="AIvestor Assistant" bg="brand.500" />
              <Text fontWeight="bold">AIvestor Assistant</Text>
            </HStack>
            <HStack>
              <IconButton
                aria-label={isExpanded ? "Minimize" : "Maximize"}
                icon={isExpanded ? <FiMinimize /> : <FiMaximize />}
                size="sm"
                variant="ghost"
                bg="white"
                onClick={toggleExpand}
              />
              <IconButton
                aria-label="Close"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                bg="white"
                onClick={onClose}
              />
            </HStack>
          </Flex>

          {/* Messages Container */}
          <VStack
            flex="1"
            overflowY="auto"
            p={4}
            spacing={4}
            align="stretch"
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              },
            }}
          >
            {messages.map((message) => (
              <MotionBox
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                maxW="70%"
              >
                <Box
                  bg={message.sender === 'user' ? 'brand.500' : 'rgba(255, 255, 255, 0.1)'}
                  p={3}
                  borderRadius={message.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'}
                >
                  <Text 
                    fontSize="sm"
                    whiteSpace="pre-wrap" // This ensures line breaks are preserved
                  >
                    {message.text}
                  </Text>
                </Box>
                <Text fontSize="xs" color="gray.400" mt={1} textAlign={message.sender === 'user' ? 'right' : 'left'}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </MotionBox>
            ))}
            {isTyping && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                alignSelf="flex-start"
                maxW="70%"
              >
                <Box bg="rgba(255, 255, 255, 0.1)" p={3} borderRadius="12px 12px 12px 0">
                  <Flex align="center">
                    <Spinner size="xs" mr={2} />
                    <Text fontSize="sm">AIvestor is thinking...</Text>
                  </Flex>
                </Box>
              </MotionBox>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Suggested Questions */}
          {messages.length < 3 && (
            <Box p={3} borderTop="1px solid rgba(255, 255, 255, 0.1)">
              <Text fontSize="xs" mb={2} color="gray.400">Suggested questions:</Text>
              <Flex overflowX="auto" pb={2} css={{
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}>
                {suggestedQuestions.map((question, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    mr={2}
                    flexShrink={0}
                  >
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      borderRadius="full"
                      bg="white"
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current?.focus();
                      }}
                    >
                      {question}
                    </Button>
                  </MotionBox>
                ))}
              </Flex>
            </Box>
          )}

          {/* Input Area */}
          <Flex p={3} borderTop="1px solid rgba(255, 255, 255, 0.1)" align="center">
            <Input
              ref={inputRef}
              placeholder="Ask about investing, financial concepts..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="rgba(255, 255, 255, 0.05)"
              border="none"
              borderRadius="full"
              _focus={{ boxShadow: "0 0 0 1px rgba(14, 165, 233, 0.6)" }}
              mr={2}
            />
            <IconButton
              aria-label="Voice input"
              icon={<FiMic />}
              variant="ghost"
              isRound
              mr={1}
            />
            <IconButton
              aria-label="Send message"
              icon={<FiSend />}
              onClick={handleSendMessage}
              isRound
              colorScheme="blue"
              disabled={inputValue.trim() === ''}
            />
          </Flex>
        </AnimatedBox>
      </MotionBox>
    </AnimatePresence>
  );
};

export default ChatBot;