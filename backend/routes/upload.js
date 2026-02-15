/**
 * Upload Route - File Upload Handler
 * 
 * Handles document uploads (PDF, PPT, PPTX, DOCX)
 * Validates file size and type
 * Stores file metadata and returns file ID for further processing
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// MULTER CONFIGURATION
// ============================================

// Configure storage - Save files with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter - Only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',                                                  // PDF
    'application/vnd.ms-powerpoint',                                   // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/msword',                                              // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/octet-stream'                                         // Generic binary (for edge cases)
  ];
  
  const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // Check both MIME type and extension for security
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PPT, PPTX, DOC, and DOCX files are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 25) * 1024 * 1024, // Convert MB to bytes
  }
});

// ============================================
// UPLOAD ENDPOINT
// ============================================

/**
 * POST /api/upload
 * 
 * Upload a document (PDF, PPT, PPTX, DOCX)
 * 
 * Request:
 *   - Form-data with 'document' field
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "File uploaded successfully",
 *     data: {
 *       fileId: "unique-file-id",
 *       filename: "original-filename.pdf",
 *       filepath: "/path/to/file",
 *       size: 1234567,
 *       type: "application/pdf",
 *       uploadedAt: "2024-01-24T10:30:00.000Z"
 *     }
 *   }
 */
router.post('/', upload.single('document'), async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please select a document to upload'
      });
    }
    
    const file = req.file;
    
    // Log upload details
    console.log(`📤 File uploaded: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Prepare response data
    const fileData = {
      fileId: path.basename(file.filename, path.extname(file.filename)), // Use filename without extension as ID
      filename: file.originalname,
      filepath: file.path,
      size: file.size,
      type: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      uploadedAt: new Date().toISOString()
    };
    
    // Optional: Save file metadata to database
    // If MongoDB is configured, you can store this information
    /*
    if (process.env.MONGODB_URI) {
      const FileModel = require('../models/File');
      await FileModel.create({
        ...fileData,
        userId: req.user?.id // If using JWT authentication
      });
    }
    */
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });
    
  } catch (error) {
    console.error(' Upload error:', error);
    next(error);
  }
});

// ============================================
// DELETE UPLOADED FILE ENDPOINT (Optional)
// ============================================

/**
 * DELETE /api/upload/:fileId
 * 
 * Delete an uploaded file
 * Useful for cleanup after processing
 */
router.delete('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Find file with matching fileId prefix
    const files = fs.readdirSync(uploadsDir);
    const fileToDelete = files.find(file => file.startsWith(fileId));
    
    if (!fileToDelete) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The requested file does not exist'
      });
    }
    
    const filePath = path.join(uploadsDir, fileToDelete);
    
    // Delete file from filesystem
    fs.unlinkSync(filePath);
    
    console.log(`  File deleted: ${fileToDelete}`);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error(' Delete error:', error);
    next(error);
  }
});

// ============================================
// GET FILE INFO ENDPOINT (Optional)
// ============================================

/**
 * GET /api/upload/:fileId
 * 
 * Get information about an uploaded file
 */
router.get('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Find file with matching fileId prefix
    const files = fs.readdirSync(uploadsDir);
    const targetFile = files.find(file => file.startsWith(fileId));
    
    if (!targetFile) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The requested file does not exist'
      });
    }
    
    const filePath = path.join(uploadsDir, targetFile);
    const stats = fs.statSync(filePath);
    
    res.status(200).json({
      success: true,
      data: {
        fileId: fileId,
        filename: targetFile,
        filepath: filePath,
        size: stats.size,
        extension: path.extname(targetFile).toLowerCase(),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
    
  } catch (error) {
    console.error(' Get file info error:', error);
    next(error);
  }
});

module.exports = router;