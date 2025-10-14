const pdf = require('pdf-parse');
const fs = require('fs');
const ProcessedFile = require('../models/mongodb/ProcessedFile');
const ActivityLog = require('../models/mongodb/ActivityLog');
const { analyzeTransactionsWithAI, analyzeTransactionsWithRegex } = require('../services/aiService');

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
// @route   POST /api/pdfs/process
// @access  Private
exports.processPDF = async (req, res, next) => {
  try {
    const { text, fileId } = req.body;
    
    let transactions = [];
    let method = 'regex'; // Por defecto usa regex
    
    // Intentar con IA si está configurada OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Analizando PDF con IA (OpenAI GPT)...');
        transactions = await analyzeTransactionsWithAI(text);
        method = 'ai';
        console.log(`✅ IA detectó ${transactions.length} transacciones`);
      } catch (aiError) {
        console.warn('⚠️  Error con IA, usando método regex fallback:', aiError.message);
        // Si falla la IA, usar regex como fallback
        transactions = analyzeTransactionsWithRegex(text);
      }
    } else {
      // Si no hay API key, usar regex mejorado
      console.log('📝 Analizando PDF con regex (sin OpenAI configurado)');
      transactions = analyzeTransactionsWithRegex(text);
    }

    // Update processed file in MongoDB
    if (fileId) {
      await ProcessedFile.findByIdAndUpdate(fileId, {
        processedTransactions: transactions,
        status: 'completed',
        processedAt: new Date(),
        analysisMethod: method
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'process_pdf',
      details: { 
        fileId,
        transactionsFound: transactions.length,
        method
      }
    });

    res.json({
      success: true,
      data: {
        found: transactions.length,
        transactions,
        method
      }
    });
  } catch (error) {
    next(error);
  }
};
