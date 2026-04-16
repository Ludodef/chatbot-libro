import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Send, Sparkles, Library, ScrollText, XCircle, Bookmark, BookmarkCheck, Share2, Trash2, ChevronRight, BookMarked } from 'lucide-react';
import { startChat } from '../services/geminiService';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface SavedBook {
  id: string;
  title: string;
  author: string;
  pitch: string;
  spark: string;
  addedAt: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('custode_saved_books');
    if (saved) {
      setSavedBooks(JSON.parse(saved));
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('custode_saved_books', JSON.stringify(savedBooks));
  }, [savedBooks]);

  useEffect(() => {
    const initChat = async () => {
      // Get memory for the prompt
      const historyContext = savedBooks.map(b => b.title).join(', ');
      const session = await startChat(historyContext);
      setChatSession(session);
      
      const initialGreeting = "Ciao! Sono il tuo bibliotecario digitale. Ti aiuto a trovare il libro giusto in 3 domande! Qual è l’ultimo libro letto o il tuo genere preferito? Cerchi qualcosa di leggero o un mattone impegnativo?";
      setMessages([{ role: 'model', text: initialGreeting }]);
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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

  const saveToLibrary = (text: string) => {
    // Basic parser for recommendations
    // Expects: **Title - Author**
    const matches = text.match(/\*\*(.*?)\*\*/g);
    if (!matches) return;

    const excludedLabels = ['Il Pitch', 'La Scintilla', 'Pitch', 'Scintilla'];

    const newBooks: SavedBook[] = matches
      .map(m => m.replace(/\*\*/g, '').trim())
      .filter(m => {
        // Exclude common labels and short snippets that aren't books
        const isLabel = excludedLabels.some(label => m.toLowerCase().includes(label.toLowerCase()));
        return !isLabel && m.length > 3;
      })
      .map(titleAuthor => {
        const parts = titleAuthor.split(' - ');
        const title = parts[0]?.trim() || titleAuthor;
        const author = parts[1]?.trim() || 'Autore Ignoto';
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          title,
          author,
          pitch: "Salvato dai tuoi consigli",
          spark: "",
          addedAt: Date.now()
        };
      });

    const filtered = newBooks.filter(nb => !savedBooks.find(sb => sb.title === nb.title));
    if (filtered.length > 0) {
      setSavedBooks(prev => [...prev, ...filtered]);
    }
  };

  const removeBook = (id: string) => {
    setSavedBooks(prev => prev.filter(b => b.id !== id));
  };

  const shareLibrary = () => {
    const list = savedBooks.map(b => `• ${b.title} di ${b.author}`).join('\n');
    const text = `Ecco la mia lista di letture curata dal Custode della Biblioteca Infinita:\n\n${list}`;
    navigator.clipboard.writeText(text);
    alert("Lista copiata negli appunti! Ora puoi condividerla.");
  };

  return (
    <div className="flex h-screen bg-[#f5f5f0] text-[#2c2c2c] overflow-hidden">
      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${showLibrary ? 'pr-0 sm:pr-80' : ''}`}>
        {/* Header */}
        <header className="bg-[#5A5A40] text-white p-6 shadow-lg flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Library className="w-8 h-8" />
            <div>
              <h1 className="text-xl sm:text-2xl heading-font font-bold tracking-tight">Il Custode della Biblioteca Infinita</h1>
              <p className="text-[10px] sm:text-xs opacity-80 italic italic-small tracking-wider uppercase">Dove ogni libro trova il suo destino</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-xs heading-font italic"
          >
            <BookMarked className="w-4 h-4" />
            <span className="hidden sm:inline">La Mia Biblioteca</span>
            {savedBooks.length > 0 && (
              <span className="bg-white text-[#5A5A40] px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {savedBooks.length}
              </span>
            )}
          </button>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-thin scrollbar-thumb-[#5A5A40]/20"
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
                  className={`max-w-[90%] sm:max-w-[75%] p-6 rounded-2xl shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-[#5A5A40] text-white rounded-tr-none' 
                      : 'bg-white border border-[#e5e5e0] rounded-tl-none'
                  }`}
                >
                  {msg.role === 'model' && (
                    <>
                      <div className="absolute -top-3 -left-3 bg-[#f5f5f0] p-1.5 rounded-full border border-[#e5e5e0] shadow-sm">
                        <BookOpen className="w-4 h-4 text-[#5A5A40]" />
                      </div>
                      <button 
                        onClick={() => saveToLibrary(msg.text)}
                        className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full border border-[#e5e5e0] shadow-sm hover:scale-110 transition-transform text-[#5A5A40] opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Salva i libri in biblioteca"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <div className={`prose prose-sm max-w-none text-sm leading-relaxed ${msg.role === 'user' ? 'prose-invert' : 'text-gray-700'}`}>
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
              <div className="bg-white p-6 rounded-2xl rounded-tl-none border border-[#e5e5e0] flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs italic text-gray-400 heading-font">Il Custode sta sfogliando i volumi antichi...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-8 bg-white/50 backdrop-blur-sm border-t border-[#e5e5e0]">
          <div className="max-w-4xl mx-auto relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Sussurra un desiderio al Custode..."
              className="w-full p-5 pr-16 bg-white border border-[#e5e5e0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5A5A40]/5 resize-none min-h-[64px] max-h-[160px] shadow-inner transition-all text-sm leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-4 bottom-4 p-3 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4a4a34] transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 opacity-30 text-[10px] uppercase tracking-[0.2em] font-mono text-[#5A5A40]">
            <span>Archivio Aperto</span>
            <div className="w-1 h-1 bg-[#5A5A40] rounded-full" />
            <span>Memoria Attiva</span>
            <div className="w-1 h-1 bg-[#5A5A40] rounded-full" />
            <span>Inchiostro Infinito</span>
          </div>
        </div>
      </div>

      {/* Library Sidebar (Mobile Drawer / Desktop Side) */}
      <AnimatePresence>
        {showLibrary && (
          <>
            {/* Backdrop for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLibrary(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 sm:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-[#e5e5e0] shadow-2xl z-30 flex flex-col"
            >
              <div className="p-6 border-b border-[#e5e5e0] bg-[#f9f9f7] flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#5A5A40]">
                  <BookmarkCheck className="w-6 h-6" />
                  <h2 className="text-lg heading-font font-bold">La Mia Biblioteca</h2>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {savedBooks.length === 0 ? (
                  <div className="text-center py-20 px-6 opacity-40">
                    <ScrollText className="w-12 h-12 mx-auto mb-4" />
                    <p className="heading-font italic text-sm text-balance">Gli scaffali sono ancora vuoti. Chiedi al Custode e salva le tue storie preferite qui.</p>
                  </div>
                ) : (
                  savedBooks.sort((a,b) => b.addedAt - a.addedAt).map(book => (
                    <motion.div 
                      key={book.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-[#f9f9f7] border border-[#e5e5e0] rounded-xl group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="heading-font font-bold text-[#5A5A40] pr-6 text-sm">{book.title}</h3>
                        <button 
                          onClick={() => removeBook(book.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 italic mb-2">di {book.author}</p>
                      <div className="h-0.5 w-0 bg-[#5A5A40] transition-all group-hover:w-full duration-500" />
                    </motion.div>
                  ))
                )}
              </div>

              {savedBooks.length > 0 && (
                <div className="p-6 border-t border-[#e5e5e0] bg-white">
                  <button 
                    onClick={shareLibrary}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#5A5A40] text-white rounded-xl heading-font hover:bg-[#4a4a34] transition-all shadow-lg active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    Condividi Lista
                  </button>
                  <p className="text-[10px] text-center mt-3 text-gray-400 uppercase tracking-widest font-mono">
                    Goodreads non è che l'inizio
                  </p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

