# 📖 Índice de Documentación - Personal Finance App

> 🎯 Toda la documentación está organizada en carpetas temáticas para facilitar la navegación.

---

## 📁 Estructura de Documentación

```
docs/
├── getting-started/     # 🚀 Primeros pasos
├── features/            # ✨ Características y funcionalidades
├── deployment/          # 🚢 Despliegue y producción
└── development/         # 👨‍💻 Desarrollo y arquitectura
```

---

## 🚀 Getting Started (Primeros Pasos)

**¿Primera vez? Empieza aquí:**

| Documento | Descripción | Tiempo |
|-----------|-------------|---------|
| **[START_HERE.md](docs/getting-started/START_HERE.md)** | Guía rápida de 5 minutos | ⚡ 5 min |
| **[QUICKSTART.md](docs/getting-started/QUICKSTART.md)** | Guía detallada de inicio | 📖 15 min |
| **[README.md](README.md)** | Documentación completa del proyecto | 📚 30 min |

---

## ✨ Features (Funcionalidades)

Documentación de características específicas:

| Feature | Documento | Descripción |
|---------|-----------|-------------|
| **Gastos Esperados** | [EXPECTED_EXPENSES.md](docs/features/EXPECTED_EXPENSES.md) | Sistema de gastos esperados con conversión automática |
| **Resumen Gastos Esperados** | [GASTOS_ESPERADOS_RESUMEN.md](docs/features/GASTOS_ESPERADOS_RESUMEN.md) | Guía rápida de gastos esperados |
| **Zona Horaria** | [TIMEZONE_FEATURE.md](docs/features/TIMEZONE_FEATURE.md) | Configuración multi-zona horaria |

---

## �� Deployment (Despliegue)

Guías de despliegue en producción:

| Documento | Descripción |
|-----------|-------------|
| **[DEPLOY.md](docs/deployment/DEPLOY.md)** | Guía completa de despliegue (VPS, Railway, Render, Vercel) |

**Incluye**:
- Docker en VPS
- Railway / Render / Vercel
- Supabase + MongoDB Atlas
- SSL con Let's Encrypt
- Backups automáticos
- Costos estimados

---

## 👨‍💻 Development (Desarrollo)

Documentación para desarrolladores:

| Documento | Descripción |
|-----------|-------------|
| **[ARCHITECTURE.md](docs/development/ARCHITECTURE.md)** | Arquitectura híbrida PostgreSQL + MongoDB |
| **[CONTRIBUTING.md](docs/development/CONTRIBUTING.md)** | Guía de contribución al proyecto |
| **[OPENAI_SETUP.md](docs/development/OPENAI_SETUP.md)** | Configuración de OpenAI para análisis PDF |
| **[CHANGELOG.md](docs/development/CHANGELOG.md)** | Historial de cambios y versiones |

---

## 📄 Documentos en Raíz

| Documento | Descripción |
|-----------|-------------|
| **[INDEX.md](INDEX.md)** | Este archivo - Índice principal |
| **[README.md](README.md)** | Documentación completa del proyecto |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Resumen ejecutivo con estadísticas |
| **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** | Resumen visual completo |
| **[TODO.md](TODO.md)** | Mejoras futuras y roadmap |
| **[LICENSE](LICENSE)** | Licencia MIT del proyecto |

---

## �� Guías por Rol

### 👨‍💻 Desarrollador Frontend
1. [START_HERE.md](docs/getting-started/START_HERE.md) - Setup inicial
2. [README.md](README.md) - API Endpoints
3. `frontend/src/` - Código fuente

### 👨‍💻 Desarrollador Backend
1. [ARCHITECTURE.md](docs/development/ARCHITECTURE.md) - Entender arquitectura
2. [README.md](README.md) - Stack y configuración
3. `backend/src/` - Código fuente

### �� DevOps / Deploy
1. [DEPLOY.md](docs/deployment/DEPLOY.md) - Guía de despliegue completa
2. `docker-compose.yml` - Configuración Docker
3. `.env.production.example` - Variables de producción

### 🤝 Contribuidor
1. [CONTRIBUTING.md](docs/development/CONTRIBUTING.md) - Guía de contribución
2. [TODO.md](TODO.md) - Qué se puede mejorar
3. [CHANGELOG.md](docs/development/CHANGELOG.md) - Historial

---

