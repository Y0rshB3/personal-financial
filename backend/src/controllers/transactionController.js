const { Transaction, Category, User } = require('../models/postgres');
const ActivityLog = require('../models/mongodb/ActivityLog');
const { Op } = require('sequelize');
const { convertAmount } = require('../services/currencyService');

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

// @desc    Get transaction statistics (convertidas a moneda preferida)
// @route   GET /api/transactions/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Obtener la moneda preferida del usuario
    const user = await User.findByPk(req.user.id);
    const preferredCurrency = user?.currency || 'USD';

    console.log(`📊 Calculando stats para usuario ${req.user.id} en ${preferredCurrency}`);
    
    let where = { userId: req.user.id };
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    // Obtener TODAS las transacciones para convertir individualmente
    const transactions = await Transaction.findAll({
      where,
      attributes: ['id', 'type', 'amount', 'currency', 'date'],
      raw: true
    });

    console.log(`💰 Procesando ${transactions.length} transacciones`);

    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      transactions: transactions.length,
      currency: preferredCurrency // Indicar la moneda de los totales
    };

    // Convertir cada transacción a la moneda preferida usando tipo histórico
    for (const trans of transactions) {
      const fromCurrency = trans.currency || 'USD';
      const transDate = new Date(trans.date);
      
      // Convertir monto usando tipo de cambio histórico
      const convertedAmount = await convertAmount(
        parseFloat(trans.amount),
        fromCurrency,
        preferredCurrency,
        transDate
      );

      if (trans.type === 'income') {
        result.income += convertedAmount;
      } else if (trans.type === 'expense') {
        result.expense += convertedAmount;
      }
    }

    result.balance = result.income - result.expense;

    // Redondear a 2 decimales
    result.income = Math.round(result.income * 100) / 100;
    result.expense = Math.round(result.expense * 100) / 100;
    result.balance = Math.round(result.balance * 100) / 100;

    console.log(`✅ Stats calculadas: Income=${result.income} ${preferredCurrency}, Expense=${result.expense} ${preferredCurrency}`);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error calculando stats:', error);
    next(error);
  }
};
