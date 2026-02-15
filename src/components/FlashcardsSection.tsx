import { forwardRef, useState } from 'react';
import { RotateCcw, ChevronRight, Award, Zap, Shuffle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { generateFlashcards as generateFlashcardsAPI } from '../api/summariq';
import { useEffect } from 'react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
}

interface FlashcardsSectionProps {
  fileSize: 'small' | 'medium' | 'large';
}

export const FlashcardsSection = forwardRef<HTMLElement, FlashcardsSectionProps>(
  ({ fileSize }, ref) => {

    // Adjust flashcard count based on file size
    const flashcardCount = fileSize === 'small' ? 8 : fileSize === 'medium' ? 12 : 15;
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const loadFlashcards = async () => {
        const fileId = sessionStorage.getItem('currentFileId');
        if (!fileId) return;

        setIsLoading(true);
        try {
          const result = await generateFlashcardsAPI(fileId, flashcardCount);
          if (result.success && result.data.flashcards.length > 0) {
            const mappedFlashcards = result.data.flashcards.map((card: any, index: number) => ({
              id: (index + 1).toString(),
              question: card.front,
              answer: card.back,
              explanation: card.explanation || '',
            }));
            setFlashcards(mappedFlashcards);
          }
        } catch (error) {
          console.error('Failed to load flashcards:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadFlashcards();
    }, [flashcardCount]);

    const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());
    const [streak, setStreak] = useState(0);

    const currentCard = flashcards[currentIndex];
    const progress = flashcards.length > 0 ? (answeredCards.size / flashcards.length) * 100 : 0;

    const handleFlip = () => {
      setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
      if (!answeredCards.has(currentCard.id)) {
        setAnsweredCards(new Set([...answeredCards, currentCard.id]));
        setStreak(streak + 1);

        if (answeredCards.size + 1 === flashcards.length) {
          toast.success('🎉 Congratulations! You completed all flashcards!');
        }
      }

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    };

    const handleShuffle = () => {
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      toast.success('Deck shuffled!');
    };

    const handleReset = () => {
      setCurrentIndex(0);
      setIsFlipped(false);
      setAnsweredCards(new Set());
      setStreak(0);
      toast.success('Quiz reset!');
    };

    return (
      <section
        ref={ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
        }}
      >
        <div className="max-w-4xl w-full">
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
              Smart Flashcards
            </h2>
            <p
              className="text-xl"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              Click the card to reveal the answer
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div
              className="text-center py-20"
              style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
            >
              Loading flashcards...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && flashcards.length === 0 && (
            <div
              className="text-center py-20"
              style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
            >
              No flashcards available.
            </div>
          )}

          {/* Main Content */}
          {!isLoading && flashcards.length > 0 && (
            <>
              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#64748B',
                      }}
                    >
                      Card {currentIndex + 1} of {flashcards.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" style={{ color: '#FACC15' }} />
                      <span
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#FACC15',
                        }}
                      >
                        Streak: {streak}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5" style={{ color: '#22C55E' }} />
                      <span
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#22C55E',
                        }}
                      >
                        {answeredCards.size}/{flashcards.length}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #2563EB 0%, #22C55E 100%)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>

              {/* Flashcard */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="perspective-1000 mb-8"
                style={{ perspective: '1000px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCard.id}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    onClick={handleFlip}
                    className="relative cursor-pointer"
                    style={{
                      transformStyle: 'preserve-3d',
                      minHeight: '400px',
                    }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-3xl p-12 flex flex-col items-center justify-center"
                      style={{
                        backfaceVisibility: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: `3px solid ${streak >= 3 ? '#22C55E' : '#2563EB'}`,
                      }}
                    >
                      <div
                        className="text-sm mb-4 px-4 py-2 rounded-full"
                        style={{
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          color: '#2563EB',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Question
                      </div>
                      <h3
                        className="text-3xl text-center mb-6"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#1E293B',
                          lineHeight: '1.4',
                        }}
                      >
                        {currentCard.question}
                      </h3>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#94A3B8',
                        }}
                      >
                        Click to reveal answer
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-3xl p-12 flex flex-col items-center justify-center"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: 'white',
                        boxShadow: '0 20px 60px rgba(34, 197, 94, 0.15)',
                        border: '3px solid #22C55E',
                      }}
                    >
                      <div
                        className="text-sm mb-4 px-4 py-2 rounded-full"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22C55E',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Answer
                      </div>
                      <h3
                        className="text-2xl text-center mb-4"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#1E293B',
                          lineHeight: '1.4',
                        }}
                      >
                        {currentCard.answer}
                      </h3>
                      <div
                        className="mt-6 p-4 rounded-xl w-full"
                        style={{
                          backgroundColor: 'rgba(37, 99, 235, 0.05)',
                          border: '1px solid rgba(37, 99, 235, 0.1)',
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#475569',
                            lineHeight: '1.6',
                          }}
                        >
                          <strong>Explanation:</strong> {currentCard.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Controls */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center justify-center gap-4"
              >
                <Button
                  onClick={handleShuffle}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  style={{
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Shuffle className="w-5 h-5" />
                  Shuffle Deck
                </Button>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 px-8"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Next Card
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  style={{
                    borderColor: '#64748B',
                    color: '#64748B',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
              </motion.div>

              {/* Streak Celebration */}
              <AnimatePresence>
                {streak >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    className="mt-8 p-6 rounded-2xl text-center"
                    style={{
                      background: 'linear-gradient(135deg, #FACC15 0%, #F97316 100%)',
                      boxShadow: '0 10px 30px rgba(250, 204, 21, 0.3)',
                    }}
                  >
                    <p
                      className="text-2xl"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: 'white',
                      }}
                    >
                      🔥 Amazing! {streak} Card Streak!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    );
  }
);

FlashcardsSection.displayName = 'FlashcardsSection';