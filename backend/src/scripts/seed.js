/**
 * Script de inicialización para crear datos de ejemplo
 * Ejecutar: node src/scripts/seed.js
 */

require('dotenv').config();
const { sequelize, connectPostgres } = require('../config/postgres');
const connectDB = require('../config/database');
const { User, Category, Transaction } = require('../models/postgres');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // Conectar a bases de datos
    await connectPostgres();
    await connectDB();

    // Limpiar datos existentes (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true });
      console.log('✅ Tablas limpiadas y recreadas');
    }

    // Crear usuario demo
    const demoUser = await User.create({
      name: 'Usuario Demo',
      email: 'demo@finanzapp.com',
      password: 'demo123',
      currency: 'USD',
      role: 'user'
    });
    console.log('✅ Usuario demo creado');

    // Crear usuario admin
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@finanzapp.com',
      password: 'admin123',
      currency: 'USD',
      role: 'admin'
    });
    console.log('✅ Usuario admin creado');

    // Categorías de gastos
    const expenseCategories = await Category.bulkCreate([
      { name: 'Alimentación', type: 'expense', icon: '🍔', color: '#EF4444', budget: 500, userId: demoUser.id },
      { name: 'Transporte', type: 'expense', icon: '🚗', color: '#3B82F6', budget: 300, userId: demoUser.id },
      { name: 'Vivienda', type: 'expense', icon: '🏠', color: '#10B981', budget: 1000, userId: demoUser.id },
      { name: 'Entretenimiento', type: 'expense', icon: '🎮', color: '#F59E0B', budget: 200, userId: demoUser.id },
      { name: 'Salud', type: 'expense', icon: '💊', color: '#8B5CF6', budget: 150, userId: demoUser.id },
      { name: 'Educación', type: 'expense', icon: '🎓', color: '#EC4899', budget: 250, userId: demoUser.id },
      { name: 'Compras', type: 'expense', icon: '🛒', color: '#14B8A6', budget: 400, userId: demoUser.id },
    ]);
    console.log('✅ Categorías de gastos creadas');

    // Categorías de ingresos
    const incomeCategories = await Category.bulkCreate([
      { name: 'Salario', type: 'income', icon: '💰', color: '#10B981', userId: demoUser.id },
      { name: 'Freelance', type: 'income', icon: '💼', color: '#3B82F6', userId: demoUser.id },
      { name: 'Inversiones', type: 'income', icon: '📈', color: '#F59E0B', userId: demoUser.id },
      { name: 'Otros', type: 'income', icon: '💵', color: '#6B7280', userId: demoUser.id },
    ]);
    console.log('✅ Categorías de ingresos creadas');

    // Transacciones de ejemplo
    const now = new Date();
    const transactions = [];

    // Ingresos del mes
    transactions.push({
      type: 'income',
      amount: 3500.00,
      description: 'Salario mensual',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      categoryId: incomeCategories[0].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    transactions.push({
      type: 'income',
      amount: 800.00,
      description: 'Proyecto freelance',
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      categoryId: incomeCategories[1].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    // Gastos del mes
    transactions.push({
      type: 'expense',
      amount: 450.50,
      description: 'Compra mensual supermercado',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      categoryId: expenseCategories[0].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    transactions.push({
      type: 'expense',
      amount: 850.00,
      description: 'Renta del departamento',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      categoryId: expenseCategories[2].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    transactions.push({
      type: 'expense',
      amount: 120.00,
      description: 'Gasolina',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      categoryId: expenseCategories[1].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    transactions.push({
      type: 'expense',
      amount: 89.99,
      description: 'Suscripción streaming',
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      categoryId: expenseCategories[3].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    transactions.push({
      type: 'expense',
      amount: 200.00,
      description: 'Curso online',
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      categoryId: expenseCategories[5].id,
      userId: demoUser.id,
      currency: 'USD',
      source: 'manual'
    });

    await Transaction.bulkCreate(transactions);
    console.log('✅ Transacciones de ejemplo creadas');

    console.log('\n🎉 Seed completado exitosamente!\n');
    console.log('📧 Credenciales de acceso:');
    console.log('   Usuario Demo: demo@finanzapp.com / demo123');
    console.log('   Admin:        admin@finanzapp.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedData();
