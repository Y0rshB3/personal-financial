const express = require('express');
const router = express.Router();
const {
  exportToExcel,
  sendEmailReport,
  getSavingsRecommendations,
  getMonthlyReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/export/excel', exportToExcel);
router.post('/email', sendEmailReport);
router.get('/savings-recommendations', getSavingsRecommendations);
router.get('/monthly/:year/:month', getMonthlyReport);

module.exports = router;
