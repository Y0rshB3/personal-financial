const { Transaction, Category } = require('../models/postgres');
const ActivityLog = require('../models/mongodb/ActivityLog');
const { Op } = require('sequelize');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, type, categoryId } = req.query;
    
    let where = { userId: req.user.id };
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;

    const transactions = await Transaction.findAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user.id
    };
    
    const transaction = await Transaction.create(transactionData);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create_transaction',
      details: { 
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.type
      }
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    await transaction.update(req.body);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_transaction',
      details: { transactionId: transaction.id }
    });

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    await transaction.destroy();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete_transaction',
      details: { transactionId: req.params.id }
    });

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where = { userId: req.user.id };
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const { sequelize } = require('../config/postgres');
    
    const stats = await Transaction.findAll({
      where,
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      transactions: 0
    };

    stats.forEach(stat => {
      if (stat.type === 'income') {
        result.income = parseFloat(stat.total);
        result.transactions += parseInt(stat.count);
      } else if (stat.type === 'expense') {
        result.expense = parseFloat(stat.total);
        result.transactions += parseInt(stat.count);
      }
    });

    result.balance = result.income - result.expense;

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
