const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect); // Todas las rutas requieren autenticación

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.get('/stats', getStats);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
