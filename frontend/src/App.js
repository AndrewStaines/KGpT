import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Spinner from './component/Spinner';
import './App.css';

// CodeRenderer component to render code snippets with chat-like styling
function CodeRenderer({ text }) {
  const codeRegex = /```([\s\S]+?)```/g; // Regular expression to match code snippets
  const parts = text.split(codeRegex); // Split text based on code snippets

  return (
    <div className="code-container">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // Render code snippet in chat-like format
          return (
            <div key={index} className="code-snippet">
              <pre>
                <code>{part}</code>
              </pre>
            </div>
          );
        } else {
          // Render regular text
          return <span key={index}>{part}</span>;
        }
      })}
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    setIsLoading(true);

    try {
      const userMessage = { id: messages.length + 1, role: 'user', content: userInput };
      setMessages((prevMessages) => [...prevMessages, userMessage]); // Append user message

      const prompt = userInput
      setUserInput('');

      const response = await axios.post('http://localhost:5000/message', { prompt: prompt });
      const assistantMessage = { id: messages.length + 2, role: 'assistant', content: response.data.assistant_message };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]); // Append assistant message

      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userInput.trim() !== '') {
      sendMessage();
      e.preventDefault();
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom on message update
  }, [messages]);

  return (
    <div className="App">
      <div className="App-header">
        <h1>KGpT</h1>
        <div className="message-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.role === 'assistant' ? <CodeRenderer text={msg.content} /> : msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Ref for scrolling */}
        </div>
        {isLoading && <Spinner />}
        <div className="input-container">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What is your query?"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
