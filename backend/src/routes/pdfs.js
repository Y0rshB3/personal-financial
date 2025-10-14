const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadPDF, processPDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }
});

router.use(protect);

router.post('/upload', upload.single('pdf'), uploadPDF);
router.post('/process', processPDF);

module.exports = router;
