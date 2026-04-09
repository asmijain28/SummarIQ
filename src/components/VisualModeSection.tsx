import { forwardRef, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight, Wand2, Loader2, GitBranch, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { generateVisualMode, generateVisualModeStepImage } from '../api/summariq';
import mermaid from 'mermaid';
import { ImageWithFallback } from './figma/ImageWithFallback';

type UIBlockType = 'tag' | 'diagram' | 'checklist' | 'choice';
type VisualType = 'mermaid' | 'pictogram';

interface VisualModeStepChoice {
  label: string;
  next: string;
}

interface VisualModeStep {
  id: string;
  title: string;
  explanation: string;
  icon: string;
  visual?: { type: VisualType; content: string };
  imageUrl?: string;
  uiBlock: { type: UIBlockType; content: string };
  next: string | null;
  prev: string | null;
  choices: VisualModeStepChoice[];
}

interface VisualModeFlow {
  title: string;
  description: string;
  steps: VisualModeStep[];
}

const clampIndex = (index: number, max: number) => Math.max(0, Math.min(index, Math.max(0, max)));

export const VisualModeSection = forwardRef<HTMLElement>((_, ref) => {
  const [flow, setFlow] = useState<VisualModeFlow | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notesText, setNotesText] = useState<string>(() => sessionStorage.getItem('currentNotes') ?? '');

  const steps = flow?.steps ?? [];
  const stepIndex = useMemo(() => steps.findIndex((s) => s.id === currentStepId), [steps, currentStepId]);
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : steps[0];

  const topic = useMemo(() => sessionStorage.getItem('currentFileName') || undefined, []);

  useEffect(() => {
    // Safe to call multiple times; Mermaid keeps internal state.
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });
  }, []);

  const loadFlow = async () => {
    const notes = sessionStorage.getItem('currentNotes') ?? '';
    setNotesText(notes);
    if (!notes.trim()) {
      setFlow(null);
      setCurrentStepId(null);
      return;
    }

    setIsLoading(true);
    try {
      // Load structure fast. Images can be generated per-step on demand (CPU local SD is slow).
      const result = await generateVisualMode(notes, topic, false);
      if (result?.success && result?.data?.flow?.steps?.length) {
        setFlow(result.data.flow);
        setCurrentStepId(result.data.flow.steps[0].id);
      } else {
        throw new Error('Invalid Visual Mode response');
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate Visual Mode');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlow();
    const onNotesUpdated = () => {
      const nextNotes = sessionStorage.getItem('currentNotes') ?? '';
      const hadNotes = !!notesText.trim();
      setNotesText(nextNotes);
      // Only auto-generate when notes become available (or if flow is empty)
      if ((!hadNotes && nextNotes.trim()) || !flow) {
        loadFlow();
      }
    };

    window.addEventListener('summariq:notes-updated', onNotesUpdated);
    return () => {
      window.removeEventListener('summariq:notes-updated', onNotesUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await loadFlow();
      toast.success('Visual Mode updated!');
    } finally {
      setIsGenerating(false);
    }
  };

  const goToIndex = (nextIndex: number) => {
    if (!steps.length) return;
    const idx = clampIndex(nextIndex, steps.length - 1);
    setCurrentStepId(steps[idx].id);
  };

  const goPrev = () => {
    if (!steps.length) return;
    goToIndex((stepIndex >= 0 ? stepIndex : 0) - 1);
  };

  const goNext = () => {
    if (!steps.length) return;
    goToIndex((stepIndex >= 0 ? stepIndex : 0) + 1);
  };

  const hasNotes = !!notesText.trim();
  const [isStepImageGenerating, setIsStepImageGenerating] = useState(false);

  const generateImageForCurrentStep = async () => {
    if (!flow || !currentStep) return;
    setIsStepImageGenerating(true);
    try {
      const result = await generateVisualModeStepImage(currentStep, topic);
      const imageUrl = result?.data?.imageUrl;
      if (!imageUrl) throw new Error('No image returned');

      setFlow((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: prev.steps.map((s) => (s.id === currentStep.id ? { ...s, imageUrl } : s)),
        };
      });
      toast.success('Slide image generated!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate image');
    } finally {
      setIsStepImageGenerating(false);
    }
  };

  const renderCurrentMermaid = async () => {
    const el = document.querySelector('.visualmode-mermaid') as HTMLElement | null;
    if (!el) return;
    const code = el.getAttribute('data-diagram');
    if (!code) return;
    try {
      const { svg } = await mermaid.render(`visualmode-${Date.now()}`, code);
      el.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid render error:', error);
      el.innerHTML = '<p class="text-red-500">Failed to render diagram</p>';
    }
  };

  useEffect(() => {
    if (currentStep?.visual?.type === 'mermaid') {
      setTimeout(() => {
        renderCurrentMermaid();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepId]);

  return (
    <section
      ref={ref}
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-20"
      style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F0F9FF 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
              <Sparkles className="inline-block w-8 h-8 mr-2" style={{ color: '#2563EB' }} />
              Visual Mode
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
              Tap through your notes as a step-by-step learning journey.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={!hasNotes || isGenerating || isLoading}
            className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 10px 24px rgba(37, 99, 235, 0.25)',
            }}
          >
            {isGenerating || isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Remix Flow
          </button>
        </div>

        {!hasNotes ? (
          <div className="bg-white rounded-3xl p-10" style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
              Generate notes first, then Visual Mode will turn them into an interactive flow.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2563EB' }} />
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>Building your learning journey…</p>
            </div>
          </div>
        ) : !flow || steps.length === 0 || !currentStep ? (
          <div className="bg-white rounded-3xl p-10" style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
              No Visual Mode flow available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Step rail */}
            <div className="bg-white rounded-3xl p-6 h-fit" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
              <div className="mb-4">
                <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
                  {flow.title}
                </p>
                <p className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>
                  {flow.description}
                </p>
              </div>

              <div className="space-y-2">
                {steps.map((s, idx) => {
                  const active = s.id === currentStep.id;
                  const branching = (s.choices?.length ?? 0) > 0;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStepId(s.id)}
                      className="w-full text-left rounded-2xl px-4 py-3 transition-all"
                      style={{
                        backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                        border: active ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: active
                                ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                                : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                              color: active ? 'white' : '#0F172A',
                              fontFamily: 'Poppins, sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{s.icon}</span>
                              <span style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>{s.title}</span>
                            </div>
                            {branching && (
                              <div className="flex items-center gap-2 mt-1">
                                <GitBranch className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
                                <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#2563EB' }}>
                                  choices
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main card */}
            <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>
                    Step {Math.max(1, stepIndex + 1)} of {steps.length}
                  </p>
                  <h3 className="text-2xl md:text-3xl mt-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
                    <span className="mr-2">{currentStep.icon}</span>
                    {currentStep.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    disabled={stepIndex <= 0}
                    className="p-3 rounded-full transition-all disabled:opacity-30"
                    style={{ backgroundColor: 'white', border: '2px solid #2563EB', color: '#2563EB' }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={stepIndex >= steps.length - 1}
                    className="p-3 rounded-full transition-all disabled:opacity-30"
                    style={{ backgroundColor: 'white', border: '2px solid #2563EB', color: '#2563EB' }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-lg mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#475569' }}>
                    {currentStep.explanation}
                  </p>

                  {/* Slide image */}
                  {!!currentStep.imageUrl && (
                    <div className="mb-6">
                      <div
                        className="rounded-2xl border overflow-hidden"
                        style={{
                          borderColor: '#E2E8F0',
                          background: '#FFFFFF',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                          height: 'min(46vw, 320px)',
                          maxHeight: '320px',
                          minHeight: '180px',
                        }}
                      >
                        <ImageWithFallback
                          src={currentStep.imageUrl}
                          alt={currentStep.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'contain',
                            backgroundColor: '#F8FAFC',
                          }}
                          onError={() => {
                            console.error('Slide image failed to load:', currentStep.imageUrl);
                            toast.error('Slide image failed to load. Try opening it in a new tab.');
                          }}
                        />
                      </div>
                      <div className="mt-2">
                        <a
                          href={currentStep.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline"
                          style={{ fontFamily: 'Inter, sans-serif', color: '#2563EB' }}
                        >
                          Open slide image in new tab
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={generateImageForCurrentStep}
                    disabled={isStepImageGenerating}
                    className="mb-6 px-4 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: 'white',
                      border: '2px solid #2563EB',
                      color: '#2563EB',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {isStepImageGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {currentStep.imageUrl ? 'Regenerate slide image (slow)' : 'Generate slide image (slow)'}
                  </button>

                  {/* Picture/Diagram visual */}
                  {currentStep.visual?.type === 'mermaid' && (
                    <div
                      className="visualmode-mermaid bg-white p-6 rounded-2xl border-2 overflow-x-auto mb-6"
                      data-diagram={currentStep.visual.content}
                      style={{ borderColor: '#E2E8F0' }}
                    />
                  )}

                  {currentStep.visual?.type === 'pictogram' && (
                    <div
                      className="rounded-2xl p-6 border mb-6"
                      style={{
                        borderColor: '#E2E8F0',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                      }}
                    >
                      <div
                        className="text-lg"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#0F172A',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {currentStep.visual.content}
                      </div>
                    </div>
                  )}

                  <div
                    className="rounded-2xl p-6 border"
                    style={{
                      borderColor: '#E2E8F0',
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                        }}
                      >
                        {currentStep.uiBlock.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1E293B' }}>
                      {currentStep.uiBlock.content}
                    </div>
                  </div>

                  {(currentStep.choices?.length ?? 0) > 0 && (
                    <div className="mt-6">
                      <p className="mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
                        Choose your path:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {currentStep.choices.map((c) => (
                          <button
                            key={`${currentStep.id}-${c.label}`}
                            onClick={() => setCurrentStepId(c.next)}
                            className="px-4 py-2 rounded-xl transition-all"
                            style={{
                              backgroundColor: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              color: '#166534',
                              fontFamily: 'Poppins, sans-serif',
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

VisualModeSection.displayName = 'VisualModeSection';

