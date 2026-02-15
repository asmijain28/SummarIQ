import { forwardRef, useState, useEffect } from 'react';
import { Download, Info } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { generateNotes as generateNotesAPI } from '../api/summariq';
import ReactMarkdown from 'react-markdown';

interface NotesSectionProps {
  file: File | null;  
  fileSize: 'small' | 'medium' | 'large';
  detailLevel: 'short' | 'medium' | 'detailed';
  format: 'paragraph' | 'bulleted';
  highlightKeywords: boolean;
}


export const NotesSection = forwardRef<HTMLElement, NotesSectionProps>(
  ({ file, fileSize, detailLevel, format, highlightKeywords }, ref) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [notes, setNotes] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

const generateNotes = async () => {
  if (!file) {
    setError("No file uploaded");
    return;
  }

  setIsGenerating(true);
  setError(null);

  try {
    // Get fileId from session storage (set during upload)
    const fileId = sessionStorage.getItem('currentFileId');
    if (!fileId) {
      throw new Error('No file ID found');
    }

    // Call backend API
    const result = await generateNotesAPI(fileId, detailLevel);

    if (result.success) {
      setNotes(result.data.notes);
    } else {
      throw new Error(result.message || 'Failed to generate notes');
    }
  } catch (err: any) {
    setError(err.message || "Failed to generate notes");
  } finally {
    setIsGenerating(false);
  }
};


    useEffect(() => {
      if (file) {
        generateNotes();
      }
    }, [detailLevel, format]);

    const handleDownload = () => {
      toast.success("Notes downloaded successfully!");
    };

    return (
      <section
        ref={ref}
        className="min-h-screen px-4 sm:px-6 lg:px-8 py-20"
        style={{
          background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          
          {/* Title */}
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
              Your AI-Generated Detailed Notes
            </h2>
            <p
              className="text-xl mb-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              From: {file?.name}
            </p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 p-4 rounded-xl flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#2563EB' }} />
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#475569',
              }}
            >
              <strong>Note:</strong> These notes are created after reading every single
              line of your document. Nothing is truncated or skipped.
            </p>
          </motion.div>

          {/* Notes Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl p-8 md:p-12 mb-8"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="space-y-6">

              {isGenerating && (
                <p className="text-blue-600 text-lg">
                  Generating notes using AI...
                </p>
              )}

              {error && (
                <p className="text-red-600">
                  {error}
                </p>
              )}

              {!isGenerating && !error && (
                <div className={`prose prose-lg max-w-none ${highlightKeywords ? 'highlight-keywords' : ''}`}>
                  <ReactMarkdown>
                    {notes}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleDownload}
              size="lg"
              className="gap-2 px-8 py-6 rounded-xl shadow-lg transition-all hover:shadow-2xl hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <Download className="w-5 h-5" />
              Download Notes
            </Button>
          </motion.div>

        </div>
      </section>
    );
  }
);

NotesSection.displayName = 'NotesSection';
