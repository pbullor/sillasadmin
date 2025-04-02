# Sistema de Gestión de Alquiler de Sillas de Ruedas Eléctricas

## Descripción

Esta aplicación es un sistema completo para gestionar el alquiler de sillas de ruedas eléctricas. Permite administrar un inventario de sillas de ruedas, clientes y reservas. Reemplaza el sistema anterior basado en Google Calendar con una solución más eficiente y específica.

## Características

- **Panel de Control**: Estadísticas generales y verificación de disponibilidad
- **Gestión de Inventario**: Registro completo de sillas de ruedas con sus características técnicas
- **Gestión de Clientes**: Base de datos de clientes con información de contacto
- **Sistema de Reservas**: Vistas de tabla y calendario para gestionar reservas
- **Filtrado por Fechas**: Búsqueda de disponibilidad en rangos de fechas específicos
- **Interfaz Responsiva**: Diseño adaptado a dispositivos móviles y de escritorio

## Tecnologías Utilizadas

- **Frontend**: React con TypeScript, Tailwind CSS y shadcn/ui
- **Backend**: Express.js
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Estado**: TanStack Query (React Query)
- **Validación de Datos**: Zod
- **Formularios**: React Hook Form

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/pbullor/sillasadmin.git

# Instalar dependencias
cd sillasadmin
npm install

# Iniciar la aplicación en modo desarrollo
npm run dev
```

## Estructura del Proyecto

- `/client`: Aplicación React del frontend
- `/server`: API Express del backend
- `/shared`: Esquemas y tipos compartidos entre frontend y backend
- `/drizzle`: Configuración y migraciones de la base de datos

## Licencia

Este proyecto está bajo la Licencia MIT.