## 📂 Estructura Completa del Proyecto

```
personal-financial/
│
├── 📚 docs/                            ← Documentación organizada
│   ├── getting-started/                ← Primeros pasos
│   │   ├── START_HERE.md
│   │   └── QUICKSTART.md
│   ├── features/                       ← Funcionalidades
│   │   ├── EXPECTED_EXPENSES.md
│   │   ├── GASTOS_ESPERADOS_RESUMEN.md
│   │   └── TIMEZONE_FEATURE.md
│   ├── deployment/                     ← Despliegue
│   │   └── DEPLOY.md
│   └── development/                    ← Desarrollo
│       ├── ARCHITECTURE.md
│       ├── CONTRIBUTING.md
│       ├── OPENAI_SETUP.md
│       └── CHANGELOG.md
│
├── 📄 Raíz
│   ├── INDEX.md                        ← Índice principal
│   ├── README.md                       ← Documentación completa
│   ├── PROJECT_SUMMARY.md              ← Resumen ejecutivo
│   ├── FINAL_SUMMARY.md                ← Resumen visual
│   ├── TODO.md                         ← Mejoras futuras
│   └── LICENSE                         ← Licencia MIT
│
├── 🔧 backend/                         ← Node.js + Express
│   ├── src/
│   │   ├── config/                     ← Conexiones DB
│   │   ├── controllers/                ← Lógica de negocio
│   │   ├── middleware/                 ← Auth, errors
│   │   ├── models/
│   │   │   ├── postgres/               ← Sequelize models
│   │   │   └── mongodb/                ← Mongoose models
│   │   ├── routes/                     ← API routes
│   │   ├── scripts/                    ← Migraciones, seed
│   │   └── server.js                   ← Entry point
│   └── package.json
│
├── 🎨 frontend/                        ← React + Vite
│   ├── src/
│   │   ├── components/                 ← UI components
│   │   ├── context/                    ← Estado global
│   │   ├── pages/                      ← Páginas
│   │   └── App.jsx
│   └── package.json
│
└── 🐳 docker-compose.yml               ← Orquestación
```

---

## ⚡ Comandos Rápidos

### Docker
```bash
docker-compose up -d              # Iniciar todo
docker-compose logs -f            # Ver logs
docker-compose down               # Detener
docker-compose down -v            # Detener + limpiar
```

### Backend
```bash
cd backend
npm run verify                    # Verificar sistema
npm run seed                      # Datos de ejemplo
npm run dev                       # Desarrollo
npm start                         # Producción
```

### Frontend
```bash
cd frontend
npm run dev                       # Desarrollo
npm run build                     # Build producción
npm run preview                   # Preview build
```

---

## 🔍 Buscar por Tema

| Tema | Documentos |
|------|-----------|
| **Instalación** | [START_HERE.md](docs/getting-started/START_HERE.md), [QUICKSTART.md](docs/getting-started/QUICKSTART.md) |
| **Arquitectura** | [ARCHITECTURE.md](docs/development/ARCHITECTURE.md), [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| **Despliegue** | [DEPLOY.md](docs/deployment/DEPLOY.md) |
| **Desarrollo** | [CONTRIBUTING.md](docs/development/CONTRIBUTING.md), [CHANGELOG.md](docs/development/CHANGELOG.md) |
| **Features** | Ver carpeta [docs/features/](docs/features/) |
| **API** | [README.md](README.md) - Sección API Endpoints |

---

## 📊 Estadísticas

```
📁 Carpetas de docs:               4
📄 Archivos de documentación:      16+
📝 Total de líneas:                ~4,000 líneas
📚 Guías específicas:              10+
🎯 Quick starts:                   2
🏗️  Arquitectura:                  1 completo
🚀 Deploy:                         1 completo
✨ Features:                       3 documentados
```

---

## 🆘 Soporte

- 🐛 **Bugs**: GitHub Issues
- 💬 **Discusiones**: GitHub Discussions
- 📚 **Docs**: Este índice y carpeta `docs/`

---

## 🎉 Contribuciones

¡Las contribuciones son bienvenidas!

1. Lee [CONTRIBUTING.md](docs/development/CONTRIBUTING.md)
2. Revisa [TODO.md](TODO.md) para ideas
3. Crea un Pull Request

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

**Happy Coding! 🚀**

*Última actualización: Octubre 2024*
