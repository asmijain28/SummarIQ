import { forwardRef, useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Mic, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { chatWithDocument } from '../api/summariq';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSectionProps {
  file: File | null;
}


export const ChatSection = forwardRef<HTMLElement, ChatSectionProps>(
  ({ file }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: '1',
        role: 'assistant',
        content: `Hello! I've analyzed your document ""${file?.name ?? "your document"}"". I can answer any questions about its content. What would you like to know?`,
      },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isTyping]);

const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: input,
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput('');
  setIsTyping(true);

  try {
    const fileId = sessionStorage.getItem('currentFileId');
    if (!fileId) throw new Error('No file ID');

    const result = await chatWithDocument(fileId, input);
    
    if (result.success) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.data.answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }
  } catch (error) {
    console.error('Chat error:', error);
    toast.error('Failed to get response');
  } finally {
    setIsTyping(false);
  }
};

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleVoiceInput = () => {
      toast.info('Voice input feature coming soon!');
    };

    return (
      <section
        ref={ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#1E293B',
              }}
            >
              Interactive AI Assistant
            </h2>
            <p
              className="text-xl mb-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              Ask questions about your uploaded document
            </p>
            <p
              className="text-sm"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#94A3B8',
              }}
            >
              ⚠️ SummarIQ only answers based on your uploaded document
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header */}
            <div
              className="p-6 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <MessageSquare className="w-6 h-6" style={{ color: 'white' }} />
              </div>
              <div>
                <h3
                  className="text-lg"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: 'white',
                  }}
                >
                  Ask SummarIQ
                </h3>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  Powered by AI
                </p>
              </div>
              <motion.div
                className="ml-auto"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: '#FACC15' }} />
              </motion.div>
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              className="h-[500px] overflow-y-auto p-6 space-y-4"
              style={{
                backgroundColor: '#F8FAFC',
                scrollbarWidth: 'thin',
              }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    )}

                    <div
                      className="max-w-[70%] rounded-2xl px-6 py-4"
                      style={{
                        backgroundColor:
                          message.role === 'user'
                            ? '#2563EB'
                            : 'white',
                        color: message.role === 'user' ? 'white' : '#1E293B',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow:
                          message.role === 'user'
                            ? '0 4px 12px rgba(37, 99, 235, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.06)',
                        lineHeight: '1.6',
                      }}
                    >
                      <p>{message.content}</p>
                    </div>

                    {message.role === 'user' && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: '#DBEAFE',
                        }}
                      >
                        <User className="w-6 h-6" style={{ color: '#2563EB' }} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className="rounded-2xl px-6 py-4"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#2563EB' }}
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#2563EB' }}
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#2563EB' }}
                      />
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#94A3B8',
                      }}
                    >
                      SummarIQ is thinking...
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div
              className="p-6 border-t"
              style={{
                borderColor: '#E2E8F0',
                backgroundColor: 'white',
              }}
            >
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything related to your uploaded document..."
                  className="resize-none rounded-xl flex-1"
                  rows={2}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    borderColor: '#CBD5E1',
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleVoiceInput}
                    size="icon"
                    variant="outline"
                    className="rounded-xl"
                    style={{
                      borderColor: '#CBD5E1',
                      color: '#64748B',
                    }}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="rounded-xl"
                    disabled={!input.trim() || isTyping}
                    style={{
                      background:
                        input.trim() && !isTyping
                          ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                          : '#CBD5E1',
                    }}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
);

ChatSection.displayName = 'ChatSection';
