import { demoNotes, demoKeywords, demoFlashcards, demoQuiz, demoExamQuestions } from '../data/demoData';

export const IS_DEMO_MODE = window.location.hostname.includes('github.io');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const demoAPI = {
  uploadDocument: async (file: File) => {
    await delay(1500);
    return {
      success: true,
      data: { fileId: 'demo-file-123', fileName: file.name }
    };
  },

  generateNotes: async (fileId: string, length: string) => {
    await delay(2000);
    return {
      success: true,
      data: { notes: demoNotes }
    };
  },

  extractKeywords: async (fileId: string) => {
    await delay(1500);
    return {
      success: true,
      data: {
        keywords: demoKeywords.map(k => k.term),
        definitions: Object.fromEntries(demoKeywords.map(k => [k.term, k.definition])),
        contexts: Object.fromEntries(demoKeywords.map(k => [k.term, k.context]))
      }
    };
  },

  generateFlashcards: async (fileId: string, count: number) => {
    console.log('Demo API: generateFlashcards called', { fileId, count, totalCards: demoFlashcards.length });
    await delay(1800);
    const cards = demoFlashcards.slice(0, count);
    console.log('Demo API: Returning flashcards', cards);
    return {
      success: true,
      data: { flashcards: cards }
    };
  },

  generateQuiz: async (fileId: string, count: number) => {
    await delay(1800);
    return {
      success: true,
      data: { questions: demoQuiz.slice(0, count).map((q, i) => ({ ...q, id: i + 1 })) }
    };
  },

  generateExamQuestions: async (fileId: string, count: number) => {
    await delay(2000);
    return {
      success: true,
      data: { questions: demoExamQuestions.slice(0, count) }
    };
  },

  chatWithDocument: async (fileId: string, question: string) => {
    await delay(1000);
    const responses: Record<string, string> = {
      'tcp': 'TCP (Transmission Control Protocol) is a connection-oriented protocol that ensures reliable data delivery through acknowledgments and retransmission of lost packets.',
      'dns': 'DNS (Domain Name System) translates human-readable domain names like google.com into IP addresses that computers use to communicate.',
      'osi': 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer has specific functions in network communication.',
      'router': 'A router is a network device that forwards data packets between different networks, directing traffic based on IP addresses.',
      'default': 'Based on the document about computer networks, that\'s an interesting question. The document covers TCP/IP, DNS, routers, and the OSI model in detail.'
    };

    const lowerQuestion = question.toLowerCase();
    let answer = responses.default;
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        answer = value;
        break;
      }
    }

    return {
      success: true,
      data: { answer }
    };
  },

  generateSummary: async (fileId: string, length: string) => {
    await delay(1500);
    return {
      success: true,
      data: {
        summary: 'This document provides a comprehensive overview of computer networking fundamentals, covering network types, protocols, and the OSI model.'
      }
    };
  }
};
