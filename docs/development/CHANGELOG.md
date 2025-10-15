# Changelog

Todos los cambios importantes del proyecto documentados aquí.

---

## [1.0.0] - 2024-10-14

### 🎉 Initial Release - Sistema Completo

### ✨ Added

#### Arquitectura Híbrida
- **PostgreSQL** como base de datos principal para datos críticos
  - Modelos: User, Transaction, Category
  - Sequelize ORM con relaciones definidas
  - Migraciones y seeds
- **MongoDB** como base de datos secundaria para datos flexibles
  - Modelos: ActivityLog, ProcessedFile, EmailQueue, UserPreferences
  - TTL indexes para auto-limpieza de logs
  - Mongoose ODM

#### Backend
- API REST completa con Node.js + Express
- Autenticación JWT con roles (user, admin, moderator)
- Middleware de autorización y error handling
- Controllers actualizados para arquitectura híbrida:
  - `authController.js` - Register, login, profile
  - `transactionController.js` - CRUD de transacciones
  - `categoryController.js` - CRUD de categorías
  - `reportController.js` - Excel export, email, recomendaciones
  - `userController.js` - Admin user management
  - `pdfController.js` - PDF upload y procesamiento
  - `currencyController.js` - Conversión multimoneda
- Activity logging automático en MongoDB para todas las acciones
- Email queue system en MongoDB
- Security: Helmet, CORS, rate limiting, bcrypt
- File upload con Multer
- Integrations:
  - Nodemailer para emails
  - ExcelJS para reportes
  - pdf-parse para extraer datos de PDFs
  - Axios para API de monedas

#### Frontend
- React 18 con Vite
- UI moderna con Tailwind CSS
- Iconos con Lucide React
- Gráficas con Chart.js
- Context API para estado global
- React Router para navegación
- Páginas implementadas:
  - Login y Register
  - Dashboard con stats y gráficas
  - Transactions (CRUD completo)
  - Categories (CRUD con personalización)
  - Reports (Excel export, email, recomendaciones)
  - Settings (perfil, upload PDF, conversión)
- Toast notifications con react-hot-toast
- Responsive design

#### DevOps
- Docker Compose con 3 servicios:
  - PostgreSQL 16 con healthcheck
  - MongoDB 7 con healthcheck
  - Backend + Frontend
- Dockerfiles optimizados
- Nginx configurado para frontend
- Volúmenes persistentes para datos
- Network privada entre servicios

#### Scripts
- `seed.js` - Datos de ejemplo (usuarios, categorías, transacciones)
- npm scripts:
  - `npm start` - Producción
  - `npm run dev` - Desarrollo con nodemon
  - `npm run seed` - Poblar base de datos
  - `npm test` - Tests (preparado)

#### Documentación
- **README.md** - Documentación completa (393 líneas)
- **ARCHITECTURE.md** - Explicación arquitectura híbrida
- **QUICKSTART.md** - Inicio rápido detallado
- **DEPLOY.md** - Guía de despliegue completa
- **START_HERE.md** - Quick start 5 minutos
- **PROJECT_SUMMARY.md** - Resumen ejecutivo
- **CONTRIBUTING.md** - Guía de contribución
- **TODO.md** - Mejoras futuras
- **CHANGELOG.md** - Este archivo
- **LICENSE** - MIT License

### 🔒 Security

- JWT tokens para autenticación
- Passwords hasheados con bcrypt (salt rounds: 10)
- Helmet para security headers
- CORS configurado
- Rate limiting en API
- Validación de datos
- Role-based access control (RBAC)
- Activity logging para auditoría

### 🎯 Features

- ✅ Autenticación y registro de usuarios
- ✅ Gestión de transacciones (ingresos/gastos)
- ✅ Categorías personalizables (iconos, colores, presupuestos)
- ✅ Dashboard interactivo con gráficas
- ✅ Exportación a Excel
- ✅ Envío de reportes por email
- ✅ Recomendaciones de ahorro inteligentes
- ✅ Upload y procesamiento de PDFs bancarios
- ✅ Conversión multimoneda en tiempo real
- ✅ Logs de actividad automáticos
- ✅ Cola de emails asíncrona
- ✅ Soporte para múltiples monedas
- ✅ Filtrado y búsqueda de transacciones
- ✅ Estadísticas y reportes mensuales

### 📦 Dependencies

#### Backend
- express: ^4.18.2
- sequelize: ^6.35.0
- mongoose: ^7.5.0
- pg: ^8.11.3
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- helmet: ^7.0.0
- cors: ^2.8.5
- morgan: ^1.10.0
- nodemailer: ^6.9.5
- exceljs: ^4.3.0
- pdf-parse: ^1.1.1
- axios: ^1.5.0

#### Frontend
- react: ^18.2.0
- react-router-dom: ^6.16.0
- axios: ^1.5.0
- chart.js: ^4.4.0
- react-chartjs-2: ^5.2.0
- lucide-react: ^0.284.0
- react-hot-toast: ^2.4.1
- tailwindcss: ^3.3.3

### 🚀 Performance

- Índices de base de datos optimizados
- Queries eficientes con Sequelize
- TTL automático en MongoDB para logs
- Lazy loading en frontend
- Code splitting preparado

### 🐛 Bug Fixes

- N/A (Primera versión)

### 🗑️ Removed

- Modelos antiguos de MongoDB solo (User, Transaction, Category)
- Movidos a `backup_mongodb/` por compatibilidad

---

## Formato del Changelog

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de cambios

- **Added** - Para funcionalidades nuevas
- **Changed** - Para cambios en funcionalidades existentes
- **Deprecated** - Para funcionalidades que serán removidas
- **Removed** - Para funcionalidades removidas
- **Fixed** - Para corrección de bugs
- **Security** - Para vulnerabilidades de seguridad

---

## [Unreleased]

### Planeado para próximas versiones

- Tests unitarios y de integración
- Internacionalización (i18n)
- Dark mode
- PWA support
- Mobile app (React Native)
- Objetivos de ahorro
- Transacciones recurrentes
- OAuth providers (Google, Facebook)
- 2FA (Two-factor authentication)

Ver [TODO.md](TODO.md) para lista completa de mejoras futuras.
