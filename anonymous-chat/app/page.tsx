'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  user: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate random anonymous username
    const randomName = `Anon${Math.floor(Math.random() * 10000)}`;
    setUsername(randomName);

    // Poll for new messages every 1 second
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          user: username,
        }),
      });

      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      <header className="bg-black/30 backdrop-blur-sm p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Anonymous Chat</h1>
          <div className="text-sm text-purple-200">
            You are: <span className="font-semibold text-purple-100">{username}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto p-4">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-black/20 backdrop-blur-sm rounded-lg p-4 shadow-xl">
          {messages.length === 0 ? (
            <div className="text-center text-purple-200 py-12">
              <p className="text-lg">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user === username ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-lg ${
                    message.user === username
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/90 text-gray-900'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">{message.user}</div>
                  <div className="break-words">{message.text}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your anonymous message..."
            className="flex-1 px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
            maxLength={500}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Send
          </button>
        </form>
      </main>

      <footer className="bg-black/30 backdrop-blur-sm p-3 text-center text-purple-200 text-sm">
        <p>Anonymous chat • All messages are public • {messages.length} messages</p>
      </footer>
    </div>
  );
}
