# GESTOCK_CLIENTE — Sistema de Gestión de Inventario

Aplicación full-stack de control de inventario, recepción de mercancías, mantenimiento, incidencias, reportes y auditoría, con autenticación JWT y un sistema de **roles y permisos (RBAC)**.

- **Frontend**: Angular 22 (standalone, TypeScript) — *GESTOCK_CLIENTE/frontend_gestock*
- **Backend**: Node.js + Express 5 + PostgreSQL — *GESTOCK_CLIENTE/backend*
- **Base de datos**: PostgreSQL (esquema + seed en *backend/sql* y en *database/gestock.sql*)

---

## 1. Requisitos

| Herramienta | Versión recomendada |
|---|---|
| Node.js | >= 20 (probado con v24) |
| npm | >= 10 |
| PostgreSQL | >= 14 (servicio corriendo en `localhost:5432`) |
| Angular CLI | 22 (se instala en el paso de dependencias) |

> El frontend consume la API en `http://localhost:3000/api`. Puedes ajustarlo en
> `frontend_gestock/src/environments/environment.ts`.

---

## 2. Estructura del proyecto

```
GESTOCK_CLIENTE/
├── backend/                 # API REST (Express 5 + PostgreSQL)
│   ├── src/
│   │   ├── app.ts / server.ts
│   │   ├── config/          # env + pool pg
│   │   ├── controllers/
│   │   ├── models/          # tipos + esquemas Zod
│   │   ├── repositories/    # consultas SQL parametrizadas
│   │   ├── routes/
│   │   ├── services/        # auth, auditoría
│   │   ├── docs/            # Swagger
│   │   └── db/              # migrate.ts + seed.ts
│   ├── sql/                 # 01_create_database ... 05_seed_data
│   ├── prisma/              # alternativa/documentación del esquema
│   └── tests/               # unit + integración (vitest)
├── frontend_gestock/        # Angular 22
├── database/gestock.sql     # Script único con todo el esquema + datos
└── scripts/                 # INSTALAR.ps1 e INICIAR.ps1
```

---

## 3. Instalación y puesta en marcha (Windows — PowerShell)

### Opción A — Scripts automáticos

```powershell
# 1) Instala dependencias, crea la base de datos Gestock_db, aplica el esquema y el seed
.\scripts\INSTALAR.ps1

# 2) Levanta backend (puerto 3000) y frontend (puerto 4200)
.\scripts\INICIAR.ps1
```

### Opción B — Manual

```powershell
# --- Backend ---
cd backend
npm install
Copy-Item .env.example .env   # ajusta DATABASE_URL si tu usuario/clave difieren
npm run db:setup              # crea la BD, tablas y datos semilla
npm run dev                   # API en http://localhost:3000

# --- Frontend ---
cd ..\frontend_gestock
npm install
npm start                     # app en http://localhost:4200 (o usa `ng serve --host 0.0.0.0`)
```

> Si tu usuario de PostgreSQL no es `postgres` con contraseña `postgres`, edita el
> archivo `.env` del backend. La base de datos se llama `Gestock_db` y se crea sola.

---

## 4. Credenciales de prueba (seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@gestock.com` | `Admin2026!` |
| Supervisor | `supervisor@gestock.com` | `Supervisor2026!` |
| Operario | `operario@gestock.com` | `Operario2026!` |
| Técnico de Mantenimiento | `tecnico@gestock.com` | `Tecnico2026!` |
| Auditor | `auditor@gestock.com` | `Auditor2026!` |

Los permisos de cada rol responden a la matriz definida en `backend/sql/05_seed_data.sql`
(por ejemplo, el Operario solo lee inventario/productos y registra recepciones/incidencias;
el Auditor es de solo lectura; solo el Administrador puede gestionar usuarios, roles, empresas
y configuración).

---

## 5. API REST

Base URL: `http://localhost:3000/api` · Documentación interactiva: `http://localhost:3000/api/docs` (Swagger)

**Formato de respuesta:**

```json
{ "success": true, "message": "OK", "code": "SUCCESS", "data": { } }
```

**Autenticación:** `POST /api/auth/login` devuelve `{ token, usuario: { id, email, rol, rolId, empresaId, permisos[] } }`.
Todas las rutas protegidas requieren el header `Authorization: Bearer <token>`.

**Módulos** (todos montados bajo `/api`):

- `auth`: login, perfil, logout, cambio de contraseña
- `usuarios`: CRUD, cambiar estado, cambiar rol
- `roles`: CRUD, listar básicos, asignar permisos
- `permisos`: catálogo
- `empresas`, `categorias`, `bodegas`, `productos` (incluye `/productos/stock-bajo`)
- `movimientos`: entradas/salidas/ajustes de inventario
- `recepciones`: recepción de mercancías
- `auditorias`: trazabilidad
- `incidencias`, `mantenimientos`
- `sesiones` (incluye `/cerrar-otras`), `notificaciones` (incluye `/leidas`)
- `configuracion`, `dashboard` (`/resumen`), `reportes` (`/inventario`, `/movimientos`, `/stock`, `/auditorias`, `/incidencias`)

---

## 6. Base de datos

- **Esquema**: `backend/sql/02_create_tables.sql` (tablas: usuarios, roles, rol_permiso, permisos, empresas, categorias, bodegas, productos, movimientos_inventario, recepciones, recepcion_detalle, incidencias, mantenimientos, sesiones, notificaciones, auditorias, configuracion_sistema).
- **Seed**: `backend/sql/05_seed_data.sql` (5 roles, 53 permisos, 5 usuarios, empresa demo, categorías, bodegas, 7 productos, movimientos iniciales y configuración).
- **Script único**: `database/gestock.sql`.
- **Alternativa ORM**: `backend/prisma/` (schema.prisma + seed.ts) como documentación/opción de migración.

Los archivos SQL se re-aplican de forma idempotente (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).

---

## 7. Pruebas

```powershell
# Backend (requiere PostgreSQL con el seed aplicado): 27 tests
cd backend
npm run db:setup   # si es necesario
npm test

# Frontend: 61 tests
cd ..\frontend_gestock
npx ng test --watch=false
```

---

## 8. Entregable

La carpeta `GESTOCK_FINAL` contiene el proyecto listo para copiar/instalar
(sin `node_modules`, `.git`, `dist` ni `.angular`). Dentro encontrarás este README,
`backend`, `frontend_gestock`, `database` y `scripts`.