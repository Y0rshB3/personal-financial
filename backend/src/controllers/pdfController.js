const pdf = require('pdf-parse');
const fs = require('fs');
const ProcessedFile = require('../models/mongodb/ProcessedFile');
const ActivityLog = require('../models/mongodb/ActivityLog');

// @desc    Upload PDF
// @route   POST /api/pdfs/upload
// @access  Private
exports.uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Por favor sube un archivo PDF' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    // Save to MongoDB
    const processedFile = await ProcessedFile.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: 'pdf',
      size: req.file.size,
      extractedText: data.text,
      status: 'completed',
      processedAt: new Date()
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'upload_pdf',
      details: { 
        fileId: processedFile._id.toString(),
        filename: req.file.originalname,
        pages: data.numpages
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        id: processedFile._id,
        text: data.text,
        pages: data.numpages,
        info: data.info
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Process PDF and extract transactions
// @route   POST /api/pdfs/process/:id
// @access  Private
exports.processPDF = async (req, res, next) => {
  try {
    const { text, fileId } = req.body;
    
    // Simple pattern matching for transaction extraction
    // This is a basic example - real implementation would be more sophisticated
    const lines = text.split('\n');
    const transactions = [];
    
    // Pattern example: Date Amount Description
    const transactionPattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\$?\d+\.?\d*)\s+(.+)/;
    
    for (const line of lines) {
      const match = line.match(transactionPattern);
      if (match) {
        transactions.push({
          date: new Date(match[1]),
          amount: parseFloat(match[2].replace('$', '')),
          description: match[3].trim(),
          imported: false
        });
      }
    }

    // Update processed file in MongoDB
    if (fileId) {
      await ProcessedFile.findByIdAndUpdate(fileId, {
        processedTransactions: transactions,
        status: 'completed',
        processedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        found: transactions.length,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};
