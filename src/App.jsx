import React, { useState, useRef } from "react";
import ChatBox from "./components/ChatBox";
import Swal from 'sweetalert2';
import "./style.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedLang, setSelectedLang] = useState("Hindi"); // Default Language
  const [base64Image, setBase64Image] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const languages = ["Hindi", "English", "Punjabi", "Marathi", "Telugu", "Bhojpuri", "Gujarati"];

  const suggestions = [
    "Tomato pest control?",
    "Best fertilizer for Wheat?",
    "Identify this plant disease"
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 10MB limit (10 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;

      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload an image smaller than 10MB.',
          confirmButtonColor: '#4CAF50',
          width: '320px',           // Poore box ki width fix karega
          confirmButtonText: 'OK',
          confirmButtonColor: '#28a745', // AgriBot wala green color
          padding: '1.25rem',       // Inner spacing kam karega
          customClass: {
            title: 'swal-title-small', // Hum CSS se title chota karenge
            htmlContainer: 'swal-text-small'
          }
        });
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim() && !base64Image) return;

    const userMsg = { 
      sender: "user", 
      text: text, 
      image: base64Image 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    const currentImage = base64Image;
    
    setInput("");
    setBase64Image("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: text,
          image_url: currentImage || null,
          language: selectedLang // Navbar se language uthayi
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [...prev, { sender: "bot", text: `❌ Error: ${data.reply}` }]);
      } else {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: data.reply,
          cost: data.cost 
        }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Connection error! Is backend running?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="app-container">
        {/* FIX: Updated Navbar with Language Selector */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">🌾</div>
            <div className="header-text">
              <h1>AgriBot AI</h1>
              <p>Your Digital Agronomist</p>
            </div>
          </div>
          
          <div className="lang-dropdown">
            <span role="img" aria-label="lang">🌐</span>
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </header>

        <ChatBox 
          messages={messages} 
          isTyping={isLoading} 
          onActionClick={(value) => handleSend(value)} 
        />

        {messages.length === 0 && (
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="input-area">
          {base64Image && (
            <div className="image-preview-container">
              <img src={base64Image} alt="preview" className="preview-thumbnail" />
              <button className="remove-img" onClick={() => setBase64Image("")}>×</button>
            </div>
          )}

          <div className="input-row-wrapper">
            <button className="attach-btn" onClick={() => fileInputRef.current.click()}>📷</button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
            <input
              className="main-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your problem..."
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={isLoading}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;