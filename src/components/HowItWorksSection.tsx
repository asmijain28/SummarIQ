import { forwardRef } from 'react';
import { Upload, Lightbulb, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const HowItWorksSection = forwardRef<HTMLElement>((props, ref) => {
  const steps = [
    {
      icon: Upload,
      number: '1',
      title: 'Upload Notes',
      description: 'Upload your lecture notes, PDFs, or presentations in any supported format.',
      color: '#3B82F6',
    },
    {
      icon: Lightbulb,
      number: '2',
      title: 'Summarize & Extract Key Ideas',
      description: 'Our AI analyzes your content and generates summaries, highlights keywords, and creates practice questions.',
      color: '#8B5CF6',
    },
    {
      icon: MessageCircle,
      number: '3',
      title: 'Learn via Flashcards & Q&A Chat',
      description: 'Test your knowledge with interactive flashcards and ask our AI assistant questions about your document.',
      color: '#22C55E',
    },
  ];

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-8"
      style={{
        background: 'linear-gradient(to bottom, #F8FAFC, #EFF6FF)',
      }}
    >
      <div className="max-w-[1200px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[#1E293B] mb-4">How It Works</h2>
          <p className="text-[#64748B]">
            Three simple steps to smarter studying
          </p>
        </motion.div>

        <div className="relative">
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div
                    className="rounded-3xl p-8 h-full"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {/* Number Badge */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{
                        backgroundColor: `${step.color}20`,
                        boxShadow: `0 0 20px ${step.color}30`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </motion.div>

                    {/* Step Number */}
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
                      style={{
                        backgroundColor: step.color,
                        color: 'white',
                      }}
                    >
                      <span>{step.number}</span>
                    </div>

                    <h3 className="text-[#1E293B] mb-4">{step.title}</h3>
                    <p className="text-[#64748B] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow (Desktop Only) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                    >
                      <ArrowRight
                        className="w-8 h-8"
                        style={{ color: step.color }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-block rounded-2xl px-8 py-4"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)',
              border: '2px solid #E0F2FE',
            }}
          >
            <p className="text-[#1E293B]">
              Join thousands of students learning smarter with SummarIQ
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = 'HowItWorksSection';
