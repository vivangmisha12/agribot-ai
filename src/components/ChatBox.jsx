import React from "react";
import ReactMarkdown from "react-markdown";

const ChatBox = ({ messages, isTyping, onActionClick }) => {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Chips data
  const actionChips = [
    { label: "🌱 Organic Solution", value: "Give me organic/desi solutions for this." },
    { label: "🧪 Chemical Solution", value: "What are the chemical pesticides for this?" },
    { label: "💰 Market Price", value: "What is the approximate market price for the medicine?" }
  ];

  return (
    <div className="chatbox">
      {messages.map((msg, i) => (
        <div key={i} className={`message-container ${msg.sender === "user" ? "user-right" : "bot-left"}`}>
          <div className="avatar">{msg.sender === "user" ? "👨‍🌾" : "🤖"}</div>
          <div className={`message-bubble ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
            {msg.image && <img src={msg.image} alt="crop" className="chat-img-preview" />}
            <ReactMarkdown>{msg.text}</ReactMarkdown>
            {msg.cost && <small className="cost-tag">${msg.cost.toFixed(5)}</small>}
          </div>
        </div>
      ))}

      {/* Quick Action Chips: Sirf tab dikhenge jab bot last reply de chuka ho */}
      {!isTyping && messages.length > 0 && messages[messages.length - 1].sender === "bot" && (
        <div className="action-chips-container">
          {actionChips.map((chip, index) => (
            <button 
              key={index} 
              className="chip-btn" 
              onClick={() => onActionClick(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {isTyping && (
        <div className="message-container bot-left">
          <div className="avatar">🤖</div>
          <div className="message-bubble bot-msg typing"><span></span><span></span><span></span></div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
};

export default ChatBox;