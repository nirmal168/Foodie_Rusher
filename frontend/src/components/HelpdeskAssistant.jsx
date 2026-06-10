import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Headset } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HelpdeskAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Foodie Rusher Helpdesk 🤖. How can I assist you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const query = input.trim();
    setMessages(prev => [...prev, { text: query, isBot: false }]);
    setInput('');
    setTimeout(() => generateResponse(query.toLowerCase()), 500);
  };

  const generateResponse = (query) => {
    let response = "I'm sorry, I didn't understand that. Could you please rephrase?";
    if (query.includes('order')) {
      response = 'You can view your order status in the Profile > Order History section.';
    } else if (query.includes('payment')) {
      response = 'We accept Razorpay, COD, and credit cards. For payment issues, check the Payments page.';
    } else if (query.includes('delivery')) {
      response = 'Delivery times vary by location. You can track your order in real‑time from the dashboard.';
    } else if (query.includes('account') || query.includes('profile')) {
      response = 'You can update your personal details and preferences in the Profile settings.';
    } else if (query.includes('refund') || query.includes('return')) {
      response = 'Refunds are processed within 5‑7 business days. Please contact support if you need assistance.';
    }
    setMessages(prev => [...prev, { text: response, isBot: true }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-slate-900 justify-between p-4 flex items-center shadow-md">
              <div className="flex items-center gap-3 text-white">
                <div className="bg-primary-500 p-2 rounded-full">
                  <Headset size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Helpdesk AI</h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Support Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-medium leading-relaxed ${msg.isBot ? 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none' : 'bg-primary-500 text-white shadow-md shadow-primary-200 rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Input Form */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a support question..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4"
                />
                <button
                  onClick={handleSend}
                  className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 transition-colors shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-400/50 relative group"
      >
        <Sparkles size={24} className={`absolute top-4 right-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity ${isOpen ? 'hidden' : ''}`} />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default HelpdeskAssistant;

