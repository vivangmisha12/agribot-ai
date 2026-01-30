import React, { useState, useRef } from "react";
import ChatBox from "./components/ChatBox";
import Swal from 'sweetalert2';
import "./style.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [base64Image, setBase64Image] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const languages = ["Hindi", "English", "Punjabi", "Marathi", "Telugu", "Bhojpuri", "Gujarati"];
  const suggestions = ["Tomato pest control?", "Best fertilizer for Wheat?", "Identify this plant disease"];

  // --- COMPRESSION + SWAL LOGIC ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB Limit
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload an image smaller than 10MB.',
          width: '320px',
          confirmButtonText: 'OK',
          confirmButtonColor: '#28a745',
          padding: '1.25rem',
        });
        e.target.value = "";
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
          const scaleSize = MAX_WIDTH / img.width;
          
          canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Render server crash na ho isliye quality 0.7 rakhi hai
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setBase64Image(compressedBase64);
        };
      };
    }
  };

  // --- API SEND LOGIC ---
  const handleSend = async (text = input) => {
    if (!text.trim() && !base64Image) return;

    const userMsg = { sender: "user", text: text, image: base64Image };
    setMessages((prev) => [...prev, userMsg]);
    
    const currentImage = base64Image;
    setInput("");
    setBase64Image("");
    setIsLoading(true);

    try {
      const response = await fetch("https://agribot-ai-hwff.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: text || "Analyze this image", // Image only support
          image_url: currentImage || null,
          language: selectedLang 
        }),
      });

      const data = await response.json();
      if (data.error) {
        setMessages((prev) => [...prev, { sender: "bot", text: `❌ Error: ${data.reply}` }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply, cost: data.cost }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Connection error! Is backend awake?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">🌾</div>
            <div className="header-text">
              <h1>AgriBot AI</h1>
              <p>Your Digital Agronomist</p>
            </div>
          </div>
          <div className="lang-dropdown">
            🌐
            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
              {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
        </header>

        <ChatBox messages={messages} isTyping={isLoading} onActionClick={(v) => handleSend(v)} />

        {messages.length === 0 && (
          <div className="suggestions">
            {suggestions.map((s, i) => <button key={i} onClick={() => handleSend(s)}>{s}</button>)}
          </div>
        )}

        <div className="bottom-section-wrapper">
          <div className="input-area">
            {base64Image && (
              <div className="image-preview-container">
                <img src={base64Image} alt="preview" className="preview-thumbnail" />
                <button className="remove-img" onClick={() => setBase64Image("")}>×</button>
              </div>
            )}
            <div className="input-row-wrapper">
              <button className="attach-btn" onClick={() => fileInputRef.current.click()}>📷</button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: "none" }} />
              <input className="main-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask AgriBot..." />
              <button className="send-btn" onClick={() => handleSend()} disabled={isLoading}>{isLoading ? "..." : "Send"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;