import { forwardRef, useState, useEffect } from 'react';
import { HelpCircle, Plus, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { generateExamQuestions as generateExamQuestionsAPI } from '../api/summariq';

interface Question {
  id: string;
  question: string;
  explanation: string;
  addedToFlashcards: boolean;
}

export const QuestionsSection = forwardRef<HTMLElement>((props, ref) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const loadQuestions = async (currentPage: number) => {
    const fileId = sessionStorage.getItem('currentFileId');
    if (!fileId) return;

    setIsLoading(true);
    try {
      const result = await generateExamQuestionsAPI(fileId, PAGE_SIZE * currentPage);
      if (result.success && result.data.questions.length > 0) {
        const mappedQuestions: Question[] = result.data.questions.map(
          (q: any, index: number) => ({
            id: (index + 1).toString(),
            question: q.question,
            explanation: q.answer,
            addedToFlashcards: false,
          })
        );
        setQuestions(mappedQuestions);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1);
  }, []);

  const handleAddToFlashcards = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, addedToFlashcards: true } : q
      )
    );
    toast.success('Added to flashcards!');
  };

  const handleGenerateMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadQuestions(nextPage);
    toast.success('Generating more questions...');
  };

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-8"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <div className="max-w-[1200px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: '#F0FDF4',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
              }}
            >
              <HelpCircle className="w-6 h-6" style={{ color: '#22C55E' }} />
            </div>
            <h2 className="text-[#1E293B]">Important Questions</h2>
          </div>
          <p className="text-[#64748B]">
            AI-generated questions to help you prepare for exams
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && questions.length === 0 && (
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

        {/* Questions List */}
        {questions.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {questions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl p-6 group hover:shadow-xl transition-all"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: '#DBEAFE',
                        color: '#3B82F6',
                      }}
                    >
                      <span>{index + 1}</span>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-[#1E293B] mb-3">{item.question}</h4>

                      <div
                        className="rounded-xl p-4 mb-4"
                        style={{ backgroundColor: '#F1F5F9' }}
                      >
                        <p className="text-[#94A3B8] mb-1">Answer:</p>
                        <p className="text-[#475569]">{item.explanation}</p>
                      </div>

                      <Button
                        onClick={() => handleAddToFlashcards(item.id)}
                        disabled={item.addedToFlashcards}
                        variant={item.addedToFlashcards ? 'secondary' : 'default'}
                        className="rounded-lg"
                        style={{
                          backgroundColor: item.addedToFlashcards ? '#F1F5F9' : '#3B82F6',
                          color: item.addedToFlashcards ? '#64748B' : 'white',
                        }}
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        {item.addedToFlashcards ? 'Added to Flashcards' : 'Add to Flashcards'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Generate More Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleGenerateMore}
                disabled={isLoading}
                className="px-8 py-3 rounded-xl text-white"
                style={{
                  backgroundColor: '#22C55E',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                {isLoading ? 'Generating...' : 'Generate More Questions'}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
});

QuestionsSection.displayName = 'QuestionsSection';
