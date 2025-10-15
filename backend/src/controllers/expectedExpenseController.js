const { ExpectedExpense, Category, Transaction } = require('../models/postgres');
const ActivityLog = require('../models/mongodb/ActivityLog');
const { Op } = require('sequelize');

// @desc    Get all expected expenses
// @route   GET /api/expected-expenses
// @access  Private
exports.getExpectedExpenses = async (req, res, next) => {
  try {
    const { status, startDate, endDate, categoryId } = req.query;
    
    let where = { userId: req.user.id };
    
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (startDate && endDate) {
      where.expectedDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const expectedExpenses = await ExpectedExpense.findAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }],
      order: [['expectedDate', 'ASC']]
    });

    res.json({
      success: true,
      count: expectedExpenses.length,
      data: expectedExpenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expected expense
// @route   GET /api/expected-expenses/:id
// @access  Private
exports.getExpectedExpense = async (req, res, next) => {
  try {
    const expectedExpense = await ExpectedExpense.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }]
    });

    if (!expectedExpense) {
      return res.status(404).json({ message: 'Gasto esperado no encontrado' });
    }

    res.json({ success: true, data: expectedExpense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expected expense
// @route   POST /api/expected-expenses
// @access  Private
exports.createExpectedExpense = async (req, res, next) => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.user.id
    };
    
    const expectedExpense = await ExpectedExpense.create(expenseData);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create_expected_expense',
      details: { 
        expectedExpenseId: expectedExpense.id,
        amount: expectedExpense.amount,
        name: expectedExpense.name
      }
    });

    res.status(201).json({
      success: true,
      data: expectedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expected expense
// @route   PUT /api/expected-expenses/:id
// @access  Private
exports.updateExpectedExpense = async (req, res, next) => {
  try {
    const expectedExpense = await ExpectedExpense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expectedExpense) {
      return res.status(404).json({ message: 'Gasto esperado no encontrado' });
    }

    // No permitir actualizar si ya está completado
    if (expectedExpense.status === 'completed') {
      return res.status(400).json({ 
        message: 'No se puede actualizar un gasto esperado ya completado' 
      });
    }

    await expectedExpense.update(req.body);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_expected_expense',
      details: { expectedExpenseId: expectedExpense.id }
    });

    res.json({ success: true, data: expectedExpense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expected expense
// @route   DELETE /api/expected-expenses/:id
// @access  Private
exports.deleteExpectedExpense = async (req, res, next) => {
  try {
    const expectedExpense = await ExpectedExpense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expectedExpense) {
      return res.status(404).json({ message: 'Gasto esperado no encontrado' });
    }

    await expectedExpense.destroy();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete_expected_expense',
      details: { expectedExpenseId: req.params.id }
    });

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark expected expense as completed (creates a transaction)
// @route   POST /api/expected-expenses/:id/complete
// @access  Private
exports.completeExpectedExpense = async (req, res, next) => {
  try {
    const expectedExpense = await ExpectedExpense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expectedExpense) {
      return res.status(404).json({ message: 'Gasto esperado no encontrado' });
    }

    if (expectedExpense.status === 'completed') {
      return res.status(400).json({ 
        message: 'Este gasto esperado ya fue completado' 
      });
    }

    // Crear la transacción de gasto
    const transaction = await Transaction.create({
      type: 'expense',
      amount: req.body.amount || expectedExpense.amount,
      currency: req.body.currency || expectedExpense.currency,
      description: req.body.description || expectedExpense.description || `Gasto esperado: ${expectedExpense.name}`,
      date: req.body.date || new Date(),
      source: 'manual',
      tags: expectedExpense.tags,
      userId: req.user.id,
      categoryId: expectedExpense.categoryId
    });

    // Actualizar el gasto esperado
    await expectedExpense.update({
      status: 'completed',
      completedDate: new Date(),
      transactionId: transaction.id
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'complete_expected_expense',
      details: { 
        expectedExpenseId: expectedExpense.id,
        transactionId: transaction.id,
        amount: transaction.amount
      }
    });

    res.json({ 
      success: true, 
      data: {
        expectedExpense,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expected expenses statistics
// @route   GET /api/expected-expenses/stats
// @access  Private
exports.getExpectedExpensesStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where = { userId: req.user.id };
    if (startDate && endDate) {
      where.expectedDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const expectedExpenses = await ExpectedExpense.findAll({
      where,
      attributes: ['id', 'status', 'amount', 'currency'],
      raw: true
    });

    const stats = {
      total: expectedExpenses.length,
      pending: 0,
      completed: 0,
      totalAmount: 0,
      pendingAmount: 0,
      completedAmount: 0
    };

    expectedExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      stats.totalAmount += amount;

      if (expense.status === 'pending') {
        stats.pending++;
        stats.pendingAmount += amount;
      } else if (expense.status === 'completed') {
        stats.completed++;
        stats.completedAmount += amount;
      }
    });

    // Redondear a 2 decimales
    stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
    stats.pendingAmount = Math.round(stats.pendingAmount * 100) / 100;
    stats.completedAmount = Math.round(stats.completedAmount * 100) / 100;

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
