import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface StickyAIButtonProps {
  onClick: () => void;
}

export function StickyAIButton({ onClick }: StickyAIButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 p-5 rounded-full shadow-2xl transition-all hover:scale-110 group"
      style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <MessageSquare className="w-7 h-7" style={{ color: 'white' }} />
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#FACC15' }} />
        </motion.div>
      </div>

      {/* Tooltip */}
      <div
        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          backgroundColor: '#1E293B',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        }}
      >
        Ask AI
        <div
          className="absolute left-full top-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '6px solid #1E293B',
          }}
        />
      </div>

      {/* Pulse Animation */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: '#2563EB',
        }}
        animate={{
          scale: [1, 1.5, 1.5],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </motion.button>
  );
}
