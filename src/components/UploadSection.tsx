import { forwardRef, useState, useCallback } from 'react';
import { Upload, FileText, File, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { uploadDocument } from '../api/summariq';

interface UploadSectionProps {
  onFileUpload: (file: File, fileSize: 'small' | 'medium' | 'large') => void;
}

export const UploadSection = forwardRef<HTMLElement, UploadSectionProps>(
  ({ onFileUpload }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const determineFileSize = (bytes: number): 'small' | 'medium' | 'large' => {
      const mb = bytes / (1024 * 1024);
      if (mb < 1) return 'small';
      if (mb < 5) return 'medium';
      return 'large';
    };

   const handleFileSelect = useCallback(async (file: File) => {
  const validTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!validTypes.includes(file.type)) {
    toast.error('Please upload a PDF, PPT, or DOCX file');
    return;
  }

  setSelectedFile(file);
  setIsProcessing(true);
  setUploadProgress(0);

  try {
    // Fake progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 300);

    // Call backend API
    const result = await uploadDocument(file);
    
    clearInterval(progressInterval);
    setUploadProgress(100);

    console.log('Upload result:', result); // Debug log

    if (result.success) {
      const fileSize = determineFileSize(file.size);
      const fileId = result.data?.fileId || result.fileId;
      
      sessionStorage.setItem('currentFileId', fileId);
      sessionStorage.setItem('currentFileName', file.name);
      
      toast.success('File uploaded successfully!');
      onFileUpload(file, fileSize);
    } else {
      throw new Error('Upload response was not successful');
    }
  } catch (error) {
    console.error('Upload error:', error); // Debug log
    toast.error('Failed to upload file. Please try again.');
    setIsProcessing(false);
    setUploadProgress(0);
  }
}, [onFileUpload]);



    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleFileInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [handleFileSelect]
    );

    return (
      <section
        ref={ref}
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
        style={{
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
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
              Upload Your Material
            </h2>
            <p
              className="text-xl"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              PDF, PPT, or DOCX files supported
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="relative rounded-3xl p-12 transition-all cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: `3px dashed ${isDragging ? '#2563EB' : 'rgba(37, 99, 235, 0.3)'}`,
                boxShadow: isDragging
                  ? '0 20px 60px rgba(37, 99, 235, 0.3)'
                  : '0 10px 30px rgba(0, 0, 0, 0.1)',
              }}
            >
              <AnimatePresence mode="wait">
                {!isProcessing ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <motion.div
                      className="inline-block mb-6"
                      animate={{
                        y: isDragging ? -10 : 0,
                        scale: isDragging ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <Upload
                          className="w-20 h-20 mx-auto"
                          style={{ color: '#2563EB' }}
                        />
                        {isDragging && (
                          <motion.div
                            className="absolute inset-0 rounded-full blur-2xl"
                            style={{ backgroundColor: '#2563EB', opacity: 0.3 }}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>

                    <h3
                      className="text-2xl mb-2"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#1E293B',
                      }}
                    >
                      {isDragging ? 'Drop your file here' : 'Drag & drop your file'}
                    </h3>
                    <p
                      className="mb-6"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#64748B',
                      }}
                    >
                      or click to browse
                    </p>

                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileInput}
                    />
                    <label htmlFor="file-upload">
                      <motion.div
                        className="inline-block px-8 py-4 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          color: 'white',
                          fontFamily: 'Poppins, sans-serif',
                          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Browse Files
                      </motion.div>
                    </label>

                    <div
                      className="mt-8 p-4 rounded-xl"
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
                        }}
                      >
                        📄 Supports large files – reads every line with no truncation
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      {uploadProgress < 100 ? (
                        <Loader2
                          className="w-20 h-20 mx-auto animate-spin"
                          style={{ color: '#2563EB' }}
                        />
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <CheckCircle2
                            className="w-20 h-20 mx-auto"
                            style={{ color: '#22C55E' }}
                          />
                        </motion.div>
                      )}
                    </div>

                    <h3
                      className="text-2xl mb-4"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#1E293B',
                      }}
                    >
                      {uploadProgress < 100 ? 'Processing...' : 'Upload Complete!'}
                    </h3>

                    {selectedFile && (
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <FileText className="w-5 h-5" style={{ color: '#2563EB' }} />
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#64748B',
                          }}
                        >
                          {selectedFile.name}
                        </span>
                      </div>
                    )}

                    <div className="w-full max-w-md mx-auto">
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
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p
                        className="mt-2 text-sm"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#64748B',
                        }}
                      >
                        {uploadProgress}%
                      </p>
                      
                      {uploadProgress === 100 && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          onClick={() => {
                            setIsProcessing(false);
                            setUploadProgress(0);
                            setSelectedFile(null);
                            sessionStorage.removeItem('currentFileId');
                            sessionStorage.removeItem('currentFileName');
                            toast.success('Ready to upload a new file');
                          }}
                          className="mt-6 px-6 py-3 rounded-xl transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                            color: 'white',
                            fontFamily: 'Poppins, sans-serif',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                          }}
                        >
                          Upload New File
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
);

UploadSection.displayName = 'UploadSection';
