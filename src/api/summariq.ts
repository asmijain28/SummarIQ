import { API_ENDPOINTS } from './config';
import { IS_DEMO_MODE, demoAPI } from './demoMode';

export const uploadDocument = async (file: File) => {
  if (IS_DEMO_MODE) return demoAPI.uploadDocument(file);
  
  if (!file) {
    throw new Error('No file provided to uploadDocument');
  }
  
  const formData = new FormData();
  formData.append('document', file);
  
  try {
    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Upload failed: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const generateNotes = async (fileId: string, length: 'short' | 'medium' | 'detailed' = 'detailed') => {
  if (IS_DEMO_MODE) return demoAPI.generateNotes(fileId, length);
  
  const response = await fetch(API_ENDPOINTS.NOTES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, length })
  });
  
  if (!response.ok) throw new Error('Notes generation failed');
  return await response.json();
};

export const extractKeywords = async (fileId: string) => {
  if (IS_DEMO_MODE) return demoAPI.extractKeywords(fileId);
  
  const response = await fetch(API_ENDPOINTS.KEYWORDS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId })
  });
  
  if (!response.ok) throw new Error('Keywords extraction failed');
  return await response.json();
};

export const generateFlashcards = async (fileId: string, count: number = 20) => {
  if (IS_DEMO_MODE) return demoAPI.generateFlashcards(fileId, count);
  
  const response = await fetch(API_ENDPOINTS.FLASHCARDS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, count })
  });
  
  if (!response.ok) throw new Error('Flashcards generation failed');
  return await response.json();
};

export const generateQuiz = async (fileId: string, count: number = 10) => {
  if (IS_DEMO_MODE) return demoAPI.generateQuiz(fileId, count);
  
  const response = await fetch(API_ENDPOINTS.QUIZ, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, count })
  });
  
  if (!response.ok) throw new Error('Quiz generation failed');
  return await response.json();
};

export const generateExamQuestions = async (fileId: string, count: number = 10) => {
  if (IS_DEMO_MODE) return demoAPI.generateExamQuestions(fileId, count);
  
  const response = await fetch(API_ENDPOINTS.EXAM_QUESTIONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, count })
  });
  
  if (!response.ok) throw new Error('Exam questions generation failed');
  return await response.json();
};

export const chatWithDocument = async (fileId: string, question: string) => {
  if (IS_DEMO_MODE) return demoAPI.chatWithDocument(fileId, question);
  
  const response = await fetch(API_ENDPOINTS.CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, question })
  });
  
  if (!response.ok) throw new Error('Chat failed');
  return await response.json();
};

export const generateSummary = async (fileId: string, length: 'short' | 'medium' | 'long' = 'medium') => {
  if (IS_DEMO_MODE) return demoAPI.generateSummary(fileId, length);
  
  const response = await fetch(API_ENDPOINTS.SUMMARY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, length })
  });

  if (!response.ok) throw new Error('Summary generation failed');
  return await response.json();
};