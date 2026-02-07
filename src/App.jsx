import React, { useState, useRef, useEffect } from "react";
import ChatBox from "./components/ChatBox";
import { FaBars, FaTimes, FaPlus, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import "./style.css";

const App = () => {
  // Core States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [base64Image, setBase64Image] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Sidebar States
  const [chats, setChats] = useState([]); 
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs
  const fileInputRef = useRef(null);
  const chatboxRef = useRef(null);

  // Language Configuration
  const languages = ["Hindi", "English", "Punjabi", "Marathi", "Telugu", "Bhojpuri", "Gujarati"];
  
  // Translations
  const translations = {
    Hindi: {
      welcome: "नमस्ते! मैं AgriBot हूँ 🌾",
      subtitle: "कृषि में आपका AI सहायक",
      description: "आप अपनी फसल, रोग, कीट या खाद के बारे में पूछ सकते हैं",
      quickActions: "त्वरित कार्य",
      scanImage: "फोटो स्कैन करें",
      pestControl: "कीट नियंत्रण",
      fertilizer: "खाद सलाह",
      weather: "मौसम जानकारी",
      cropAdvice: "फसल सलाह",
      placeholder: "अपना प्रश्न यहाँ लिखें...",
      send: "भेजें",
      newChat: "नया चैट",
      searchPlaceholder: "खोजें...",
      noChats: "अभी कोई बातचीत नहीं है",
      noResults: "कोई परिणाम नहीं मिला",
      poweredBy: "द्वारा संचालित",
      aiAssistant: "AI सहायक"
    },
    English: {
      welcome: "Hello! I'm AgriBot 🌾",
      subtitle: "Your AI Assistant in Agriculture",
      description: "Ask me about crops, diseases, pests, or fertilizers",
      quickActions: "Quick Actions",
      scanImage: "Scan Image",
      pestControl: "Pest Control",
      fertilizer: "Fertilizer Advice",
      weather: "Weather Info",
      cropAdvice: "Crop Advice",
      placeholder: "Type your question here...",
      send: "Send",
      newChat: "New Chat",
      searchPlaceholder: "Search...",
      noChats: "No conversations yet",
      noResults: "No results found",
      poweredBy: "Powered by",
      aiAssistant: "AI Assistant"
    },
    Punjabi: {
      welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ AgriBot ਹਾਂ 🌾",
      subtitle: "ਖੇਤੀਬਾੜੀ ਵਿੱਚ ਤੁਹਾਡਾ AI ਸਹਾਇਕ",
      description: "ਫਸਲਾਂ, ਬਿਮਾਰੀਆਂ, ਕੀੜਿਆਂ ਜਾਂ ਖਾਦ ਬਾਰੇ ਪੁੱਛੋ",
      quickActions: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ",
      scanImage: "ਫੋਟੋ ਸਕੈਨ ਕਰੋ",
      pestControl: "ਕੀੜੇ ਨਿਯੰਤਰਣ",
      fertilizer: "ਖਾਦ ਸਲਾਹ",
      weather: "ਮੌਸਮ ਜਾਣਕਾਰੀ",
      cropAdvice: "ਫਸਲ ਸਲਾਹ",
      placeholder: "ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਲਿਖੋ...",
      send: "ਭੇਜੋ",
      newChat: "ਨਵੀਂ ਚੈਟ",
      searchPlaceholder: "ਖੋਜੋ...",
      noChats: "ਅਜੇ ਕੋਈ ਗੱਲਬਾਤ ਨਹੀਂ",
      noResults: "ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ ਮਿਲੇ",
      poweredBy: "ਦੁਆਰਾ ਸੰਚਾਲਿਤ",
      aiAssistant: "AI ਸਹਾਇਕ"
    },
    Marathi: {
      welcome: "नमस्कार! मी AgriBot आहे 🌾",
      subtitle: "शेतीमधील तुमचा AI सहाय्यक",
      description: "पिके, रोग, किडे किंवा खत याबद्दल विचारा",
      quickActions: "द्रुत क्रिया",
      scanImage: "फोटो स्कॅन करा",
      pestControl: "किडे नियंत्रण",
      fertilizer: "खत सल्ला",
      weather: "हवामान माहिती",
      cropAdvice: "पीक सल्ला",
      placeholder: "तुमचा प्रश्न येथे लिहा...",
      send: "पाठवा",
      newChat: "नवीन चॅट",
      searchPlaceholder: "शोधा...",
      noChats: "अद्याप संभाषण नाही",
      noResults: "कोणतेही परिणाम आढळले नाहीत",
      poweredBy: "द्वारा समर्थित",
      aiAssistant: "AI सहाय्यक"
    },
    Telugu: {
      welcome: "నమస్కారం! నేను AgriBot 🌾",
      subtitle: "వ్యవసాయంలో మీ AI సహాయకుడు",
      description: "పంటలు, వ్యాధులు, తెగుళ్లు లేదా ఎరువుల గురించి అడగండి",
      quickActions: "త్వరిత చర్యలు",
      scanImage: "ఫోటో స్కాన్ చేయండి",
      pestControl: "తెగులు నియంత్రణ",
      fertilizer: "ఎరువుల సలహా",
      weather: "వాతావరణ సమాచారం",
      cropAdvice: "పంట సలహా",
      placeholder: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
      send: "పంపించు",
      newChat: "కొత్త చాట్",
      searchPlaceholder: "వెతకండి...",
      noChats: "ఇంకా సంభాషణలు లేవు",
      noResults: "ఫలితాలు కనుగొనబడలేదు",
      poweredBy: "ద్వారా అందించబడింది",
      aiAssistant: "AI సహాయకుడు"
    },
    Bhojpuri: {
      welcome: "नमस्कार! हम AgriBot हईं 🌾",
      subtitle: "खेती में रउआ के AI सहायक",
      description: "फसल, रोग, कीड़ा या खाद के बारे में पूछीं",
      quickActions: "तुरंत कार्रवाई",
      scanImage: "फोटो स्कैन करीं",
      pestControl: "कीड़ा नियंत्रण",
      fertilizer: "खाद सलाह",
      weather: "मौसम जानकारी",
      cropAdvice: "फसल सलाह",
      placeholder: "आपन सवाल इहाँ लिखीं...",
      send: "भेजीं",
      newChat: "नया चैट",
      searchPlaceholder: "खोजीं...",
      noChats: "अभी कवनो बातचीत नइखे",
      noResults: "कुछ ना मिलल",
      poweredBy: "द्वारा संचालित",
      aiAssistant: "AI सहायक"
    },
    Gujarati: {
      welcome: "નમસ્તે! હું AgriBot છું 🌾",
      subtitle: "ખેતીમાં તમારો AI સહાયક",
      description: "પાક, રોગ, જીવાત અથવા ખાતર વિશે પૂછો",
      quickActions: "ઝડપી ક્રિયાઓ",
      scanImage: "ફોટો સ્કેન કરો",
      pestControl: "જીવાત નિયંત્રણ",
      fertilizer: "ખાતર સલાહ",
      weather: "હવામાન માહિતી",
      cropAdvice: "પાક સલાહ",
      placeholder: "તમારો પ્રશ્ન અહીં લખો...",
      send: "મોકલો",
      newChat: "નવી ચેટ",
      searchPlaceholder: "શોધો...",
      noChats: "હજુ સુધી કોઈ વાતચીત નથી",
      noResults: "કોઈ પરિણામ મળ્યા નથી",
      poweredBy: "દ્વારા સંચાલિત",
      aiAssistant: "AI સહાયક"
    }
  };

  const t = translations[selectedLang] || translations.English;

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // API Functions
  const fetchChatHistory = async () => {
    try {
      const res = await axios.get('https://agribot-ai-hwff.onrender.com/api/chats');
      setChats(res.data || []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setChats([]);
    }
  };

  const startNewChat = async () => {
    try {
      const res = await axios.post('https://agribot-ai-hwff.onrender.com/api/chats', { 
        language: selectedLang 
      });
      
      setChats(prev => [res.data, ...prev]);
      setActiveChatId(res.data._id);
      setMessages([]);
      setSearchQuery("");
      
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not create new chat',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const loadChat = async (id) => {
    if (id === activeChatId) return;
    
    setActiveChatId(id);
    setIsLoading(true);
    
    try {
      const res = await axios.get(`https://agribot-ai-hwff.onrender.com/api/chats/${id}/messages`);
      setMessages(res.data || []);
      
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load chat',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const prompts = {
      pest: "फसल के कीड़ों को कैसे रोकें?",
      fertilizer: "सबसे अच्छी खाद कौन सी है?",
      weather: "मौसम की जानकारी दें",
      crop: "पैदावार कैसे बढ़ाएं?"
    };
    
    setInput(prompts[action] || "");
    setTimeout(() => {
      document.querySelector('.chat-input')?.focus();
    }, 100);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({ 
        icon: 'error', 
        title: 'File Too Large', 
        text: 'Maximum file size is 10MB',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        canvas.width = Math.min(img.width, MAX_WIDTH);
        canvas.height = img.height * (canvas.width / img.width);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBase64Image(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
    
    e.target.value = null;
  };

  const handleSend = async (text = input) => {
    const messageText = text.trim();
    if (!messageText && !base64Image) return;

    setIsLoading(true);
    let currentId = activeChatId;

    try {
        // 1. Create chat if it doesn't exist (Backend logic check)
        if (!currentId) {
            try {
                const chatRes = await axios.post('https://agribot-ai-hwff.onrender.com/api/chats', { 
                    language: selectedLang,
                    title: messageText.substring(0, 30) + (messageText.length > 30 ? "..." : "") 
                });
                currentId = chatRes.data._id;
                setActiveChatId(currentId);
                setChats(prev => [chatRes.data, ...prev]);
            } catch (err) {
                console.warn("Chat creation failed, proceeding with direct chat...");
            }
        }

        // 2. UI update (User side)
        const userMsg = { 
            sender: "user", 
            text: messageText, 
            image: base64Image,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput(""); 
        setBase64Image("");

        // 3. API Call (Updated to match your Swagger/Curl Docs)
        const response = await fetch("https://agribot-ai-hwff.onrender.com/api/chat", { // Endpoint changed to /api/chat
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({ 
                query: messageText,              // Field changed from 'content' to 'query'
                image_url: base64Image || "string", // Match swagger default
                language: selectedLang 
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 4. Handle Server Overload or Success
        const botMsg = {
            sender: "bot",
            // data.reply is used as per your curl response example
            text: data.reply || (data.error ? "Server is busy." : "No response from AI."), 
            timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMsg]);

        // Optional: Refresh history if applicable
        if (typeof fetchChatHistory === 'function') fetchChatHistory();

    } catch (error) {
        console.error("Send error details:", error);
        
        setMessages(prev => [...prev, { 
            sender: "bot", 
            text: "❌ Connection error! Server is not responding properly.",
            error: true,
            timestamp: new Date().toISOString()
        }]);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Backend is not reachable or overloaded.',
                timer: 3000,
                showConfirmButton: false
            });
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🌾</div>
            <div className="logo-text">
              <h2>AgriBot</h2>
              <span>{t.aiAssistant}</span>
            </div>
          </div>
          <button 
            className="close-sidebar" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        <button 
          className="new-chat-btn" 
          onClick={startNewChat}
          aria-label={t.newChat}
        >
          <FaPlus />
          <span>{t.newChat}</span>
        </button>

        <div className="sidebar-search">
          <FaSearch />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search chats"
          />
        </div>

        <div className="chat-history-list">
          {chats.length === 0 && !isLoading && (
            <div className="empty-history">
              <div className="empty-icon">💬</div>
              <p>{t.noChats}</p>
            </div>
          )}

          {chats.length > 0 && filteredChats.length === 0 && searchQuery !== "" && (
            <div className="no-results">
              <p>{t.noResults}</p>
            </div>
          )}

          {filteredChats.map((chat) => (
            <div 
              key={chat._id} 
              className={`chat-item ${activeChatId === chat._id ? "active" : ""}`}
              onClick={() => loadChat(chat._id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && loadChat(chat._id)}
            >
              <div className="chat-icon">
                {activeChatId === chat._id ? "🚜" : "🌿"}
              </div>
              <div className="chat-info">
                <p className="chat-title">{chat.title || "Untitled Chat"}</p>
                <span className="chat-time">Recent</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>{t.poweredBy} <strong>AI Technology</strong></p>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN CONTENT */}
      <div className="main-container">
        {/* HEADER */}
        <header className="app-header">
          <div className="header-left">
            <button 
              className="menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
            <div className="header-brand">
              <div className="brand-icon">🌾</div>
              <div className="brand-text">
                <h1>AgriBot AI</h1>
                <p>Digital Agronomist</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="language-selector">
              <span className="lang-icon">🌐</span>
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                aria-label="Select language"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="chat-container" ref={chatboxRef}>
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="bot-avatar">
                  <div className="avatar-ring"></div>
                  <div className="avatar-icon">🤖</div>
                </div>
                <h2 className="welcome-title">{t.welcome}</h2>
                <p className="welcome-subtitle">{t.subtitle}</p>
                <p className="welcome-description">{t.description}</p>

                <div className="quick-actions">
                  <h3>{t.quickActions}</h3>
                  <div className="action-grid">
                    <button 
                      className="action-card"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <div className="action-icon scan">📸</div>
                      <span>{t.scanImage}</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => handleQuickAction('pest')}
                    >
                      <div className="action-icon pest">🐛</div>
                      <span>{t.pestControl}</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => handleQuickAction('fertilizer')}
                    >
                      <div className="action-icon fertilizer">🌱</div>
                      <span>{t.fertilizer}</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => handleQuickAction('weather')}
                    >
                      <div className="action-icon weather">☁️</div>
                      <span>{t.weather}</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => handleQuickAction('crop')}
                    >
                      <div className="action-icon crop">🌾</div>
                      <span>{t.cropAdvice}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChatBox messages={messages} isTyping={isLoading} />
          )}
        </div>

        {/* INPUT AREA */}
        <div className="input-container">
          {base64Image && (
            <div className="image-preview">
              <img src={base64Image} alt="Upload preview" />
              <button 
                className="remove-image" 
                onClick={() => setBase64Image("")}
                aria-label="Remove image"
              >
                <FaTimes />
              </button>
            </div>
          )}
          
          <div className="input-wrapper">
            <button 
              className="attach-btn" 
              onClick={() => fileInputRef.current.click()}
              aria-label="Attach image"
            >
              📎
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: "none" }}
            />
            <input 
              className="chat-input" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              disabled={isLoading}
              aria-label="Message input"
            />
            <button 
              className="send-btn" 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && !base64Image)}
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;