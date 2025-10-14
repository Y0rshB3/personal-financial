const express = require('express');
const router = express.Router();
const { getExchangeRates, convertCurrency } = require('../controllers/currencyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/rates/:base', getExchangeRates);
router.post('/convert', convertCurrency);

module.exports = router;
