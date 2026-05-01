import React, { useEffect, useRef, useState } from "react";

function ChatAssistant({ role, currentTab }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "bot", text: "Please choose your language / कृपया भाषा चुनें:\n1. English\n2. हिंदी\n3. Marathi\n4. Punjabi\n5. Chhattisgarhi", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Text-To-Speech function
  const speakText = (text, langStr) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to set correct language accent based on selected language
    if (langStr === 'Hindi') utterance.lang = 'hi-IN';
    else if (langStr === 'Marathi') utterance.lang = 'mr-IN';
    else if (langStr === 'Punjabi') utterance.lang = 'pa-IN';
    else utterance.lang = 'en-IN'; // Default to Indian English for others
    
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageSelect = (selectedLang) => {
    setLanguage(selectedLang);
    const greetingMsg = "Hello! 👋\nMain aapki kya help kar sakta hoon?\n\n1. 🪪 Voter ID check karna\n2. 📋 Voter details dekhna\n3. 🗳️ Voting process samajhna\n4. ❓ Sawal / Doubt puchna\n5. 🚨 Complaint karna\n6. 🎥 Voting demo dekhna";
                        
    const newChat = [
      ...chat,
      { sender: "user", text: selectedLang, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { sender: "bot", text: greetingMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];
    setChat(newChat);
    speakText(greetingMsg, selectedLang);
  };

  const sendMessage = async (customMsg = null) => {
    const textToSend = customMsg || message;
    if (!textToSend.trim() && !language) return;
    if (!language) {
      // If language not set, try to match it from text
      const input = textToSend.toLowerCase();
      if (input.includes('hindi') || input.includes('2')) return handleLanguageSelect('Hindi');
      if (input.includes('marathi') || input.includes('3')) return handleLanguageSelect('Marathi');
      if (input.includes('punjabi') || input.includes('4')) return handleLanguageSelect('Punjabi');
      if (input.includes('chhattisgarhi') || input.includes('5')) return handleLanguageSelect('Chhattisgarhi');
      return handleLanguageSelect('English');
    }

    const newChat = [
      ...chat,
      { sender: "user", text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];

    setChat(newChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("https://election-ai-assistant-production.up.railway.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language: language,
          context: `Role: Smart AI Election Assistant for India. Goal: Guide users step-by-step. Tab: ${currentTab}. Rules: Be simple, interactive, use Hindi/Hinglish (unless English). Features: 1. Voter ID Check 2. Voter Details 3. Voting Process (Step by step) 4. Smart Doubt Solver (3 parts: simple, example, summary) 5. Complaints 6. Voting Demo.`
        })
      });

      if (!res.ok) throw new Error("Backend connection failed");

      const data = await res.json();
      const botReply = data.reply || data.error;

      setChat([
        ...newChat,
        { sender: "bot", text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      speakText(botReply, language);
      
    } catch (err) {
      console.error(err);
      
      // Smart Mock logic based on user input
      let fallbackText = "Main samajh nahi paaya. Kya aap apna sawal alag tarike se puch sakte hain?";
      const lowerInput = textToSend.toLowerCase();
      
      if (lowerInput.includes('voter id') || lowerInput.includes('1')) {
        fallbackText = "Apna Voter ID enter karein (e.g. EV-1001)";
      } else if (lowerInput.includes('ev-1001') || lowerInput.includes('ev-')) {
        fallbackText = "Name: Rohan Sharma\nAge: 25\nArea: Pune\n\n✅ Aap vote dene ke liye eligible hain";
      } else if (lowerInput.includes('details') || lowerInput.includes('2')) {
        fallbackText = "Aapki details:\nName: Rohan Sharma\nAge: 25\nArea: Pune\n\nKya aap ise correct karna chahte hain? (Yes/No)";
      } else if (lowerInput.includes('process') || lowerInput.includes('3')) {
        fallbackText = "Voting Process:\n1. Polling booth par jana\n2. Voter ID dikhana\n3. Finger par ink lagana\n4. EVM machine par vote dena\n5. VVPAT slip verify karna\n\nKya aapko ye samajh aaya? (Yes/No)";
      } else if (lowerInput.includes('yes') || lowerInput.includes('samajh aa gaya')) {
        fallbackText = "Bahut badhiya! 😊 Aur kuch janna chahte hain?";
      } else if (lowerInput.includes('no') || lowerInput.includes('nahi')) {
        fallbackText = "Koi baat nahi! Aasan shabdo me: Aapko booth jana hai, ID dikhana hai, machine me button dabana hai aur slip check karna hai. Ab clear hua?";
      } else if (lowerInput.includes('doubt') || lowerInput.includes('sawal') || lowerInput.includes('4')) {
        fallbackText = "Aapka kya sawal hai? (e.g. 'Vote kab de sakte hain?')";
      } else if (lowerInput.includes('kab de sakte')) {
        fallbackText = "→ Age 18+ hona chahiye\n→ Example: agar aap 2006 me born ho to 2024 me eligible\n→ Summary: 18 saal ke baad hi vote de sakte hain\n\nKya aapka doubt clear ho gaya?";
      } else if (lowerInput.includes('complaint') || lowerInput.includes('5')) {
        fallbackText = "Aapko kya problem aa rahi hai?\n- Naam voter list me nahi hai\n- Galat details hai\n- Polling booth nahi mil raha";
      } else if (lowerInput.includes('naam') || lowerInput.includes('list')) {
        fallbackText = "Solution: Aap Election Commission ke portal nvsp.in par jake Form 6 bhar sakte hain.\nNext step: Online portal par jaayein.";
      } else if (lowerInput.includes('demo') || lowerInput.includes('6')) {
        fallbackText = "Voting Demo:\n🔘 Candidate A (Development Party)\n🔘 Candidate B (Progress Party)\n\n(Type 'Vote A' or 'Vote B')";
      } else if (lowerInput.includes('vote a') || lowerInput.includes('vote b') || lowerInput.includes('candidate')) {
        fallbackText = "✅ Aapka vote successfully cast ho gaya";
      }

      setChat([
        ...newChat,
        { sender: "bot", text: `🤖 Offline Mode:\n${fallbackText}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      speakText(`Offline Mode: ${fallbackText}`, language);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span role="img" aria-label="bot">🤖</span> ElectionVerse AI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (voiceEnabled) window.speechSynthesis.cancel();
            }}
            style={{ ...styles.languageSelect, padding: '4px 8px', background: voiceEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: voiceEnabled ? '#4ade80' : '#f87171', border: 'none' }}
          >
            {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
          <select 
            value={language || "English"} 
            onChange={(e) => {
              if(!language) handleLanguageSelect(e.target.value);
              else setLanguage(e.target.value);
            }}
            style={styles.languageSelect}
            aria-label="Select Language"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Punjabi">ਪੰਜਾਬी (Punjabi)</option>
            <option value="Chhattisgarhi">छत्तीसगढ़ी (CG)</option>
          </select>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={styles.chatBox} role="log" aria-live="polite" aria-atomic="false">
        {chat.length === 0 && (
          <div style={styles.welcomeMessage}>
            <p>Welcome! Ask me anything about voting and elections.</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.messageWrapper,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.message,
                background: msg.sender === "user" ? "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)" : "rgba(0, 180, 219, 0.15)",
                color: "white",
                borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
                borderBottomLeftRadius: msg.sender === "user" ? "16px" : "4px",
                border: msg.sender === "bot" ? "1px solid rgba(0, 180, 219, 0.3)" : "none",
                boxShadow: msg.sender === "user" ? "0 4px 15px rgba(0, 180, 219, 0.3)" : "none",
                whiteSpace: "pre-line" // Important to render \n correctly for options
              }}
            >
              <div style={styles.messageText}>{msg.text}</div>
              <div style={styles.time}>{msg.time}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.typingWrapper}>
            <div style={styles.typingIndicator}>
              <span style={styles.typingDot} className="dot-1"></span>
              <span style={styles.typingDot} className="dot-2"></span>
              <span style={styles.typingDot} className="dot-3"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* QUICK ACTIONS / SMART CHIPS */}
      {language && (
        <div style={styles.chipsContainer}>
          <button onClick={() => sendMessage("1. Voter ID check karna")} style={styles.chip}>1. Voter ID Check</button>
          <button onClick={() => sendMessage("2. Voter details dekhna")} style={styles.chip}>2. Details</button>
          <button onClick={() => sendMessage("3. Voting process samajhna")} style={styles.chip}>3. Process</button>
          <button onClick={() => sendMessage("4. Sawal / Doubt puchna")} style={styles.chip}>4. Doubt Solver</button>
          <button onClick={() => sendMessage("5. Complaint karna")} style={styles.chip}>5. Complaints</button>
          <button onClick={() => sendMessage("6. Voting demo dekhna")} style={styles.chip}>6. Demo</button>
        </div>
      )}

      {/* INPUT AREA */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={language ? `Type your message in ${language}...` : `Type language name or 1/2/3...`}
            style={styles.input}
            aria-label="Chat input"
          />
          <button onClick={() => sendMessage()} style={styles.button} disabled={loading || !message.trim()} aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100%",
    minHeight: "500px",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #0a192f 0%, #020c1b 100%)", // Deep attractive blue
    color: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 180, 219, 0.2)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    border: "1px solid rgba(0, 180, 219, 0.2)"
  },
  header: {
    padding: "16px 20px",
    background: "rgba(10, 25, 47, 0.8)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(0, 180, 219, 0.2)",
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(90deg, #00B4DB, #0083B0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  languageSelect: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    backdropFilter: "blur(5px)",
  },
  chatBox: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
    scrollBehavior: "smooth",
  },
  welcomeMessage: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "auto",
    marginBottom: "auto",
    padding: "20px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    border: "1px dashed rgba(255,255,255,0.1)",
  },
  messageWrapper: {
    maxWidth: "80%",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "16px",
    position: "relative",
    lineHeight: "1.5",
    fontSize: "15px",
  },
  messageText: {
    wordBreak: "break-word",
  },
  time: {
    fontSize: "10px",
    opacity: 0.7,
    marginTop: "6px",
    textAlign: "right",
  },
  typingWrapper: {
    alignSelf: "flex-start",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "12px 16px",
    borderRadius: "16px",
    borderBottomLeftRadius: "4px",
    width: "fit-content",
  },
  typingIndicator: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    height: "20px",
  },
  typingDot: {
    width: "6px",
    height: "6px",
    background: "#00B4DB",
    borderRadius: "50%",
    animation: "typing 1.4s infinite ease-in-out both",
  },
  chipsContainer: {
    display: "flex",
    gap: "8px",
    padding: "0 20px 10px 20px",
    overflowX: "auto",
    whiteSpace: "nowrap",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE
  },
  chip: {
    background: "rgba(0, 180, 219, 0.15)",
    border: "1px solid rgba(0, 180, 219, 0.4)",
    color: "#00B4DB",
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.2s"
  },
  inputContainer: {
    padding: "16px 20px",
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "rgba(0, 180, 219, 0.1)",
    border: "1px solid rgba(0, 180, 219, 0.3)",
    borderRadius: "24px",
    padding: "4px 4px 4px 16px",
    transition: "border-color 0.3s",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "15px",
    outline: "none",
    padding: "8px 0",
  },
  button: {
    background: "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s, opacity 0.2s, boxShadow 0.2s",
    flexShrink: 0,
    boxShadow: "0 4px 15px rgba(0, 180, 219, 0.4)",
  }
};

// Add global styles for animation
const globalStyles = `
@keyframes typing {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
}
.dot-1 { animation-delay: 0s; }
.dot-2 { animation-delay: 0.2s; }
.dot-3 { animation-delay: 0.4s; }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  if (!document.getElementById('chat-assistant-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'chat-assistant-styles';
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
  }
}

export default React.memo(ChatAssistant);