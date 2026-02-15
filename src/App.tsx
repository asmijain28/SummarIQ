import { useState, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { UploadSection } from './components/UploadSection';
import { NotesSection } from './components/NotesSection';
import { KeywordsSection } from './components/KeywordsSection';
import { FlashcardsSection } from './components/FlashcardsSection';
import { QuizSection } from './components/QuizSection';
import { ExamQuestionsSection } from './components/ExamQuestionsSection';
import { ChatSection } from './components/ChatSection';
import { CustomizationPanel } from './components/CustomizationPanel';
import { Footer } from './components/Footer';
import { StickyAIButton } from './components/StickyAIButton';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Customization states
  const [noteDetailLevel, setNoteDetailLevel] = useState<'short' | 'medium' | 'detailed'>('detailed');
  const [noteFormat, setNoteFormat] = useState<'paragraph' | 'bulleted'>('bulleted');
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [quizLength, setQuizLength] = useState<'short' | 'medium' | 'full'>('medium');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Section refs for smooth scrolling
  const heroRef = useRef<HTMLElement | null>(null);
  const uploadRef = useRef<HTMLElement | null>(null);
  const notesRef = useRef<HTMLElement | null>(null);
  const keywordsRef = useRef<HTMLElement | null>(null);
  const flashcardsRef = useRef<HTMLElement | null>(null);
  const quizRef = useRef<HTMLElement | null>(null);
  const examQuestionsRef = useRef<HTMLElement | null>(null);
  const chatRef = useRef<HTMLElement | null>(null);

  const scrollToSection = (sectionId: string) => {
    const refs: { [key: string]: React.RefObject<HTMLElement | null> } = {
      home: heroRef,
      upload: uploadRef,
      notes: notesRef,
      keywords: keywordsRef,
      flashcards: flashcardsRef,
      quiz: quizRef,
      'exam-questions': examQuestionsRef,
      chat: chatRef,
    };

    const ref = refs[sectionId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

const handleFileUpload = (file: File, size: 'small' | 'medium' | 'large') => {
  setUploadedFile(file);
  setFileSize(size);

  setTimeout(() => {
    scrollToSection('notes');
  }, 2000);
};


  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F8FAFC' }}>
      <Navigation 
        onNavigate={scrollToSection} 
        hasUploadedFile={!!uploadedFile}
        onOpenPanel={() => setIsPanelOpen(true)}
      />
      
      <HeroSection ref={heroRef} onGetStarted={() => scrollToSection('upload')} />
      
      <UploadSection ref={uploadRef} onFileUpload={handleFileUpload} />
      
      {uploadedFile && (
        <>
          <NotesSection
            key={`notes-${noteDetailLevel}-${noteFormat}`}
            ref={notesRef}
            file={uploadedFile}
            fileSize={fileSize}
            detailLevel={noteDetailLevel}
            format={noteFormat}
            highlightKeywords={highlightKeywords}
          />
          
          <KeywordsSection ref={keywordsRef} fileSize={fileSize} />
          
          <FlashcardsSection ref={flashcardsRef} fileSize={fileSize} />
          
          <QuizSection 
            key={`quiz-${quizLength}`}
            ref={quizRef} 
            fileSize={fileSize} 
            quizLength={quizLength} 
          />
          
          <ExamQuestionsSection ref={examQuestionsRef} fileSize={fileSize} />
          
          <ChatSection ref={chatRef} file={uploadedFile} />
          
          <StickyAIButton onClick={() => scrollToSection('chat')} />
        </>
      )}
      
      <Footer />
      
      <CustomizationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        noteDetailLevel={noteDetailLevel}
        onNoteDetailLevelChange={setNoteDetailLevel}
        noteFormat={noteFormat}
        onNoteFormatChange={setNoteFormat}
        highlightKeywords={highlightKeywords}
        onToggleHighlight={setHighlightKeywords}
        quizLength={quizLength}
        onQuizLengthChange={setQuizLength}
      />
      
      <Toaster position="top-right" />
    </div>
  );
}
