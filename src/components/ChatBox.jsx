import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaUser, FaRobot, FaLeaf, FaFlask, FaTags } from "react-icons/fa";

const ChatBox = ({ messages, isTyping, onActionClick }) => {
  const scrollRef = useRef(null);

  // Auto-scroll when messages change is handled by ScrollView in App.jsx usually, 
  // but we keep this ref for the dummy div at the bottom if needed.
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Chips data with icons
  const actionChips = [
    { label: "Organic Solution", icon: <FaLeaf />, value: "Give me organic/desi solutions for this." },
    { label: "Chemical Solution", icon: <FaFlask />, value: "What are the chemical pesticides for this?" },
    { label: "Market Price", icon: <FaTags />, value: "What is the approximate market price for the medicine?" }
  ];

  return (
    <div className="chat-content">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`message-wrapper ${msg.sender === "user" ? "user" : "bot"}`}
        >
          <div className="message-avatar">
            {msg.sender === "user" ? <FaUser /> : <FaRobot />}
          </div>

          <div className="message-bubble">
            {msg.image && (
              <div className="message-image-container">
                <img src={msg.image} alt="uploaded content" className="chat-img-preview" />
              </div>
            )}

            <div className="markdown-content">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>

            {msg.cost && (
              <div className="cost-tag">
                <span>Cost: ${msg.cost.toFixed(5)}</span>
              </div>
            )}

            <span className="message-time">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="message-wrapper bot">
          <div className="message-avatar"><FaRobot /></div>
          <div className="message-bubble typing">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      )}

      {/* Suggested Actions Chips */}
      {!isTyping && messages.length > 0 && messages[messages.length - 1].sender === "bot" && (
        <div className="action-chips-container">
          {actionChips.map((chip, index) => (
            <button
              key={index}
              className="chip-btn"
              onClick={() => onActionClick(chip.value)}
            >
              {chip.icon}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} />
    </div>
  );
};

export default ChatBox;
