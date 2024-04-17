import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Spinner from './component/Spinner';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom
  const msg = new SpeechSynthesisUtterance()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    const dm = document.getElementById('dm');
    dm.style.display = 'none';
    setIsLoading(true);

    try {
      const userMessage = { id: messages.length + 1, role: 'user', content: userInput };
      setMessages((prevMessages) => [...prevMessages, userMessage]); // Append user message

      const prompt = userInput
      setUserInput('');

      const response = await axios.post('http://localhost:5000/message', { prompt: prompt });
      const assistantMessage = { id: messages.length + 2, role: 'assistant', content: response.data.assistant_message };
      msg.text = response.data.assistant_message
      window.speechSynthesis.speak(msg)
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
        <h1>ADBot</h1>
        <div className="message-container">
        <h1 id="dm">How Can I Help You Today!!!</h1>
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
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
            placeholder="Message ADBot..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
      <div className='copy-right'>
      <p>@Copyrights owned by KEC students</p>
      <p>@Made with the OpenAI API</p>
      </div>
    </div>
  );
}

export default App;