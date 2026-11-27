# Psicometria 369 — MVP de evaluación psicométrica

Plataforma web empresarial para administrar personas, asignar evaluaciones, aplicar cuestionarios y consultar resultados como apoyo a la revisión humana.

## Alcance del MVP

Incluye registro de personas, catálogo de cuatro evaluaciones (razonamiento verbal, razonamiento numérico, Big Five adaptado y competencias laborales), asignaciones, consentimiento y aviso de privacidad, aplicación con temporizador y guardado de respuestas, resultados individuales y dashboard grupal. Los instrumentos son prototipos de MVP: no son pruebas clínicas ni están estandarizados para decisiones automatizadas de contratación.

## Arquitectura actual

- Cliente: React, TypeScript, Vite y Tailwind CSS.
- Servidor: Node.js, Express y tRPC.
- Base de datos: MySQL/TiDB mediante Drizzle ORM.
- Autenticación: Manus OAuth.
- Integraciones opcionales de almacenamiento, mapas, generación multimedia y APIs: Manus Forge.

Este repositorio contiene el código fuente; no incluye usuarios, expedientes, respuestas ni datos de producción. No subas nunca `.env`, credenciales, datos de candidatos ni resultados psicométricos.

## Desarrollo local

Requiere Node.js 22 LTS, Corepack y acceso a una instancia MySQL/TiDB. Desde la raíz:

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
# Configura las variables requeridas localmente; consulta docs/deployment-github.md.
pnpm check
pnpm test
pnpm build
pnpm dev
```

`pnpm dev` inicia el servidor integrado en el puerto 3000. Para iniciar el build de producción se usa `pnpm start` y se respeta `PORT`.

## Base de datos

El esquema vive en `drizzle/schema.ts` y las migraciones SQL versionadas en `drizzle/`. Revisa cada migración antes de aplicarla a cualquier base compartida o productiva. La carga del catálogo MVP se realiza desde la biblioteca de Instrumentos después de iniciar sesión como administrador.

## Despliegue

Consulta [`docs/deployment-github.md`](docs/deployment-github.md) antes de conectar el repositorio a un proveedor. GitHub almacena el código, pero no aloja por sí solo el servidor. Esta aplicación es un servidor Express persistente con base MySQL/TiDB y callbacks OAuth; un despliegue directo como SPA en Vercel no basta y requiere adaptar o provisionar el servidor y configurar correctamente OAuth, dominio, cookies y secretos.

## Variables de entorno

Las variables requeridas y su propósito están documentados en [`docs/deployment-github.md`](docs/deployment-github.md). `VITE_*` se incorpora al bundle del navegador y no debe contener secretos. El servidor necesita `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID` y las variables del proveedor OAuth. Las integraciones Manus requieren credenciales habilitadas para el nuevo entorno; las claves internas del sandbox no se deben copiar.

## Validación

```bash
pnpm test
pnpm check
pnpm build
```

La suite automatizada valida flujo de evaluación, scoring, permisos, consentimiento y preservación del rol administrativo.
