import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Send, Sparkles, Library, ScrollText, XCircle } from 'lucide-react';
import { startChat } from '../services/geminiService';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const session = await startChat();
      setChatSession(session);
      
      // Initial greeting as per requirements
      const initialGreeting = "Ciao! Sono il tuo bibliotecario digitale. Ti aiuto a trovare il libro giusto in 3 domande! Qual è l’ultimo libro letto o il tuo genere preferito? Cerchi qualcosa di leggero o un mattone impegnativo?";
      setMessages([{ role: 'model', text: initialGreeting }]);
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Errore nella comunicazione con il Custode:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Perdonami, caro lettore, ma un soffio di vento ha spento la mia candela. Potresti ripetere il tuo pensiero?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f0] text-[#2c2c2c] font-serif overflow-hidden">
      {/* Header */}
      <header className="bg-[#5A5A40] text-white p-6 shadow-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Library className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Il Custode della Biblioteca Infinita</h1>
            <p className="text-xs opacity-80 italic italic-small">Dove ogni libro trova il suo destino</p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 opacity-50 hidden sm:block" />
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-thin scrollbar-thumb-[#5A5A40]/20"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] sm:max-w-[70%] p-5 rounded-3xl shadow-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-[#5A5A40] text-white rounded-tr-none' 
                    : 'bg-white border border-[#e5e5e0] rounded-tl-none'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="absolute -top-3 -left-3 bg-[#f5f5f0] p-1 rounded-full border border-[#e5e5e0]">
                    <BookOpen className="w-4 h-4 text-[#5A5A40]" />
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-[#e5e5e0] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs italic text-gray-400 ml-2">Il Custode sta sfogliando i volumi...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white border-t border-[#e5e5e0]">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Scrivi al Custode..."
            className="w-full p-4 pr-16 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 resize-none min-h-[60px] max-h-[150px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 bottom-3 p-3 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4a4a34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-gray-400 uppercase tracking-widest">
          L'inchiostro non mente mai
        </p>
      </div>
    </div>
  );
}
