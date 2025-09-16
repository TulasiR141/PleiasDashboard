import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Maximize2, Minimize2, Eye, EyeOff, Search } from 'lucide-react';
import "../styles/Chatbot.css";
import { API_BASE_URL } from '../config/environment';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your EU Funding Analytics Assistant. I can help you navigate the dashboard, understand funding data, analyze charts, and answer questions about EU budget allocation, country funding, and sector distributions. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [expandedSources, setExpandedSources] = useState(new Set());
    const [username, setUsername] = useState('user'); // You can make this configurable
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function to clean text but preserve HTML formatting tags
    const cleanResponseText = (text) => {
        if (!text) return '';

        // Remove specific unwanted tags
        let cleanedText = text.replace(/<ref[^>]*>.*?<\/ref>/gi, '');
        cleanedText = cleanedText.replace(/<ref[^>]*>/gi, '');

        // Remove any <|anything|> pattern tags (generalized)
        cleanedText = cleanedText.replace(/<\|[^|]*\|>/gi, '');

        // Convert ### TEXT ### patterns to <b>TEXT</b>
        cleanedText = cleanedText.replace(/###\s*([^#]+?)\s*###/g, '<b>$1</b>');

        // Remove any remaining tag-like patterns but keep HTML formatting
        cleanedText = cleanedText.replace(/\[ref[^\]]*\]/gi, '');
        cleanedText = cleanedText.replace(/\{[^}]*\}/g, '');

        // Clean up extra whitespace but preserve line breaks
        cleanedText = cleanedText.replace(/[ \t]+/g, ' ').trim();

        return cleanedText;
    };

    // Function to render HTML content safely
    const renderHTMLContent = (htmlString) => {
        return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
    };

    // API call function
    const callChatAPI = async (query) => {
        try {
            const response = await fetch(`${API_BASE_URL}/py/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    query: query
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        const currentQuery = inputText;
        setInputText('');
        setIsTyping(true);

        try {
            // Call the API
            const apiResponse = await callChatAPI(currentQuery);
            
            // Extract the answer from parsed_sections or use generated_text as fallback
            const botResponseText = apiResponse.parsed_sections?.answer || 
                                  apiResponse.generated_text || 
                                  "I apologize, but I couldn't generate a proper response at the moment.";

            // Clean and format the response
            const cleanedResponse = cleanResponseText(botResponseText);

            const botResponse = {
                id: messages.length + 2,
                text: cleanedResponse,
                sender: 'bot',
                timestamp: new Date(),
                apiData: apiResponse // Store the full API response for analysis panel
            };

            // Prepare analysis data from API response
            if (apiResponse.source_urls && apiResponse.source_urls.length > 0) {
                const sourcesData = apiResponse.source_urls.map((url, index) => ({
                    title: `Source ${index + 1}`,
                    url: url,
                    content: `Reference source for your query about: "${currentQuery}"`,
                    content_preview: `Source URL: ${url}`
                }));

                setAnalysisData({
                    sources: sourcesData,
                    messageId: `msg_${Date.now()}`,
                    query: currentQuery,
                    timestamp: new Date(),
                    apiMetadata: {
                        answer_id: apiResponse.answer_id,
                        sources_count: apiResponse.sources_count,
                        generation_time: apiResponse.generation_time,
                        source_filtering: apiResponse.source_filtering
                    }
                });
            }

            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);

        } catch (error) {
            console.error('Error calling API:', error);
            
            // Fallback to original logic if API fails
            const fallbackResponse = await getBotResponse(currentQuery);
            const botResponse = {
                id: messages.length + 2,
                text: fallbackResponse || "I'm sorry, I'm experiencing some technical difficulties. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }
    };

    // Keep the original getBotResponse as fallback
    const getBotResponse = async (userMessage) => {
        const message = userMessage.toLowerCase();

        // EU Funding specific responses
        if (message.includes('funding') || message.includes('budget') || message.includes('allocation')) {
            return "I can help you understand EU funding allocation. The dashboard shows <b>€1.2T in total funding</b> with <b>€340B remaining</b>. You can explore funding by countries (195 countries, 2.4K active programs), sectors (Health, Education, Infrastructure, etc.), and filter by regions, priority areas, and funding types. Would you like me to explain any specific aspect?";
        } else if (message.includes('chart') || message.includes('graph') || message.includes('data') || message.includes('visualization')) {
            return "The dashboard includes interactive <b>bar charts</b> showing committed vs projected funding. Each chart has <b>hover tooltips</b> with precise values, and you can filter data by region, sector, year, and funding type. The charts display data for countries, sectors, and global funding landscapes with real-time filtering capabilities.";
        } else if (message.includes('country') || message.includes('countries')) {
            return "The <b>Country Funding Analysis</b> page shows funding for 195 countries with 2.4K active programs. You can filter by regions (Western Europe, Eastern Europe, etc.) and priority areas (Climate & Environment, Digital Transformation, Health & Social, Economic Development). Each country shows committed vs projected funding amounts.";
        } else if (message.includes('sector') || message.includes('global') || message.includes('landscape')) {
            return "The <b>Global Funding Landscape</b> analyzes funding by sectors: <b>Health & Population</b>, <b>Education</b>, <b>Infrastructure</b>, <b>Agriculture</b>, and <b>Environment</b>. Each sector displays committed and projected funding amounts with detailed breakdowns and filtering options.";
        } else if (message.includes('filter') || message.includes('search') || message.includes('navigation')) {
            return "You can use <b>filter options</b> on each page: Region Filter, Priority Area Filter, Funding Type Filter, and Year Filter. These help you focus on specific data. The navigation menu lets you switch between Home, Countries, Sectors, and Funding Flows pages. Each page has consistent filtering and chart interactions.";
        } else if (message.includes('help') || message.includes('how') || message.includes('guide')) {
            return "I can help you with: <b>Understanding charts and data</b>, <b>Using filters and navigation</b>, <b>Explaining funding allocations</b>, <b>Country and sector analysis</b>, and <b>Dashboard features</b>. Ask me about specific pages, data points, or how to find particular information in the dashboard.";
        } else {
            return "Thank you for your question about the EU Funding Analytics dashboard. I can help you understand funding data, navigate charts, use filters, or explain any aspect of the funding analysis. Please ask me about specific features, data, or pages you'd like to explore.";
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleAnalysis = () => {
        setShowAnalysis(!showAnalysis);
    };

    const toggleSourceExpansion = (sourceIndex) => {
        const newExpandedSources = new Set(expandedSources);
        if (newExpandedSources.has(sourceIndex)) {
            newExpandedSources.delete(sourceIndex);
        } else {
            newExpandedSources.add(sourceIndex);
        }
        setExpandedSources(newExpandedSources);
    };

    const renderAnalysisPanel = () => (
        <div className={`analysis-panel ${showAnalysis ? 'visible' : ''}`}>
            {showAnalysis && (
                <>
                    <div className="analysis-header">
                        <h3 className="analysis-title">
                            <Search size={16} />
                            Data Sources & Metadata
                        </h3>
                        <button
                            onClick={toggleAnalysis}
                            className="analysis-close-button"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="analysis-content">
                        {!analysisData ? (
                            <div className="analysis-message">
                                No data sources available for this message
                            </div>
                        ) : (
                            <div>
                               
                                {/* Sources Section */}
                                {analysisData.sources && analysisData.sources.length > 0 && (
                                    <div className="analysis-section">
                                        <h4 className="analysis-section-title">Sources ({analysisData.sources.length})</h4>
                                        {analysisData.sources.map((source, index) => {
                                            const isExpanded = expandedSources.has(index);
                                            const hasPreview = source.content_preview;
                                            const displayContent = hasPreview ? source.content_preview :
                                                (source.content ? source.content.substring(0, 150) + '...' : 'No content available');

                                            return (
                                                <div key={index} className="source-item">
                                                    <div className="source-header">
                                                        <div className="source-title">
                                                            {source.title || `Source ${index + 1}`}
                                                        </div>
                                                        <div className="source-url">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleSourceExpansion(index);
                                                                }}
                                                                className="view-source-btn"
                                                            >
                                                                {isExpanded ? 'Hide Details' : 'View Details'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="source-content">
                                                        {source.url && (
                                                            <div className="source-url-display">
                                                                <a href={source.url} target="_blank" rel="noopener noreferrer">
                                                                    {source.url}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {isExpanded ?
                                                            source.content || 'No content available' :
                                                            displayContent
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    const renderMessages = () => (
        <div className="chatbot-messages">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`chatbot-message ${message.sender}`}
                >
                    <div className={`chatbot-avatar ${message.sender}`}>
                        {message.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
                    </div>
                    <div className="chatbot-message-content">
                        <div className={`chatbot-bubble ${message.sender}`}>
                            {message.sender === 'bot' ?
                                renderHTMLContent(message.text) :
                                message.text
                            }
                        </div>
                        <div className={`chatbot-timestamp ${message.sender}`}>
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="chatbot-typing">
                    <div className="chatbot-avatar bot">
                        <Bot size={18} />
                    </div>
                    <div className="chatbot-typing-bubble">
                        <div className="chatbot-typing-dots">
                            <div className="chatbot-typing-dot"></div>
                            <div className="chatbot-typing-dot"></div>
                            <div className="chatbot-typing-dot"></div>
                        </div>
                    </div>
                </div>
            )}

            {messages.length > 1 && (
                <div className="analysis-toggle-container">
                    <button
                        onClick={toggleAnalysis}
                        className="analysis-button"
                    >
                        {showAnalysis ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showAnalysis ? 'Hide Resources' : 'View Resources'}
                    </button>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );

    const renderInputArea = () => (
        <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about dashboard features and charts ..."
                    className="chatbot-textarea"
                    rows="1"
                />
            </div>
            <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`chatbot-send-button ${!inputText.trim() ? 'disabled' : ''}`}
            >
                <Send size={16} />
            </button>
        </div>
    );

    return (
        <div className="chatbot-container">
            {isExpanded && (
                <div className="chatbot-background-blur" onClick={() => setIsExpanded(false)} />
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="chatbot-floating-button"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {isOpen && (
                <div className={`chatbot-window ${isExpanded ? 'expanded' : ''} ${showAnalysis ? 'with-analysis' : ''}`}>
                    <div className="chatbot-header">
                        <div className="chatbot-header-left">
                            <div className="chatbot-logo">
                                <span className="eu-logo-icon">EU</span>
                            </div>
                            <div className="chatbot-title-container">
                                <h3 className="chatbot-title">EU Analytics Assistant</h3>
                                <p className="chatbot-subtitle">Funding Dashboard Support</p>
                            </div>
                        </div>
                        <div className="chatbot-header-controls">
                            <button
                                onClick={toggleExpand}
                                className="chatbot-control-button"
                                title={isExpanded ? "Minimize" : "Expand"}
                            >
                                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsExpanded(false);
                                    setShowAnalysis(false);
                                }}
                                className="chatbot-control-button"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="chatbot-expanded-layout">
                        <div className="chatbot-chat-content">
                            {renderMessages()}
                            {renderInputArea()}
                        </div>
                        {renderAnalysisPanel()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;