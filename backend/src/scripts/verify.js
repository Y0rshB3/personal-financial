/**
 * Script de verificación del sistema
 * Ejecutar: node src/scripts/verify.js
 */

require('dotenv').config();
const { sequelize } = require('../config/postgres');
const mongoose = require('mongoose');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

const verify = async () => {
  console.log('\n🔍 Verificando Sistema de Finanzas Personales\n');

  let allGood = true;

  // 1. Verificar variables de entorno
  log.info('Verificando variables de entorno...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];

  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      log.success(`${varName} configurado`);
    } else {
      log.error(`${varName} NO configurado`);
      allGood = false;
    }
  });

  // 2. Verificar conexión PostgreSQL
  log.info('\nVerificando conexión a PostgreSQL...');
  try {
    await sequelize.authenticate();
    log.success('PostgreSQL conectado correctamente');

    // Verificar tablas
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = results.map(r => r.table_name);
    const expectedTables = ['Users', 'Categories', 'Transactions'];
    
    expectedTables.forEach(table => {
      if (tables.includes(table)) {
        log.success(`Tabla ${table} existe`);
      } else {
        log.warning(`Tabla ${table} no encontrada`);
      }
    });
  } catch (error) {
    log.error(`Error conectando a PostgreSQL: ${error.message}`);
    allGood = false;
  }

  // 3. Verificar conexión MongoDB
  log.info('\nVerificando conexión a MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('MongoDB conectado correctamente');

    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const expectedCollections = ['activitylogs', 'processedfiles', 'emailqueues', 'userpreferences'];
    
    if (collectionNames.length > 0) {
      log.success(`${collectionNames.length} colecciones encontradas`);
      expectedCollections.forEach(name => {
        if (collectionNames.includes(name)) {
          log.success(`Colección ${name} existe`);
        } else {
          log.info(`Colección ${name} será creada al usarse`);
        }
      });
    } else {
      log.info('No hay colecciones aún (normal en primera ejecución)');
    }
  } catch (error) {
    log.error(`Error conectando a MongoDB: ${error.message}`);
    allGood = false;
  }

  // 4. Verificar modelos
  log.info('\nVerificando modelos...');
  try {
    const { User, Transaction, Category } = require('../models/postgres');
    log.success('Modelos PostgreSQL cargados: User, Transaction, Category');

    const ActivityLog = require('../models/mongodb/ActivityLog');
    const ProcessedFile = require('../models/mongodb/ProcessedFile');
    const EmailQueue = require('../models/mongodb/EmailQueue');
    const UserPreferences = require('../models/mongodb/UserPreferences');
    log.success('Modelos MongoDB cargados: ActivityLog, ProcessedFile, EmailQueue, UserPreferences');
  } catch (error) {
    log.error(`Error cargando modelos: ${error.message}`);
    allGood = false;
  }

  // 5. Verificar controllers
  log.info('\nVerificando controllers...');
  const controllers = [
    'authController',
    'transactionController',
    'categoryController',
    'reportController',
    'userController',
    'pdfController',
    'currencyController'
  ];

  controllers.forEach(controller => {
    try {
      require(`../controllers/${controller}`);
      log.success(`${controller}.js cargado`);
    } catch (error) {
      log.error(`Error cargando ${controller}: ${error.message}`);
      allGood = false;
    }
  });

  // 6. Verificar datos de ejemplo
  log.info('\nVerificando datos de ejemplo...');
  try {
    const { User } = require('../models/postgres');
    const userCount = await User.count();
    
    if (userCount > 0) {
      log.success(`${userCount} usuarios en la base de datos`);
    } else {
      log.warning('No hay usuarios. Ejecuta: npm run seed');
    }
  } catch (error) {
    log.warning('No se pudo verificar usuarios (normal si las tablas no existen aún)');
  }

  // 7. Verificar JWT Secret
  log.info('\nVerificando seguridad...');
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    log.success('JWT_SECRET tiene longitud adecuada');
  } else {
    log.error('JWT_SECRET muy corto o no configurado (mínimo 32 caracteres)');
    allGood = false;
  }

  // Resultado final
  console.log('\n' + '='.repeat(60));
  if (allGood) {
    log.success('✅ SISTEMA VERIFICADO - TODO OK!');
    console.log('\nPróximos pasos:');
    console.log('  1. npm run seed      - Crear datos de ejemplo');
    console.log('  2. npm run dev       - Iniciar servidor');
    console.log('  3. Abrir http://localhost:5000/health');
  } else {
    log.error('❌ HAY PROBLEMAS - Revisa los errores arriba');
    console.log('\nSoluciones:');
    console.log('  1. Verifica .env está configurado correctamente');
    console.log('  2. Asegúrate que PostgreSQL y MongoDB están corriendo');
    console.log('  3. Revisa la documentación en README.md');
  }
  console.log('='.repeat(60) + '\n');

  await sequelize.close();
  await mongoose.connection.close();
  process.exit(allGood ? 0 : 1);
};

verify().catch(error => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
