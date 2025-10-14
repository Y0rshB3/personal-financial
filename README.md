# 💰 Sistema de Finanzas Personales

> **Proyecto de Vide Coding** - Sistema completo de gestión de finanzas personales con funcionalidades avanzadas

## 📋 Descripción

Sistema de finanzas personales desarrollado desde cero con las siguientes características:

- ✅ **Autenticación y Seguridad**: JWT, roles y permisos (user, admin, moderator)
- 📊 **Visualización de Datos**: Gráficas interactivas con Chart.js
- 📧 **Integración de Correos**: Envío de reportes financieros por email
- 📑 **Exportación a Excel**: Descarga de transacciones en formato Excel
- 💱 **Conversión Multimoneda**: API de tipos de cambio en tiempo real
- 📄 **Lectura de PDFs**: Extracción automática de transacciones desde PDFs bancarios
- 💡 **Recomendaciones de Ahorro**: Sugerencias basadas en patrones de gasto
- 🔒 **Logging y Seguridad**: Morgan para registro de actividades, Helmet para headers seguros
- 🎨 **UI Moderna**: React con Tailwind CSS y Lucide Icons

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express** - Framework del servidor
- **PostgreSQL** - Base de datos relacional principal (Users, Transactions, Categories)
- **MongoDB** - Base de datos NoSQL secundaria (Logs, Files, Queue)
- **Sequelize** - ORM para PostgreSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **Bcrypt** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **ExcelJS** - Generación de archivos Excel
- **pdf-parse** - Extracción de datos de PDFs
- **Morgan** - Logger HTTP
- **Helmet** - Seguridad HTTP headers

### Arquitectura Híbrida
El sistema utiliza **dos bases de datos** para optimizar rendimiento y escalabilidad:
- **PostgreSQL**: Datos críticos y transaccionales (requieren ACID)
- **MongoDB**: Logs, archivos procesados y datos no estructurados

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para más detalles.

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Chart.js** + **react-chartjs-2** - Gráficas
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación de contenedores
- **Nginx** - Servidor web para frontend

## 📁 Estructura del Proyecto

```
personal-financial/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── currencyController.js
│   │   │   ├── pdfController.js
│   │   │   ├── reportController.js
│   │   │   ├── transactionController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Category.js
│   │   │   ├── Transaction.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── categories.js
│   │   │   ├── currencies.js
│   │   │   ├── pdfs.js
│   │   │   ├── reports.js
│   │   │   ├── transactions.js
│   │   │   └── users.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Categories.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Transactions.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
├── .dockerignore
└── README.md
```

## 🚀 Instalación y Configuración

### Opción 1: Con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/personal-financial.git
cd personal-financial
```

2. **Configurar variables de entorno**
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Iniciar con Docker Compose**
```bash
cd ..
docker-compose up -d
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017

### Opción 2: Instalación Local

#### Backend

1. **Instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

3. **Iniciar bases de datos** (deben estar instaladas)
```bash
# PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# MongoDB
mongod
```

4. **Iniciar servidor**
```bash
npm run dev  # Desarrollo
npm start    # Producción
```

#### Frontend

1. **Instalar dependencias**
```bash
cd frontend
npm install
```

2. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

3. **Build para producción**
```bash
npm run build
```

## ⚙️ Configuración de Variables de Entorno

Crear archivo `.env` en el directorio `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Hybrid Architecture
# PostgreSQL (Primary): Users, Transactions, Categories
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personal_finance

# MongoDB (Secondary): Logs, Files, Queue, Preferences
MONGODB_URI=mongodb://localhost:27017/personal_finance_logs

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRE=7d

# Email (Gmail ejemplo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion

# Currency API
CURRENCY_API_URL=https://api.exchangerate-api.com/v4/latest/

# Frontend
FRONTEND_URL=http://localhost:3000

# Upload
MAX_FILE_SIZE=5242880
```

### Configuración de Email (Gmail)

1. Habilitar verificación en 2 pasos en tu cuenta de Gmail
2. Generar contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Usar esa contraseña en `EMAIL_PASSWORD`

## 📚 API Endpoints

