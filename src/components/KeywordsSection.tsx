import { forwardRef, useState } from 'react';
import { Tag, X, Copy } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { extractKeywords as extractKeywordsAPI } from '../api/summariq';
import { useEffect } from 'react';

interface Keyword {
  term: string;
  definition: string;
  context: string;
  color: string;
}

interface KeywordsSectionProps {
  fileSize: 'small' | 'medium' | 'large';
}

export const KeywordsSection = forwardRef<HTMLElement, KeywordsSectionProps>(
  ({ fileSize }, ref) => {
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);

const [apiKeywords, setApiKeywords] = useState<string[]>([]);
const [apiDefinitions, setApiDefinitions] = useState<Record<string, string>>({});
const [apiContexts, setApiContexts] = useState<Record<string, string>>({});
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  const loadKeywords = async () => {
    const fileId = sessionStorage.getItem('currentFileId');
    if (!fileId) return;

    setIsLoading(true);
    try {
      const result = await extractKeywordsAPI(fileId);
      if (result.success) {
        setApiKeywords(result.data.keywords);
        setApiDefinitions(result.data.definitions);
        setApiContexts(result.data.contexts || {});
      }
    } catch (error) {
      console.error('Failed to load keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadKeywords();
}, []);


    // Adjust keyword count based on file size
    const keywordCount = fileSize === 'small' ? 6 : fileSize === 'medium' ? 8 : 10;
const COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2', '#9333EA', '#DC2626'];

const keywords: Keyword[] = apiKeywords.slice(0, keywordCount).map((term) => ({
  term,
  definition: apiDefinitions[term] ?? 'No definition available.',
  context: apiContexts[term] ?? '',
  color: COLORS[term.charCodeAt(0) % COLORS.length],
}));

    const handleCopyAll = () => {
      const allTerms = keywords.map((k) => k.term).join(', ');
      navigator.clipboard.writeText(allTerms);
      toast.success('All keywords copied to clipboard!');
    };

    return (
      <section
        ref={ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
        }}
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
              Highlighted Keywords & Key Concepts
            </h2>
            <p
              className="text-xl mb-6"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              Click on any keyword to see its definition and context
            </p>
            <Button
              onClick={handleCopyAll}
              variant="outline"
              className="gap-2"
              style={{
                borderColor: '#2563EB',
                color: '#2563EB',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Copy className="w-4 h-4" />
              Copy All Keywords
            </Button>
          </motion.div>

          {/* Keywords Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <style>
              {`
                .keyword-bubble {
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .keyword-bubble:hover {
                  animation: glow-pulse 1.5s infinite;
                }
                @keyframes glow-pulse {
                  0%, 100% {
                    box-shadow: 0 4px 15px currentColor;
                  }
                  50% {
                    box-shadow: 0 0 30px currentColor, 0 0 40px currentColor;
                  }
                }
              `}
            </style>
            {keywords.map((keyword, index) => (
              <motion.div
                key={keyword.term}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  onClick={() => setSelectedKeyword(keyword)}
                  className="keyword-bubble px-6 py-3 rounded-full cursor-pointer text-white"
                  style={{
                    backgroundColor: keyword.color,
                    boxShadow: selectedKeyword?.term === keyword.term
                      ? `0 0 25px ${keyword.color}80, 0 0 40px ${keyword.color}50`
                      : `0 4px 15px ${keyword.color}40`,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    border: selectedKeyword?.term === keyword.term
                      ? `2px solid ${keyword.color}`
                      : '2px solid transparent',
                  }}
                >
                  {keyword.term}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          {/* Keyword Definition Panel */}
          <AnimatePresence>
            {selectedKeyword && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl p-8 md:p-12 relative"
                style={{
                  backgroundColor: 'white',
                  boxShadow: `0 20px 60px ${selectedKeyword.color}30`,
                  border: `2px solid ${selectedKeyword.color}40`,
                }}
              >
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${selectedKeyword.color}10`,
                    color: selectedKeyword.color,
                  }}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedKeyword.color }}
                    />
                    <h3
                      className="text-3xl"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#1E293B',
                      }}
                    >
                      {selectedKeyword.term}
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p
                      className="text-sm mb-2"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Definition
                    </p>
                    <p
                      className="text-lg"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#475569',
                        lineHeight: '1.7',
                      }}
                    >
                      {selectedKeyword.definition}
                    </p>
                  </div>

                  {selectedKeyword.context && (
                    <div>
                      <p
                        className="text-sm mb-2"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Context in Document
                      </p>
                      <p
                        className="text-lg px-5 py-4 rounded-xl"
                        style={{
                          backgroundColor: `${selectedKeyword.color}10`,
                          fontFamily: 'Inter, sans-serif',
                          color: '#475569',
                          lineHeight: '1.7',
                          borderLeft: `4px solid ${selectedKeyword.color}`,
                        }}
                      >
                        {selectedKeyword.context}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    );
  }
);

KeywordsSection.displayName = 'KeywordsSection';
