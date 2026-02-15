import { useState } from 'react';
import { Upload, FileText, Brain, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface HomePageProps {
  onUpload: (fileName: string) => void;
}

export function HomePage({ onUpload }: HomePageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleSummarize = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#22C55E]">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(60px)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="py-8 px-8">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-white">SummarIQ</h1>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[900px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-300" />
                <h1 className="text-white">SummarIQ</h1>
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-white/90 mb-2" style={{ fontSize: '1.25rem' }}>
                Upload your notes. Let AI summarize, highlight, and answer your questions.
              </p>
            </motion.div>

            <div className="flex gap-8 items-center">
              {/* Upload Box */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-1"
              >
                <motion.div
                  className={`relative bg-white/10 backdrop-blur-md rounded-3xl p-10 border-2 border-dashed transition-all ${
                    isDragging ? 'border-white bg-white/20 scale-105' : 'border-white/40'
                  }`}
                  style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.txt"
                    onChange={handleFileSelect}
                  />
                  
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 bg-white/20 backdrop-blur-sm border border-white/30"
                      >
                        <Upload className="w-12 h-12 text-white" />
                      </motion.div>
                      
                      {selectedFile ? (
                        <div className="flex items-center gap-2 mb-4 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                          <FileText className="w-5 h-5 text-white" />
                          <span className="text-white">{selectedFile}</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-white mb-2">
                            Drag and drop your file here
                          </p>
                          <p className="text-white/70">or click to browse</p>
                          <p className="text-white/50 mt-4">
                            Supports PDF, PPT, and TXT formats
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </motion.div>

                {/* Summarize Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <Button
                    onClick={handleSummarize}
                    disabled={!selectedFile}
                    className="px-12 py-6 rounded-2xl text-white transition-all relative overflow-hidden group"
                    style={{
                      background: selectedFile 
                        ? 'linear-gradient(135deg, #3B82F6 0%, #22C55E 100%)'
                        : '#94A3B8',
                      boxShadow: selectedFile ? '0 0 30px rgba(59, 130, 246, 0.5)' : 'none',
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Summarize My Notes
                    </span>
                    {selectedFile && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              {/* AI Character Illustration */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="hidden lg:block"
              >
                <div className="relative">
                  {/* AI Bot Character */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-48 h-48 rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center relative"
                    style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                  >
                    <Brain className="w-24 h-24 text-white" />
                    
                    {/* Floating Sparkles */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${[20, 80, 30, 70][i]}%`,
                          left: `${[10, 90, 85, 15][i]}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-white/60"
          >
            Built using Flask + React + Transformers
          </motion.p>
        </footer>
      </div>
    </div>
  );
}
