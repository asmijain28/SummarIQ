import { forwardRef, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy, Target } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { generateQuiz as generateQuizAPI } from '../api/summariq';

interface QuizSectionProps {
  fileSize: 'small' | 'medium' | 'large';
  quizLength: 'short' | 'medium' | 'full';
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const QuizSection = forwardRef<HTMLElement, QuizSectionProps>(
  ({ fileSize, quizLength }, ref) => {

    // Determine number of questions based on quiz length and file size
    const getQuestionCount = () => {
      const lengthMultiplier = quizLength === 'short' ? 0.6 : quizLength === 'medium' ? 1 : 1.5;
      const sizeMultiplier = fileSize === 'small' ? 0.8 : fileSize === 'medium' ? 1 : 1.2;
      const baseCount = 10;
      return Math.round(baseCount * lengthMultiplier * sizeMultiplier);
    };

    const questionCount = getQuestionCount();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
    const [isQuizComplete, setIsQuizComplete] = useState(false);

    useEffect(() => {
      const loadQuiz = async () => {
        const fileId = sessionStorage.getItem('currentFileId');
        if (!fileId) return;

        setIsLoading(true);
        try {
          const result = await generateQuizAPI(fileId, questionCount);
          if (result.success && result.data.questions.length > 0) {
            const mappedQuestions: Question[] = result.data.questions.map(
              (q: any, index: number) => ({
                id: index + 1,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                difficulty: q.difficulty ?? 'Medium',
              })
            );
            setQuestions(mappedQuestions);
          }
        } catch (error) {
          console.error('Failed to load quiz:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadQuiz();
    }, [questionCount]);

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (optionIndex: number) => {
      if (showExplanation) return;

      setSelectedAnswer(optionIndex);
      setShowExplanation(true);

      if (optionIndex === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }

      setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
    };

    const handleNext = () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        setIsQuizComplete(true);
      }
    };

    const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setAnsweredQuestions([]);
      setIsQuizComplete(false);
    };

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Easy':
          return '#22C55E';
        case 'Medium':
          return '#FACC15';
        case 'Hard':
          return '#EF4444';
        default:
          return '#64748B';
      }
    };

    // Loading state
    if (isLoading) {
      return (
        <section
          ref={ref}
          className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
          style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}
        >
          <div
            className="text-center"
            style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
          >
            Loading quiz...
          </div>
        </section>
      );
    }

    // Empty state
    if (!isLoading && questions.length === 0) {
      return (
        <section
          ref={ref}
          className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
          style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}
        >
          <div
            className="text-center"
            style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
          >
            No quiz questions available.
          </div>
        </section>
      );
    }

    // Quiz complete state
    if (isQuizComplete) {
      const percentage = (score / questions.length) * 100;
      return (
        <section
          ref={ref}
          className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
          style={{
            background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full rounded-3xl p-12 text-center"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-6" style={{ color: '#FACC15' }} />
            </motion.div>

            <h2
              className="text-4xl mb-4"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#1E293B',
              }}
            >
              Quiz Complete! 🎉
            </h2>

            <div className="mb-8">
              <div
                className="text-6xl mb-2"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  color: percentage >= 70 ? '#22C55E' : percentage >= 40 ? '#FACC15' : '#EF4444',
                }}
              >
                {score}/{questions.length}
              </div>
              <p
                className="text-xl"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#64748B',
                }}
              >
                {percentage >= 70
                  ? 'Excellent work!'
                  : percentage >= 40
                  ? 'Good effort!'
                  : 'Keep studying!'}
              </p>
            </div>

            <Button
              onClick={handleRestart}
              size="lg"
              className="gap-2 px-8 py-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </Button>
          </motion.div>
        </section>
      );
    }

    return (
      <section
        ref={ref}
        className="min-h-screen px-4 sm:px-6 lg:px-8 py-20"
        style={{
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
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
              Quick Quiz – Test Your Understanding
            </h2>
            <p
              className="text-xl"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div
            className="mb-8 h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #2563EB 0%, #22C55E 100%)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl p-8 md:p-12"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Difficulty Badge */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className="px-4 py-2 rounded-full flex items-center gap-2"
                  style={{
                    backgroundColor: `${getDifficultyColor(currentQuestion.difficulty)}20`,
                  }}
                >
                  <Target
                    className="w-4 h-4"
                    style={{ color: getDifficultyColor(currentQuestion.difficulty) }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: getDifficultyColor(currentQuestion.difficulty),
                      fontWeight: '600',
                    }}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#64748B',
                  }}
                >
                  Score: {score}
                </div>
              </div>

              {/* Question */}
              <h3
                className="text-2xl mb-8"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#1E293B',
                  lineHeight: '1.4',
                }}
              >
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showResult = showExplanation;

                  let bgColor = 'white';
                  let borderColor = 'rgba(203, 213, 225, 0.5)';
                  let textColor = '#1E293B';

                  if (showResult) {
                    if (isCorrect) {
                      bgColor = 'rgba(34, 197, 94, 0.1)';
                      borderColor = '#22C55E';
                      textColor = '#166534';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = '#EF4444';
                      textColor = '#991B1B';
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                      className="w-full text-left p-5 rounded-xl transition-all flex items-center gap-4"
                      style={{
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                        color: textColor,
                        cursor: showExplanation ? 'default' : 'pointer',
                      }}
                      whileHover={!showExplanation ? { scale: 1.02 } : {}}
                      whileTap={!showExplanation ? { scale: 0.98 } : {}}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor:
                            showResult && isCorrect
                              ? '#22C55E'
                              : showResult && isSelected && !isCorrect
                              ? '#EF4444'
                              : 'rgba(37, 99, 235, 0.1)',
                          color:
                            showResult && (isCorrect || (isSelected && !isCorrect))
                              ? 'white'
                              : '#2563EB',
                          fontFamily: 'Poppins, sans-serif',
                        }}
                      >
                        {showResult && isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : showResult && isSelected && !isCorrect ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 rounded-xl mb-6"
                    style={{
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    <h4
                      className="text-lg mb-2"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#2563EB',
                      }}
                    >
                      Explanation:
                    </h4>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#475569',
                        lineHeight: '1.6',
                      }}
                    >
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full py-6 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    );
  }
);

QuizSection.displayName = 'QuizSection';
