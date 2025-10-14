# 🚀 Empezar Aquí - Guía Rápida de 5 Minutos

## ¿Qué es este proyecto?

**Sistema de Finanzas Personales** con arquitectura híbrida:
- 💾 **PostgreSQL**: Para usuarios, transacciones y categorías (datos críticos)
- 📝 **MongoDB**: Para logs, archivos PDF y cola de emails (datos flexibles)
- ⚛️ **React**: Frontend moderno con Tailwind CSS
- 🔐 **JWT**: Autenticación segura con roles

---

## ⚡ Inicio Rápido con Docker

```bash
# 1. Clonar y entrar al proyecto
cd /home/y0rshb3/Desktop/personal-financial

# 2. Configurar variables de entorno
cd backend
cp .env.example .env
cd ..

# 3. Iniciar todo con Docker
docker-compose up -d

# 4. Esperar ~30 segundos y verificar
docker-compose ps

# 5. Crear datos de prueba
docker exec -it personal-finance-backend npm run seed

# 6. Abrir en el navegador
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### Credenciales de prueba:
```
📧 demo@finanzapp.com  
🔑 demo123

📧 admin@finanzapp.com (Admin)
🔑 admin123
```

---

## 🧪 Verificar que funciona

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
# Debería responder: {"status":"OK","message":"Server is running"}
```

### 2. Login de prueba
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finanzapp.com","password":"demo123"}'
```

### 3. Ver logs
```bash
docker-compose logs -f backend
```

### 4. Conectar a las bases de datos

**PostgreSQL:**
```bash
docker exec -it personal-finance-postgres psql -U postgres -d personal_finance
# Comandos útiles:
# \dt              - Ver tablas
# \d users         - Describir tabla users
# SELECT * FROM users;
# \q               - Salir
```

**MongoDB:**
```bash
docker exec -it personal-finance-mongodb mongosh personal_finance_logs
# Comandos útiles:
# show collections
# db.activitylogs.find().limit(5)
# exit
```

---

## 🎯 Siguiente Paso

### Navega por la aplicación:

1. **Dashboard** - Ve el resumen de ingresos y gastos
2. **Transacciones** - Crea, edita y elimina transacciones
3. **Categorías** - Personaliza categorías con iconos y colores
4. **Reportes** - Exporta a Excel o envía por email
5. **Configuración** - Sube PDFs y configura preferencias

---

## 📂 Estructura del Proyecto

```
personal-financial/
├── backend/              # Node.js + Express
│   ├── src/
│   │   ├── models/
│   │   │   ├── postgres/   ← Users, Transactions, Categories
│   │   │   └── mongodb/    ← Logs, Files, Email Queue
│   │   ├── controllers/    ← Lógica de negocio
│   │   ├── routes/         ← API endpoints
│   │   └── server.js       ← Punto de entrada
│   └── package.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── pages/        ← Dashboard, Transactions, etc.
│   │   ├── components/   ← Componentes reutilizables
│   │   └── context/      ← Estado global (Auth)
│   └── package.json
└── docker-compose.yml    ← Orquestación de servicios
```

---

## 🛠️ Desarrollo Local (Sin Docker)

### Requisitos:
- Node.js 18+
- PostgreSQL 14+
- MongoDB 7+

### Backend
```bash
cd backend
npm install
cp .env.example .env

# Editar .env con tus credenciales locales
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personal_finance
# MONGODB_URI=mongodb://localhost:27017/personal_finance_logs

npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Crear datos de prueba
```bash
cd backend
npm run seed
```

---

## 🎬 Para Video Coding

### Demostrar arquitectura híbrida:

1. **Mostrar Login** → Guardar usuario en PostgreSQL + Log en MongoDB
2. **Crear transacción** → PostgreSQL + Log de actividad en MongoDB
3. **Subir PDF** → Guardar en MongoDB, extraer datos
4. **Exportar Excel** → Leer de PostgreSQL, encolar email en MongoDB
5. **Ver logs** → Consultar MongoDB para auditoría

### Comando para ver logs en tiempo real:
```bash
docker exec -it personal-finance-mongodb mongosh personal_finance_logs --eval "db.activitylogs.find().sort({timestamp:-1}).limit(10).pretty()"
```

---

## 🐛 Solución de Problemas

### Puerto ya en uso
```bash
docker-compose down
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
docker-compose up -d
```

### Reiniciar todo desde cero
```bash
docker-compose down -v
docker-compose up -d
docker exec -it personal-finance-backend npm run seed
```

### Ver errores
```bash
docker-compose logs backend --tail=50
```

---

## 📚 Documentación Completa

- **[README.md](README.md)** - Documentación completa
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura híbrida explicada
- **[QUICKSTART.md](QUICKSTART.md)** - Guía de inicio rápido detallada
- **[DEPLOY.md](DEPLOY.md)** - Despliegue en producción

---

## ✅ Checklist

- [ ] Docker instalado y corriendo
- [ ] `docker-compose up -d` ejecutado
- [ ] Seed ejecutado: `docker exec -it personal-finance-backend npm run seed`
- [ ] Frontend accesible en http://localhost:3000
- [ ] Login exitoso con demo@finanzapp.com
- [ ] Transacción creada
- [ ] PDF subido (opcional)
- [ ] Excel exportado (opcional)

---

## 🎉 ¡Listo!

Tu sistema de finanzas está corriendo con:
- ✅ 2 bases de datos (PostgreSQL + MongoDB)
- ✅ Backend API completo
- ✅ Frontend React moderno
- ✅ Autenticación JWT
- ✅ Logs de actividad
- ✅ Exportación a Excel
- ✅ Integración de emails

**¡Ahora puedes empezar a desarrollar, grabar tu video o desplegarlo!** 🚀
