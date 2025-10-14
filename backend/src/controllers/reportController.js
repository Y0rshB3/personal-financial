const { Transaction, Category } = require('../models/postgres');
const ActivityLog = require('../models/mongodb/ActivityLog');
const EmailQueue = require('../models/mongodb/EmailQueue');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// @desc    Export transactions to Excel
// @route   GET /api/reports/export/excel
// @access  Private
exports.exportToExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where = { userId: req.user.id };
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['name']
      }],
      order: [['date', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transacciones');

    // Headers
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Tipo', key: 'type', width: 10 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Moneda', key: 'currency', width: 10 }
    ];

    // Add rows
    transactions.forEach(trans => {
      worksheet.addRow({
        date: new Date(trans.date).toLocaleDateString(),
        type: trans.type === 'income' ? 'Ingreso' : 'Gasto',
        category: trans.category?.name || 'Sin categoría',
        description: trans.description || '',
        amount: parseFloat(trans.amount),
        currency: trans.currency
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'export_excel',
      details: { transactions: transactions.length }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transacciones.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Send email report
// @route   POST /api/reports/email
// @access  Private
exports.sendEmailReport = async (req, res, next) => {
  try {
    const { email, startDate, endDate } = req.body;

    let where = { userId: req.user.id };
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });

    const { sequelize } = require('../config/postgres');
    const stats = await Transaction.findAll({
      where,
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['type'],
      raw: true
    });

    let income = 0, expense = 0;
    stats.forEach(stat => {
      if (stat.type === 'income') income = parseFloat(stat.total);
      if (stat.type === 'expense') expense = parseFloat(stat.total);
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const htmlContent = `
      <h2>Reporte Financiero</h2>
      <p><strong>Ingresos:</strong> $${income.toFixed(2)}</p>
      <p><strong>Gastos:</strong> $${expense.toFixed(2)}</p>
      <p><strong>Balance:</strong> $${(income - expense).toFixed(2)}</p>
      <h3>Transacciones: ${transactions.length}</h3>
    `;

    // Agregar a cola de emails (MongoDB)
    await EmailQueue.create({
      userId: req.user.id,
      to: email || req.user.email,
      subject: 'Reporte Financiero Personal',
      htmlContent,
      status: 'pending'
    });

    // Enviar email inmediatamente (o procesar cola después)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email || req.user.email,
      subject: 'Reporte Financiero Personal',
      html: htmlContent
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'send_email',
      details: { to: email || req.user.email, type: 'report' }
    });

    res.json({
      success: true,
      message: 'Reporte enviado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get savings recommendations
// @route   GET /api/reports/savings-recommendations
// @access  Private
exports.getSavingsRecommendations = async (req, res, next) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [startDate, endDate] }
      },
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name', 'budget']
      }]
    });

    // Group by category
    const categoryExpenses = {};
    transactions.forEach(trans => {
      if (!trans.category) return;
      const catId = trans.category.id;
      if (!categoryExpenses[catId]) {
        categoryExpenses[catId] = {
          name: trans.category.name,
          total: 0,
          budget: parseFloat(trans.category.budget) || 0,
          count: 0
        };
      }
      categoryExpenses[catId].total += parseFloat(trans.amount);
      categoryExpenses[catId].count += 1;
    });

    const recommendations = [];
    
    Object.values(categoryExpenses).forEach(cat => {
      const avgMonthly = cat.total / 3;
      
      if (cat.budget > 0 && avgMonthly > cat.budget) {
        recommendations.push({
          category: cat.name,
          message: `Estás gastando $${avgMonthly.toFixed(2)}/mes en promedio, pero tu presupuesto es $${cat.budget}. Considera reducir en ${((avgMonthly - cat.budget) / avgMonthly * 100).toFixed(1)}%`,
          severity: 'high'
        });
      } else if (avgMonthly > 500) {
        recommendations.push({
          category: cat.name,
          message: `Has gastado $${cat.total.toFixed(2)} en los últimos 3 meses. Podrías ahorrar reduciendo un 10% ($${(avgMonthly * 0.1).toFixed(2)}/mes)`,
          severity: 'medium'
        });
      }
    });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly report
// @route   GET /api/reports/monthly/:year/:month
// @access  Private
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.between]: [startDate, endDate] }
      },
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }],
      order: [['date', 'DESC']]
    });

    const { sequelize } = require('../config/postgres');
    const stats = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'type',
        'categoryId',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count']
      ],
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['name']
      }],
      group: ['type', 'categoryId', 'category.id', 'category.name'],
      raw: false
    });

    res.json({
      success: true,
      data: {
        transactions,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};
