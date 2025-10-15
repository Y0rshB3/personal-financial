# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Finanzas Personales!

## Cómo Contribuir

1. **Fork el Repositorio**
   - Haz fork del proyecto en GitHub

2. **Clona tu Fork**
   ```bash
   git clone https://github.com/tu-usuario/personal-financial.git
   cd personal-financial
   ```

3. **Crea una Rama**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

4. **Haz tus Cambios**
   - Escribe código limpio y bien documentado
   - Sigue las convenciones de código del proyecto
   - Añade tests si es necesario

5. **Commit tus Cambios**
   ```bash
   git add .
   git commit -m "feat: descripción clara del cambio"
   ```

6. **Push a tu Fork**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

7. **Crea un Pull Request**
   - Ve a GitHub y crea un Pull Request
   - Describe claramente los cambios realizados

## Convenciones de Commits

Usamos commits semánticos:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma, etc
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Tareas de mantenimiento

## Estilo de Código

- **JavaScript/React**: ESLint y Prettier
- **Indentación**: 2 espacios
- **Nombres de variables**: camelCase
- **Nombres de componentes**: PascalCase
- **Nombres de archivos**: kebab-case o PascalCase para componentes

## Testing

Asegúrate de que todos los tests pasen antes de enviar tu PR:

```bash
cd backend
npm test
```

## Reportar Bugs

Para reportar bugs, abre un issue con:

- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si aplica
- Entorno (OS, versión de Node, etc)

## Solicitar Funcionalidades

Para solicitar nuevas funcionalidades:

- Describe claramente la funcionalidad
- Explica el caso de uso
- Proporciona ejemplos si es posible

## Código de Conducta

- Sé respetuoso con todos los colaboradores
- Acepta críticas constructivas
- Enfócate en lo que es mejor para el proyecto

¡Gracias por contribuir! 🎉
