const pdf = require('pdf-parse');
const fs = require('fs');
const ProcessedFile = require('../models/mongodb/ProcessedFile');
const ActivityLog = require('../models/mongodb/ActivityLog');
const { Category } = require('../models/postgres');
const { analyzeTransactionsWithAI, analyzeTransactionsWithRegex } = require('../services/aiService');

// @desc    Upload PDF
// @route   POST /api/pdfs/upload
// @access  Private
exports.uploadPDF = async (req, res, next) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Por favor sube un archivo PDF' 
      });
    }

    filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    
    console.log(`📄 Procesando PDF: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Opciones más permisivas para pdf-parse
    const options = {
      max: 0, // 0 = all pages
      version: 'v1.10.100'
    };
    
    let data;
    try {
      data = await pdf(dataBuffer, options);
      console.log(`✅ PDF parseado: ${data.numpages} páginas, ${data.text.length} caracteres`);
    } catch (pdfError) {
      console.error('❌ Error parseando PDF:', pdfError.message);
      
      // Intentar con opciones más agresivas
      try {
        console.log('🔄 Reintentando con opciones alternativas...');
        const altData = await pdf(dataBuffer, { max: 0 });
        data = altData;
        console.log('✅ PDF parseado en segundo intento');
      } catch (retryError) {
        throw new Error(`El PDF no pudo ser procesado. Puede estar corrupto o tener un formato no soportado. Error: ${pdfError.message}`);
      }
    }

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
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

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
    console.error('❌ Error en uploadPDF:', error);
    
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Error al procesar el PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Process PDF and extract transactions
// @route   POST /api/pdfs/process
// @access  Private
exports.processPDF = async (req, res, next) => {
  try {
    const { text, fileId } = req.body;
    
    // Obtener categorías del usuario desde la base de datos
    const userCategories = await Category.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'type', 'icon']
    });
    
    console.log(`📂 Categorías del usuario: ${userCategories.length} encontradas`);
    
    let transactions = [];
    let method = 'regex'; // Por defecto usa regex
    
    // Intentar con IA si está configurada OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Analizando PDF con IA (OpenAI GPT)...');
        transactions = await analyzeTransactionsWithAI(text, userCategories);
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
