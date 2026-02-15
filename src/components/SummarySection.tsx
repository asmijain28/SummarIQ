import { forwardRef, useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { generateSummary as generateSummaryAPI } from '../api/summariq';

interface SummarySectionProps {
  fileName: string;
  summaryLength: 'short' | 'medium' | 'long';
  onSummaryLengthChange: (length: 'short' | 'medium' | 'long') => void;
  highlightKeywords: boolean;
  onToggleHighlight: (value: boolean) => void;
}

export const SummarySection = forwardRef<HTMLElement, SummarySectionProps>(
  ({ fileName, summaryLength, onSummaryLengthChange, highlightKeywords, onToggleHighlight }, ref) => {

    const [summaries, setSummaries] = useState<Record<'short' | 'medium' | 'long', string>>({
      short: '',
      medium: '',
      long: '',
    });
    const [keywords, setKeywords] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const loadSummary = async () => {
        const fileId = sessionStorage.getItem('currentFileId');
        if (!fileId) return;

        setIsLoading(true);
        try {
          const result = await generateSummaryAPI(fileId, summaryLength);
          if (result.success) {
            setSummaries((prev) => ({
              ...prev,
              [summaryLength]: result.data.summary,
            }));
            if (result.data.keywords) {
              setKeywords(result.data.keywords);
            }
          }
        } catch (error) {
          console.error('Failed to load summary:', error);
        } finally {
          setIsLoading(false);
        }
      };

      // Only fetch if we don't already have this length cached
      if (!summaries[summaryLength]) {
        loadSummary();
      }
    }, [summaryLength]);

    const highlightText = (text: string) => {
      if (!highlightKeywords || !text) return text;

      const terms = keywords.length > 0 ? keywords : [
        'Machine Learning', 'supervised learning', 'unsupervised learning',
        'neural networks', 'gradient descent', 'overfitting',
        'classification', 'optimization',
      ];

      let highlighted = text;
      terms.forEach((keyword) => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        highlighted = highlighted.replace(
          regex,
          '<span class="keyword-highlight">$1</span>'
        );
      });

      return highlighted;
    };

    const handleDownload = () => {
      const text = summaries[summaryLength];
      if (!text) {
        toast.error('No summary to download.');
        return;
      }
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `summary-${summaryLength}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Summary downloaded successfully!');
    };

    return (
      <section
        ref={ref}
        className="min-h-screen flex items-center justify-center py-20 px-8"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="max-w-[1200px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-[#1E293B] mb-4">AI-Generated Summary</h2>
            <p className="text-[#64748B]">
              Your document has been analyzed and summarized
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl p-8"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Controls */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#EFF6FF' }}
                >
                  <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                </div>
                <span className="text-[#64748B]">{fileName}</span>
              </div>

              <div className="flex items-center gap-6">
                {/* Summary Length Selector */}
                <div className="flex items-center gap-3">
                  <Label className="text-[#64748B]">Length:</Label>
                  <Select value={summaryLength} onValueChange={onSummaryLengthChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Highlight Toggle */}
                <div className="flex items-center gap-3">
                  <Label className="text-[#64748B]">Highlight Keywords:</Label>
                  <Switch checked={highlightKeywords} onCheckedChange={onToggleHighlight} />
                </div>
              </div>
            </div>

            {/* Summary Content */}
            <div
              className="max-h-[400px] overflow-y-auto pr-4 mb-6"
              style={{ scrollbarWidth: 'thin' }}
            >
              {isLoading ? (
                <div
                  className="text-center py-12"
                  style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                >
                  Generating summary...
                </div>
              ) : !summaries[summaryLength] ? (
                <div
                  className="text-center py-12"
                  style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                >
                  No summary available.
                </div>
              ) : (
                <motion.div
                  key={summaryLength}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-[#475569] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightText(summaries[summaryLength]) }}
                />
              )}
            </div>

            {/* Download Button */}
            <div className="flex justify-center pt-6 border-t border-[#E2E8F0]">
              <Button
                onClick={handleDownload}
                className="px-8 py-3 rounded-xl text-white"
                style={{
                  backgroundColor: '#3B82F6',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Summary
              </Button>
            </div>
          </motion.div>
        </div>

        <style>{`
          .keyword-highlight {
            background: linear-gradient(120deg, #FEF08A 0%, #FEF08A 100%);
            background-repeat: no-repeat;
            background-size: 100% 40%;
            background-position: 0 85%;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .keyword-highlight:hover {
            background-size: 100% 100%;
            background-position: 0 0;
            box-shadow: 0 0 15px rgba(254, 240, 138, 0.6);
          }
        `}</style>
      </section>
    );
  }
);

SummarySection.displayName = 'SummarySection';
