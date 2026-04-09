import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Download, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateVisuals } from '../api/summariq';
import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

interface Visual {
  id: string;
  type: 'flowchart' | 'timeline' | 'mindmap' | 'process' | 'comparison';
  title: string;
  description: string;
  diagram?: string; // Mermaid syntax
  steps?: Array<{
    number: number;
    title: string;
    description: string;
    icon: string;
  }>;
  comparison?: {
    left: { title: string; points: string[] };
    right: { title: string; points: string[] };
  };
}

export const VisualsSection = () => {
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadVisuals();
  }, []);

  const loadVisuals = async () => {
    const fileId = sessionStorage.getItem('currentFileId');
    if (!fileId) return;

    setIsLoading(true);
    try {
      const result = await generateVisuals(fileId);
      if (result.success && result.data.visuals) {
        setVisuals(result.data.visuals);
        
        // Render Mermaid diagrams after state update
        setTimeout(() => {
          renderMermaidDiagrams();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to load visuals:', error);
      toast.error('Failed to load visual explanations');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMermaidDiagrams = async () => {
    const diagrams = document.querySelectorAll('.mermaid-diagram');
    for (let i = 0; i < diagrams.length; i++) {
      const element = diagrams[i] as HTMLElement;
      const code = element.getAttribute('data-diagram');
      if (code) {
        try {
          const { svg } = await mermaid.render(`mermaid-${i}`, code);
          element.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid render error:', error);
          element.innerHTML = '<p class="text-red-500">Failed to render diagram</p>';
        }
      }
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await loadVisuals();
      toast.success('Visuals regenerated!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const currentVisual = visuals[currentIndex];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Simple download of current visual as image
    toast.info('Download feature coming soon!');
  };

  const nextVisual = () => {
    setCurrentIndex((prev) => (prev + 1) % visuals.length);
  };

  const prevVisual = () => {
    setCurrentIndex((prev) => (prev - 1 + visuals.length) % visuals.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2563EB' }} />
          <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
            Generating visual explanations...
          </p>
        </div>
      </div>
    );
  }

  if (visuals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Brain className="w-20 h-20 mx-auto mb-4" style={{ color: '#2563EB' }} />
          <h3 className="text-2xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
            No visuals available
          </h3>
          <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
            Upload a document to generate visual explanations
          </p>
        </div>
      </div>
    );
  }

  const currentVisual = visuals[currentIndex];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
              <Sparkles className="inline-block w-8 h-8 mr-2" style={{ color: '#2563EB' }} />
              Visual Learning
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
              Understand concepts through visual diagrams and step-by-step illustrations
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              style={{
                backgroundColor: 'white',
                color: '#2563EB',
                border: '2px solid #2563EB',
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: 'white',
              }}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Visual Counter */}
        <div className="text-center mb-4">
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
            Visual {currentIndex + 1} of {visuals.length}
          </p>
        </div>

        {/* Main Visual Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-lg mb-6"
          >
            {/* Visual Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-4 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                {currentVisual.type.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
              {currentVisual.title}
            </h3>
            <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
              {currentVisual.description}
            </p>

            {/* Render based on type */}
            {currentVisual.diagram && (
              <div
                className="mermaid-diagram bg-white p-6 rounded-xl border-2 overflow-x-auto"
                data-diagram={currentVisual.diagram}
                style={{ borderColor: '#E2E8F0' }}
              />
            )}

            {currentVisual.steps && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentVisual.steps.map((step) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: step.number * 0.1 }}
                    className="p-6 rounded-xl border-2 hover:shadow-lg transition-shadow"
                    style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
                      >
                        {step.number}
                      </div>
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
                      {step.title}
                    </h4>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B', fontSize: '14px' }}>
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {currentVisual.comparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side */}
                <div className="p-6 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '2px solid #FECACA' }}>
                  <h4 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#DC2626' }}>
                    {currentVisual.comparison.left.title}
                  </h4>
                  <ul className="space-y-2">
                    {currentVisual.comparison.left.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: '#DC2626' }}>✗</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right side */}
                <div className="p-6 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: '2px solid #BBF7D0' }}>
                  <h4 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#16A34A' }}>
                    {currentVisual.comparison.right.title}
                  </h4>
                  <ul className="space-y-2">
                    {currentVisual.comparison.right.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: '#16A34A' }}>✓</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevVisual}
            disabled={visuals.length <= 1}
            className="p-3 rounded-full transition-all disabled:opacity-30"
            style={{ backgroundColor: 'white', border: '2px solid #2563EB', color: '#2563EB' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {visuals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: index === currentIndex ? '#2563EB' : '#CBD5E1',
                }}
              />
            ))}
          </div>

          <button
            onClick={nextVisual}
            disabled={visuals.length <= 1}
            className="p-3 rounded-full transition-all disabled:opacity-30"
            style={{ backgroundColor: 'white', border: '2px solid #2563EB', color: '#2563EB' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};