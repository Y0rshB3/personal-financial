const express = require('express');
const router = express.Router();
const {
  getExpectedExpenses,
  getExpectedExpense,
  createExpectedExpense,
  updateExpectedExpense,
  deleteExpectedExpense,
  completeExpectedExpense,
  getExpectedExpensesStats
} = require('../controllers/expectedExpenseController');
const { protect } = require('../middleware/auth');

router.use(protect); // Todas las rutas requieren autenticación

router.route('/')
  .get(getExpectedExpenses)
  .post(createExpectedExpense);

router.get('/stats', getExpectedExpensesStats);

router.route('/:id')
  .get(getExpectedExpense)
  .put(updateExpectedExpense)
  .delete(deleteExpectedExpense);

router.post('/:id/complete', completeExpectedExpense);

module.exports = router;