### Autenticación
```
POST   /api/auth/register     - Registrar usuario
POST   /api/auth/login        - Iniciar sesión
GET    /api/auth/me           - Obtener usuario actual
PUT    /api/auth/profile      - Actualizar perfil
```

### Transacciones
```
GET    /api/transactions      - Listar transacciones
GET    /api/transactions/:id  - Obtener transacción
POST   /api/transactions      - Crear transacción
PUT    /api/transactions/:id  - Actualizar transacción
DELETE /api/transactions/:id  - Eliminar transacción
GET    /api/transactions/stats - Estadísticas
```

### Categorías
```
GET    /api/categories        - Listar categorías
POST   /api/categories        - Crear categoría
PUT    /api/categories/:id    - Actualizar categoría
DELETE /api/categories/:id    - Eliminar categoría
```

### Reportes
```
GET    /api/reports/export/excel           - Exportar a Excel
POST   /api/reports/email                  - Enviar por email
GET    /api/reports/savings-recommendations - Recomendaciones
GET    /api/reports/monthly/:year/:month   - Reporte mensual
```

### Monedas
```
GET    /api/currencies/rates/:base  - Obtener tasas de cambio
POST   /api/currencies/convert      - Convertir moneda
```

### PDFs
```
POST   /api/pdfs/upload      - Subir PDF
POST   /api/pdfs/process/:id - Procesar PDF
```

### Usuarios (Solo Admin)
```
GET    /api/users            - Listar usuarios
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario
```

## 🔐 Roles y Permisos

El sistema de autenticación y permisos se maneja en **PostgreSQL** con las siguientes características:

- **user**: Usuario estándar con acceso a sus propias transacciones
- **moderator**: Puede ver datos de otros usuarios (futuro)
- **admin**: Acceso completo al sistema, gestión de usuarios

### Ventajas de PostgreSQL para Auth:
- Integridad referencial con foreign keys
- Transacciones ACID para operaciones críticas
- Relaciones complejas entre usuarios, roles y permisos
- Mejor para auditoría y compliance

### MongoDB para Logs:
- Alto rendimiento en escritura
- TTL indexes para auto-limpieza
- Esquema flexible para diferentes tipos de eventos

## 🎯 Características Principales

### 1. Dashboard Interactivo
- Resumen de balance, ingresos y gastos
- Gráficas de distribución
- Transacciones recientes

### 2. Gestión de Transacciones
- CRUD completo de transacciones
- Filtrado por fecha, tipo y categoría
- Soporte para múltiples monedas
- Importación manual o automática (PDF)

### 3. Categorías Personalizables
- Crear categorías con iconos y colores
- Establecer presupuestos mensuales
- Separación entre ingresos y gastos

### 4. Reportes Avanzados
- Exportación a Excel
- Envío de reportes por email
- Recomendaciones de ahorro inteligentes
- Análisis de patrones de gasto

### 5. Seguridad
- Autenticación JWT
- Contraseñas encriptadas con bcrypt
- Middleware de autorización por roles
- Logging de actividades con Morgan
- Headers seguros con Helmet

## 🐳 Docker

### Comandos útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar servicios
docker-compose restart
```

## 🧪 Testing

```bash
cd backend
npm test
```

## 📝 Notas de Desarrollo

### Próximas Características
- [ ] Autenticación con Google/Facebook
- [ ] Recordatorios de pagos recurrentes
- [ ] Objetivos de ahorro
- [ ] Sincronización con bancos (Open Banking)
- [ ] App móvil con React Native
- [ ] Soporte para múltiples usuarios en una cuenta

### Optimizaciones Futuras
- [ ] Caché con Redis
- [ ] Rate limiting más robusto
- [ ] Paginación en listados
- [ ] Búsqueda full-text
- [ ] Backup automático de base de datos

## 🤝 Contribuciones

Este es un proyecto educativo de vide coding. Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👨‍💻 Autor

Proyecto desarrollado como demostración de vide coding para aprendizaje de desarrollo full-stack.

## 🙏 Agradecimientos

- Comunidad de desarrolladores
- Documentación de las tecnologías utilizadas
- Recursos de aprendizaje de código abierto

---

⭐ Si te ha gustado este proyecto, dale una estrella en GitHub!

## 📞 Soporte

Para problemas o preguntas, abre un issue en GitHub.
