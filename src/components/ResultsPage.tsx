import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Tag, MessageSquare, Send, Copy, Trash2, ArrowLeft, Sparkles, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { generateSummary as generateSummaryAPI, extractKeywords as extractKeywordsAPI, generateExamQuestions as generateExamQuestionsAPI, chatWithDocument as chatWithDocumentAPI } from '../api/summariq';

interface ResultsPageProps {
  fileName: string;
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface KeyPoint {
  title: string;
  content: string;
}

interface ImportantQuestion {
  question: string;
  category: string;
}

export function ResultsPage({ fileName, onBack }: ResultsPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI study assistant. I can answer any questions about your uploaded document. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Summary state
  const [summaryOverview, setSummaryOverview] = useState('');
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Keywords state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(false);

  // Questions state
  const [importantQuestions, setImportantQuestions] = useState<ImportantQuestion[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load all data on mount
  useEffect(() => {
    const fileId = sessionStorage.getItem('currentFileId');
    if (!fileId) return;

    loadSummary(fileId);
    loadKeywords(fileId);
    loadQuestions(fileId);
  }, []);

  const loadSummary = async (fileId: string) => {
    setIsSummaryLoading(true);
    try {
      const result = await generateSummaryAPI(fileId, 'medium');
      if (result.success) {
        // If backend returns overview + keyPoints separately
        if (result.data.overview) {
          setSummaryOverview(result.data.overview);
        } else {
          setSummaryOverview(result.data.summary ?? '');
        }
        if (result.data.keyPoints) {
          setKeyPoints(result.data.keyPoints);
        }
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const loadKeywords = async (fileId: string) => {
    setIsKeywordsLoading(true);
    try {
      const result = await extractKeywordsAPI(fileId);
      if (result.success) {
        setKeywords(result.data.keywords ?? []);
      }
    } catch (error) {
      console.error('Failed to load keywords:', error);
    } finally {
      setIsKeywordsLoading(false);
    }
  };

  const loadQuestions = async (fileId: string) => {
    setIsQuestionsLoading(true);
    try {
      const result = await generateExamQuestionsAPI(fileId, 5);
      if (result.success && result.data.questions.length > 0) {
        const mapped: ImportantQuestion[] = result.data.questions.map((q: any) => ({
          question: q.question,
          category: q.type ?? 'General',
        }));
        setImportantQuestions(mapped);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const fileId = sessionStorage.getItem('currentFileId');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      if (fileId) {
        const result = await chatWithDocumentAPI(fileId, input);
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data?.answer ?? result.data?.response ?? 'I could not find an answer in your document.',
        };
        setMessages((prev) => [...prev, aiResponse]);
      } else {
        throw new Error('No file ID');
      }
    } catch (error) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I was unable to process your question. Please try again.',
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownload = () => {
    const text = [
      summaryOverview,
      '',
      ...keyPoints.map((p) => `${p.title}:\n${p.content}`),
    ].join('\n\n');

    if (!text.trim()) {
      toast.error('No summary to download.');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded successfully!');
  };

  const handleCopyKeyPoints = () => {
    const text = keyPoints.map((point) => `${point.title}: ${point.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Key points copied to clipboard!');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI study assistant. I can answer any questions about your uploaded document. What would you like to know?",
      },
    ]);
    toast.success('Chat cleared!');
  };

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #22C55E 100%)' }}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#1E293B]">{fileName}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCopyKeyPoints} variant="outline" className="rounded-xl">
              <Copy className="w-4 h-4 mr-2" />
              Copy Key Points
            </Button>
            <Button onClick={handleDownload} className="rounded-xl text-white" style={{ backgroundColor: '#22C55E' }}>
              <Download className="w-4 h-4 mr-2" />
              Download Summary
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
          {/* Left Panel - Summary & Questions */}
          <div className="space-y-6 overflow-y-auto pr-4" style={{ scrollbarWidth: 'thin' }}>
            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-[#1E293B]">AI-Generated Summary</h2>
                </div>

                {isSummaryLoading ? (
                  <p className="text-[#94A3B8]">Generating summary...</p>
                ) : (
                  <>
                    <p className="text-[#475569] mb-6 leading-relaxed">{summaryOverview}</p>
                    <div className="space-y-4">
                      {keyPoints.map((point, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="p-4 rounded-2xl bg-gradient-to-r from-[#F8FAFC] to-[#EFF6FF] border border-[#E2E8F0]"
                        >
                          <h3 className="text-[#1E293B] mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }}></span>
                            {point.title}
                          </h3>
                          <p className="text-[#64748B] leading-relaxed">{point.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Highlighted Keywords */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF08A' }}>
                    <Tag className="w-6 h-6" style={{ color: '#CA8A04' }} />
                  </div>
                  <h2 className="text-[#1E293B]">Key Terms & Concepts</h2>
                </div>
                {isKeywordsLoading ? (
                  <p className="text-[#94A3B8]">Loading keywords...</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {keywords.map((keyword, index) => (
                      <motion.div
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className="px-5 py-2 rounded-full text-[#1E293B] cursor-pointer transition-all"
                          style={{
                            backgroundColor: '#FEF08A',
                            border: '2px solid #FDE047',
                            boxShadow: '0 4px 10px rgba(250, 204, 21, 0.3)',
                          }}
                        >
                          {keyword}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Important Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-[#1E293B]">Important Concepts & Questions</h2>
                </div>
                {isQuestionsLoading ? (
                  <p className="text-[#94A3B8]">Loading questions...</p>
                ) : (
                  <div className="space-y-3">
                    {importantQuestions.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        className="p-5 rounded-2xl bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#22C55E' }}
                          >
                            <span className="text-white">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-[#1E293B] mb-1">{item.question}</p>
                            <span className="text-[#22C55E]">{item.category}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="bg-white rounded-3xl flex flex-col h-full" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}>
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[#1E293B]">Ask SummarIQ</h2>
                      <p className="text-[#64748B]">AI answers based on your document</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    className="rounded-lg text-[#64748B] hover:text-[#1E293B]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE] border border-[#BAE6FD]">
                  <Sparkles className="w-4 h-4" style={{ color: '#3B82F6' }} />
                  <p className="text-[#0369A1]">
                    SummarIQ only answers based on your uploaded document
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}>
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white'
                              : 'bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] text-[#1E293B] border border-gray-200'
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3B82F6' }}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}>
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] border border-gray-200">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask anything about this document..."
                    className="resize-none rounded-2xl border-2 border-gray-200 focus:border-[#3B82F6] transition-all"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="rounded-2xl px-6 text-white self-end"
                    style={{
                      background:
                        input.trim() && !isTyping
                          ? 'linear-gradient(135deg, #3B82F6 0%, #22C55E 100%)'
                          : '#94A3B8',
                    }}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}