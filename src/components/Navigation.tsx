import { Brain, Menu, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface NavigationProps {
  onNavigate: (section: string) => void;
  hasUploadedFile: boolean;
  onOpenPanel: () => void;
}

export function Navigation({ onNavigate, hasUploadedFile, onOpenPanel }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'upload', label: 'Upload' },
    ...(hasUploadedFile ? [
      { id: 'notes', label: 'Notes' },
      { id: 'keywords', label: 'Keywords' },
      { id: 'quiz', label: 'Quiz' },
      { id: 'flashcards', label: 'Flashcards' },
      { id: 'exam', label: 'Exam Questions' },
      { id: 'chat', label: 'AI Chat' },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(248, 250, 252, 0.9)', borderColor: 'rgba(37, 99, 235, 0.1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 transition-all hover:scale-105"
          >
            <div className="relative">
              <Brain className="w-8 h-8" style={{ color: '#2563EB' }} />
              <div className="absolute inset-0 blur-lg opacity-50" style={{ backgroundColor: '#2563EB' }} />
            </div>
            <span className="text-xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B' }}>
              SummarIQ
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                }}
                className="px-4 py-2 rounded-lg transition-all hover:scale-105"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                  e.currentTarget.style.color = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1E293B';
                }}
              >
                {item.label}
              </button>
            ))}
            
            {hasUploadedFile && (
              <Button
                onClick={onOpenPanel}
                variant="outline"
                size="sm"
                className="ml-2 gap-2"
                style={{
                  borderColor: '#2563EB',
                  color: '#2563EB',
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#2563EB' }}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: 'rgba(37, 99, 235, 0.1)' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 rounded-lg transition-all"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </button>
            ))}
            {hasUploadedFile && (
              <button
                onClick={() => {
                  onOpenPanel();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg mt-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#2563EB',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
