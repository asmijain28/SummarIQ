import { forwardRef, useState, useEffect } from 'react';
import { Star, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { generateExamQuestions as generateExamQuestionsAPI } from '../api/summariq';

interface ExamQuestionsSectionProps {
  fileSize: 'small' | 'medium' | 'large';
}

interface ExamQuestion {
  id: number;
  question: string;
  answer: string;
  type: 'Short' | 'Long' | 'Conceptual';
  isStarred: boolean;
}

export const ExamQuestionsSection = forwardRef<HTMLElement, ExamQuestionsSectionProps>(
  ({ fileSize }, ref) => {

    // Adjust question count based on file size
    const questionCount = fileSize === 'small' ? 4 : fileSize === 'medium' ? 6 : 8;
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [filter, setFilter] = useState<'All' | 'Short' | 'Long' | 'Conceptual'>('All');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const loadQuestions = async () => {
        const fileId = sessionStorage.getItem('currentFileId');
        if (!fileId) return;

        setIsLoading(true);
        try {
          const result = await generateExamQuestionsAPI(fileId, questionCount);
          if (result.success && result.data.questions.length > 0) {
            const mappedQuestions: ExamQuestion[] = result.data.questions.map(
              (q: any, index: number) => ({
                id: index + 1,
                question: q.question,
                answer: q.answer,
                type: q.type ?? 'Short',
                isStarred: false,
              })
            );
            setQuestions(mappedQuestions);
          }
        } catch (error) {
          console.error('Failed to load exam questions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadQuestions();
    }, [questionCount]);

    const handleStarToggle = (id: number) => {
      setQuestions(
        questions.map((q) =>
          q.id === id ? { ...q, isStarred: !q.isStarred } : q
        )
      );
      const question = questions.find((q) => q.id === id);
      if (question) {
        toast.success(
          question.isStarred
            ? 'Removed from starred questions'
            : 'Added to starred questions'
        );
      }
    };

    const filteredQuestions =
      filter === 'All' ? questions : questions.filter((q) => q.type === filter);

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'Short':
          return '#22C55E';
        case 'Long':
          return '#2563EB';
        case 'Conceptual':
          return '#FACC15';
        default:
          return '#64748B';
      }
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
              Predicted Exam Questions
            </h2>
            <p
              className="text-xl"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              AI-generated questions based on your study material
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-12 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: '#64748B' }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#64748B',
                }}
              >
                Filter:
              </span>
            </div>
            {(['All', 'Short', 'Long', 'Conceptual'] as const).map((type) => (
              <Button
                key={type}
                onClick={() => setFilter(type)}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg transition-all"
                style={
                  filter === type
                    ? {
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        fontFamily: 'Inter, sans-serif',
                      }
                    : {
                        borderColor: 'rgba(37, 99, 235, 0.3)',
                        color: '#2563EB',
                        fontFamily: 'Inter, sans-serif',
                      }
                }
              >
                {type}
              </Button>
            ))}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div
              className="text-center py-20"
              style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
            >
              Loading questions...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && questions.length === 0 && (
            <div
              className="text-center py-20"
              style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
            >
              No questions available.
            </div>
          )}

          {/* Questions Grid */}
          {!isLoading && questions.length > 0 && (
            <div className="space-y-6">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl p-8 transition-all hover:shadow-xl"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                    border: question.isStarred
                      ? '2px solid #FACC15'
                      : '2px solid transparent',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#CBD5E1',
                        }}
                      >
                        Q{index + 1}
                      </span>
                      <div
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getTypeColor(question.type)}20`,
                        }}
                      >
                        <span
                          className="text-sm"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: getTypeColor(question.type),
                            fontWeight: '600',
                          }}
                        >
                          {question.type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStarToggle(question.id)}
                      className="flex-shrink-0 transition-all hover:scale-110"
                    >
                      <Star
                        className="w-6 h-6"
                        style={{
                          color: question.isStarred ? '#FACC15' : '#CBD5E1',
                          fill: question.isStarred ? '#FACC15' : 'none',
                        }}
                      />
                    </button>
                  </div>

                  {/* Question */}
                  <h3
                    className="text-xl mb-4"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#1E293B',
                      lineHeight: '1.5',
                    }}
                  >
                    {question.question}
                  </h3>

                  {/* Answer */}
                  <div
                    className="p-5 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(37, 99, 235, 0.03)',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                    }}
                  >
                    <h4
                      className="text-sm mb-2"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#2563EB',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Answer:
                    </h4>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#475569',
                        lineHeight: '1.7',
                      }}
                    >
                      {question.answer}
                    </p>
                  </div>
                </motion.div>
              ))}

              {filteredQuestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p
                    className="text-xl"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#94A3B8',
                    }}
                  >
                    No questions found for this filter.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }
);

ExamQuestionsSection.displayName = 'ExamQuestionsSection';
