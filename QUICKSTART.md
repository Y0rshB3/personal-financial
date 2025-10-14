# 🚀 Guía de Inicio Rápido

## Opción 1: Docker (Más Rápido)

### Requisitos
- Docker
- Docker Compose

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd personal-financial
```

2. **Configurar variables de entorno**
```bash
cd backend
cp .env.example .env
# Editar .env si es necesario
cd ..
```

3. **Iniciar todo con Docker**
```bash
docker-compose up -d
```

4. **Acceder**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

5. **Crear datos de ejemplo (opcional)**
```bash
docker exec -it personal-finance-backend npm run seed
```

### Credenciales de prueba
```
Usuario Demo: demo@finanzapp.com / demo123
Admin:        admin@finanzapp.com / admin123
```

---

## Opción 2: Local

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- MongoDB 7+

### Pasos

#### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de DB

# Iniciar servidor
npm run dev
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

#### 3. Seed de datos (opcional)

```bash
cd backend
npm run seed
```

---

## Verificación

### Verificar servicios con Docker

```bash
# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Verificar PostgreSQL
docker exec -it personal-finance-postgres psql -U postgres -d personal_finance -c "\dt"

# Verificar MongoDB
docker exec -it personal-finance-mongodb mongosh personal_finance_logs --eval "show collections"
```

### Endpoints de prueba

```bash
# Health check
curl http://localhost:5000/health

# Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@finanzapp.com",
    "password": "demo123"
  }'
```

---

## Comandos Útiles

### Docker

```bash
# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs de un servicio específico
docker-compose logs -f backend

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
```

### Base de Datos

```bash
# Backup PostgreSQL
docker exec personal-finance-postgres pg_dump -U postgres personal_finance > backup.sql

# Restaurar PostgreSQL
docker exec -i personal-finance-postgres psql -U postgres personal_finance < backup.sql

# Backup MongoDB
docker exec personal-finance-mongodb mongodump --db personal_finance_logs --out /backup

# Conectar a PostgreSQL
docker exec -it personal-finance-postgres psql -U postgres -d personal_finance

# Conectar a MongoDB
docker exec -it personal-finance-mongodb mongosh personal_finance_logs
```

### Desarrollo

```bash
# Backend - watch mode
cd backend && npm run dev

# Frontend - watch mode
cd frontend && npm run dev

# Ejecutar tests
cd backend && npm test

# Regenerar datos de ejemplo
cd backend && npm run seed
```

---

## Problemas Comunes

### Puerto ya en uso

```bash
# Cambiar puertos en docker-compose.yml
# o detener el proceso que está usando el puerto
lsof -ti:5000 | xargs kill -9
```

### Base de datos no conecta

```bash
# Verificar que los contenedores estén corriendo
docker-compose ps

# Verificar logs
docker-compose logs postgres
docker-compose logs mongodb

# Reiniciar servicios
docker-compose restart
```

### Error de permisos

```bash
# Linux/Mac: dar permisos a carpeta uploads
chmod -R 755 backend/uploads
```

---

## Próximos Pasos

1. **Explorar la aplicación**: Navega por el dashboard, crea transacciones y categorías
2. **Revisar documentación**: Lee [ARCHITECTURE.md](ARCHITECTURE.md) para entender la arquitectura
3. **Personalizar**: Modifica colores, categorías y preferencias
4. **Contribuir**: Lee [CONTRIBUTING.md](CONTRIBUTING.md) para contribuir al proyecto

---

## Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de tener las versiones correctas de Node, PostgreSQL y MongoDB
4. Abre un issue en GitHub con los detalles del error

¡Feliz coding! 🎉
