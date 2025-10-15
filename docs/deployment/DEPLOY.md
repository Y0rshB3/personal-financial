# 🚀 Guía de Despliegue

## Preparar para GitHub

### 1. Inicializar Git (si no está inicializado)

```bash
cd /home/y0rshb3/Desktop/personal-financial
git add .
git commit -m "feat: initial commit - sistema de finanzas personales con arquitectura híbrida"
```

### 2. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un repositorio llamado `personal-financial`
3. **NO** inicialices con README (ya tenemos uno)

### 3. Conectar y subir

```bash
git remote add origin https://github.com/TU-USUARIO/personal-financial.git
git branch -M main
git push -u origin main
```

---

## Despliegue en Producción

### Opción 1: VPS con Docker (Recomendado)

#### Requisitos
- VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Ubuntu 22.04+
- Dominio (opcional)

#### Pasos

**1. Conectar al servidor**
```bash
ssh root@tu-servidor.com
```

**2. Instalar Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin
```

**3. Clonar repositorio**
```bash
git clone https://github.com/TU-USUARIO/personal-financial.git
cd personal-financial
```

**4. Configurar variables de entorno**
```bash
cd backend
cp .env.example .env
nano .env  # Editar con valores de producción
```

**Variables críticas para producción:**
```env
NODE_ENV=production
JWT_SECRET=clave_super_segura_generada_aleatoriamente
DATABASE_URL=postgresql://postgres:PASSWORD_SEGURA@postgres:5432/personal_finance
MONGODB_URI=mongodb://mongodb:27017/personal_finance_logs

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password

# Frontend
FRONTEND_URL=https://tu-dominio.com
```

**5. Iniciar servicios**
```bash
cd ..
docker-compose up -d
```

**6. Configurar Nginx (opcional - para dominio)**

Instalar Nginx:
```bash
apt install nginx certbot python3-certbot-nginx
```

Crear configuración:
```bash
nano /etc/nginx/sites-available/finanzapp
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

Activar:
```bash
ln -s /etc/nginx/sites-available/finanzapp /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**7. SSL con Let's Encrypt**
```bash
certbot --nginx -d tu-dominio.com
```

---

### Opción 2: Railway / Render

#### Railway

1. Conecta tu repo de GitHub a Railway
2. Crea dos servicios:
   - **Backend**: Node.js
   - **Database**: PostgreSQL + MongoDB plugin
3. Configura variables de entorno en el dashboard
4. Deploy automático en cada push

#### Render

1. Conecta GitHub a Render
2. Crea servicios:
   - Web Service (Backend)
   - Static Site (Frontend)
   - PostgreSQL Database
   - Redis (para MongoDB puedes usar MongoDB Atlas)
3. Configura variables de entorno
4. Deploy

---

### Opción 3: Vercel + Supabase + MongoDB Atlas

**Frontend en Vercel:**
```bash
cd frontend
vercel
```

**Backend:**
- Usar Vercel Serverless o Railway
- Base de datos: Supabase (PostgreSQL) + MongoDB Atlas

---

## Configuración de Bases de Datos en la Nube

### PostgreSQL (Supabase)

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. Copiar `DATABASE_URL` desde settings
4. Actualizar `.env`:
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

### MongoDB (MongoDB Atlas)

1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Whitelist IP (0.0.0.0/0 para acceso desde cualquier lugar)
4. Crear usuario de base de datos
5. Copiar connection string:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/personal_finance_logs
```

---

## Backups Automáticos

### Script de Backup

Crear `scripts/backup.sh`:
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# PostgreSQL
docker exec personal-finance-postgres pg_dump -U postgres personal_finance > $BACKUP_DIR/postgres_$DATE.sql

# MongoDB
docker exec personal-finance-mongodb mongodump --db personal_finance_logs --out $BACKUP_DIR/mongo_$DATE

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE*

# Limpiar archivos temporales
rm -rf $BACKUP_DIR/postgres_$DATE.sql $BACKUP_DIR/mongo_$DATE

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completado: backup_$DATE.tar.gz"
```

### Cron Job (backup diario a las 2 AM)
```bash
crontab -e

# Agregar:
0 2 * * * /ruta/a/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## Monitoreo

### PM2 (para Node.js sin Docker)

```bash
npm install -g pm2

# Iniciar
pm2 start src/server.js --name "finanzapp-backend"

# Ver logs
pm2 logs

# Restart automático en reboot
pm2 startup
pm2 save
```

### Docker Healthchecks

Ya configurados en `docker-compose.yml`:
```bash
# Ver estado de salud
docker ps

# Ver detalles
docker inspect --format='{{json .State.Health}}' personal-finance-backend
```

---

## Seguridad en Producción

### Checklist

- [ ] Cambiar contraseñas de bases de datos
- [ ] Usar `JWT_SECRET` fuerte y único
- [ ] Activar SSL/TLS (HTTPS)
- [ ] Configurar CORS correctamente
- [ ] Rate limiting activado
- [ ] Helmet configurado
- [ ] Variables de entorno seguras (no en repo)
- [ ] Logs configurados
- [ ] Backups automáticos
- [ ] Firewall configurado (solo puertos 80, 443, 22)
- [ ] Fail2ban instalado (protección contra fuerza bruta)

### Firewall (UFW)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

---

## Actualizar en Producción

### Con Docker

```bash
# En el servidor
cd personal-financial
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Zero Downtime (con load balancer)

1. Tener dos instancias detrás de un load balancer
2. Actualizar una a la vez
3. Verificar salud antes de actualizar la siguiente

---

## Troubleshooting en Producción

### Ver logs
```bash
docker-compose logs -f --tail=100
```

### Entrar a contenedor
```bash
docker exec -it personal-finance-backend sh
```

### Ver uso de recursos
```bash
docker stats
```

### Reiniciar servicio específico
```bash
docker-compose restart backend
```

---

## Costos Estimados

### Opción Gratuita
- **Frontend**: Vercel (Gratis)
- **Backend**: Railway ($5/mes con $5 gratis inicial)
- **PostgreSQL**: Supabase (Gratis hasta 500MB)
- **MongoDB**: Atlas (Gratis hasta 512MB)
- **Total**: $0-5/mes

### Opción Económica
- **VPS**: DigitalOcean Droplet ($6/mes)
- **Dominio**: Namecheap ($10/año)
- **Total**: ~$7/mes

### Opción Profesional
- **VPS**: DigitalOcean/AWS ($20-50/mes)
- **DB Managed**: Supabase Pro + Atlas M10 ($25/mes)
- **CDN**: Cloudflare (Gratis)
- **Monitoreo**: DataDog/New Relic ($15/mes)
- **Total**: $60-90/mes

---

¡Tu aplicación está lista para producción! 🚀
