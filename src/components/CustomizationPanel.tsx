import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  noteDetailLevel: 'short' | 'medium' | 'detailed';
  onNoteDetailLevelChange: (level: 'short' | 'medium' | 'detailed') => void;
  noteFormat: 'paragraph' | 'bulleted';
  onNoteFormatChange: (format: 'paragraph' | 'bulleted') => void;
  highlightKeywords: boolean;
  onToggleHighlight: (value: boolean) => void;
  quizLength: 'short' | 'medium' | 'full';
  onQuizLengthChange: (length: 'short' | 'medium' | 'full') => void;
}

export function CustomizationPanel({
  isOpen,
  onClose,
  noteDetailLevel,
  onNoteDetailLevelChange,
  noteFormat,
  onNoteFormatChange,
  highlightKeywords,
  onToggleHighlight,
  quizLength,
  onQuizLengthChange,
}: CustomizationPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 overflow-y-auto"
            style={{
              backgroundColor: '#F8FAFC',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2
                  className="text-2xl"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#1E293B',
                  }}
                >
                  Customization
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all hover:bg-white"
                  style={{ color: '#64748B' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Settings */}
              <div className="space-y-8">
                {/* Note Detail Level */}
                <div>
                  <Label
                    className="text-sm mb-3 block"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#475569',
                    }}
                  >
                    Note Detail Level
                  </Label>
                  <div className="space-y-2">
                    {(['short', 'medium', 'detailed'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => onNoteDetailLevelChange(level)}
                        className="w-full text-left p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor:
                            noteDetailLevel === level ? 'white' : 'transparent',
                          border:
                            noteDetailLevel === level
                              ? '2px solid #2563EB'
                              : '2px solid rgba(203, 213, 225, 0.5)',
                          color: noteDetailLevel === level ? '#2563EB' : '#64748B',
                          fontFamily: 'Inter, sans-serif',
                          boxShadow:
                            noteDetailLevel === level
                              ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                              : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{level}</span>
                          {noteDetailLevel === level && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#2563EB' }}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note Format */}
                <div>
                  <Label
                    className="text-sm mb-3 block"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#475569',
                    }}
                  >
                    Note Format
                  </Label>
                  <div className="space-y-2">
                    {(['paragraph', 'bulleted'] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => onNoteFormatChange(format)}
                        className="w-full text-left p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor:
                            noteFormat === format ? 'white' : 'transparent',
                          border:
                            noteFormat === format
                              ? '2px solid #2563EB'
                              : '2px solid rgba(203, 213, 225, 0.5)',
                          color: noteFormat === format ? '#2563EB' : '#64748B',
                          fontFamily: 'Inter, sans-serif',
                          boxShadow:
                            noteFormat === format
                              ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                              : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{format}</span>
                          {noteFormat === format && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#2563EB' }}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword Highlighting */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid rgba(203, 213, 225, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="highlight-toggle"
                        className="text-sm block mb-1 cursor-pointer"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#1E293B',
                        }}
                      >
                        Highlight Keywords
                      </Label>
                      <p
                        className="text-xs"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#94A3B8',
                        }}
                      >
                        Enable yellow highlighting
                      </p>
                    </div>
                    <Switch
                      id="highlight-toggle"
                      checked={highlightKeywords}
                      onCheckedChange={onToggleHighlight}
                    />
                  </div>
                </div>

                {/* Quiz Length */}
                <div>
                  <Label
                    className="text-sm mb-3 block"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#475569',
                    }}
                  >
                    Quiz Length
                  </Label>
                  <div className="space-y-2">
                    {(['short', 'medium', 'full'] as const).map((length) => (
                      <button
                        key={length}
                        onClick={() => onQuizLengthChange(length)}
                        className="w-full text-left p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor:
                            quizLength === length ? 'white' : 'transparent',
                          border:
                            quizLength === length
                              ? '2px solid #2563EB'
                              : '2px solid rgba(203, 213, 225, 0.5)',
                          color: quizLength === length ? '#2563EB' : '#64748B',
                          fontFamily: 'Inter, sans-serif',
                          boxShadow:
                            quizLength === length
                              ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                              : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{length}</span>
                          {quizLength === length && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#2563EB' }}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-8">
                <Button
                  onClick={() => {
                    toast.success('Settings applied! Content is regenerating...');
                    onClose();
                  }}
                  className="w-full py-6 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
