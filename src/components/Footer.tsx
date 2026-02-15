import { Github, Linkedin, Mail, Heart, Code } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  return (
    <footer
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#1E293B',
        borderTop: '1px solid rgba(37, 99, 235, 0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Open Source Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="w-8 h-8" style={{ color: '#2563EB' }} />
            <h3
              className="text-3xl"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: 'white',
              }}
            >
              SummarIQ is Open Source
            </h3>
          </div>
          <p
            className="text-lg mb-6"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#94A3B8',
            }}
          >
            Built for Students, by Students
          </p>
          <div className="flex items-center justify-center gap-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
              style={{
                backgroundColor: 'white',
                color: '#1E293B',
                fontFamily: 'Poppins, sans-serif',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </motion.a>
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
              }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-5 h-5" style={{ color: '#EF4444' }} />
              Contribute
            </motion.a>
          </div>
        </motion.div>

        {/* Divider */}
        <div
          className="mb-8"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.3), transparent)',
          }}
        />

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h4
              className="text-lg mb-4"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: 'white',
              }}
            >
              About
            </h4>
            <ul className="space-y-2">
              {['About Us', 'Features', 'How It Works', 'FAQ'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-blue-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#94A3B8',
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-lg mb-4"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: 'white',
              }}
            >
              Resources
            </h4>
            <ul className="space-y-2">
              {['Documentation', 'API Reference', 'Community', 'Blog'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-blue-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#94A3B8',
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-lg mb-4"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: 'white',
              }}
            >
              Legal
            </h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Contact', 'Feedback'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-blue-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#94A3B8',
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {[
            { Icon: Github, href: 'https://github.com', label: 'GitHub' },
            { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
            { Icon: Mail, href: 'mailto:contact@summariq.com', label: 'Email' },
          ].map(({ Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
              }}
              whileHover={{
                backgroundColor: '#2563EB',
                color: 'white',
                scale: 1.1,
              }}
              whileTap={{ scale: 0.95 }}
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p
            className="mb-2"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#64748B',
            }}
          >
            Built with{' '}
            <Heart
              className="inline w-4 h-4 mx-1"
              style={{ color: '#EF4444', fill: '#EF4444' }}
            />{' '}
            using React, Tailwind CSS, and AI
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
            }}
          >
            © 2025 SummarIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
