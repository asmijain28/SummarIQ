import { forwardRef } from 'react';
import { Brain, BookOpen, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  ({ onGetStarted }, ref) => {
    return (
      <section
        ref={ref}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #DBEAFE 100%)',
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                background: i % 2 === 0 ? '#2563EB' : '#22C55E',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* AI Illustration */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Brain className="w-20 h-20" style={{ color: '#2563EB' }} />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="w-6 h-6" style={{ color: '#FACC15' }} />
              </motion.div>
            </motion.div>

            <BookOpen className="w-16 h-16" style={{ color: '#22C55E' }} />

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
            >
              <FileText className="w-14 h-14" style={{ color: '#2563EB' }} />
            </motion.div>
          </motion.div>

          {/* Hero Text */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl mb-6"
            style={{
              fontFamily: 'Poppins, sans-serif',
              color: '#1E293B',
              lineHeight: '1.2',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform Your Notes
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #2563EB 0%, #22C55E 100%)',
              }}
            >
              into Knowledge
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Upload your study material and let SummarIQ generate detailed notes,
            flashcards, quizzes, and more.
          </motion.p>

          <motion.p
            className="text-lg mb-8 max-w-2xl mx-auto"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#64748B',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Your Smart Study Assistant
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="px-8 py-6 text-lg rounded-xl shadow-lg transition-all hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                fontFamily: 'Poppins, sans-serif',
                border: 'none',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <Sparkles className="w-5 h-5" />
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                }}
              />
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              'Detailed Notes',
              'Smart Flashcards',
              'MCQ Quizzes',
              'AI Chat Assistant',
            ].map((feature, index) => (
              <div
                key={index}
                className="px-6 py-3 rounded-full backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                  boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)',
                }}
              >
                {feature}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }
);

HeroSection.displayName = 'HeroSection';
