# Desplegar Psicometria 369 desde GitHub

## Antes de empezar

El repositorio contiene la aplicación actual, construida como React/Vite + Express/tRPC con MySQL/TiDB y autenticación Manus OAuth. GitHub es el repositorio de código; para publicar la aplicación se requiere además un proveedor de ejecución y una base de datos.

No es una SPA estática. No conectes solamente la carpeta `dist/public` a un hosting estático: las rutas `/api/trpc` y `/api/oauth/callback` dependen del servidor Express. Vercel requeriría convertir ese servidor en funciones compatibles o desplegar por separado un servicio Node.js; esa adaptación no está incluida ni verificada en esta versión. El mismo principio aplica a cualquier plataforma que solo sirva archivos estáticos.

## Proveedor de ejecución

Selecciona un servicio que pueda desplegar desde GitHub, ejecutar Node.js 22 y mantener una aplicación Express escuchando en `PORT`, por ejemplo un servicio Node en Render, Railway o una plataforma equivalente. Configura:

- **Build command:** `corepack enable && corepack prepare pnpm@10.4.1 --activate && pnpm install --frozen-lockfile && pnpm build`
- **Start command:** `pnpm start`
- **Health check sugerido:** `/`
- **Base de datos:** MySQL o TiDB administrado, con TLS/red y respaldos configurados.

Prueba primero en staging con base de datos vacía y credenciales propias del staging. No apuntes una primera publicación a la base real de producción.

## Secretos y autenticación

Crea las variables del entorno de producción en el gestor de secretos del proveedor. Usa el listado de esta sección y `server/_core/env.ts` como referencia. No subas ningún archivo `.env` ni mantengas secretos en el repositorio. Variables principales:

- `DATABASE_URL`: conexión MySQL/TiDB privada.
- `JWT_SECRET`: aleatorio, largo y exclusivo para el despliegue.
- `OWNER_OPEN_ID`: identidad Manus del administrador inicial.
- `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`: configuración OAuth provista por Manus para la aplicación.
- `PORT`: normalmente lo asigna el proveedor.
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` y valores `VITE_FRONTEND_FORGE_*`: solo si se habilitan las integraciones correspondientes y se obtienen credenciales autorizadas para ese entorno.

Configura el callback OAuth exacto como `https://TU-DOMINIO/api/oauth/callback`, así como cualquier lista de dominios/redirect URI del proveedor. El navegador debe iniciar y completar la sesión en el mismo host porque las cookies de sesión no se comparten entre el dominio publicado y los hosts de preview. No coloques claves privadas, JWT, `DATABASE_URL`, datos personales o credenciales en variables `VITE_*`, logs, Issues ni archivos versionados.

Un despliegue fuera de Manus solo funcionará si Manus OAuth permite configurar y autorizar el dominio/callback nuevos, y si las integraciones Manus Forge necesarias admiten dicho entorno. Si no se pueden obtener esas capacidades/credenciales, habrá que sustituir la autenticación e integraciones por proveedores propios antes de producción.

## Base de datos y datos personales

Revisa las migraciones `drizzle/*.sql` y aplícalas de forma controlada contra la base destinada al nuevo despliegue. Respaldar y probar la restauración antes de migraciones productivas. La base contiene datos personales sensibles de procesos laborales; limita permisos, activa TLS y cifrado/backup según el proveedor, define retención y acceso, y completa/revisa legalmente el aviso de privacidad antes de recabar datos reales. No uses respuestas de candidatos en CI, fixtures compartidos ni repositorios.

Carga el catálogo de cuatro instrumentos desde la biblioteca administrativa después del primer inicio de sesión. Los instrumentos son prototipos; no son normas psicométricas validadas.

## Verificación del código

Antes de publicar cambios, ejecuta localmente `pnpm test`, `pnpm check` y `pnpm build`. El repositorio se preparó sin un workflow de GitHub Actions porque la autorización disponible para esta sesión no permite crear ni actualizar archivos de workflows. Puedes añadir CI más adelante desde GitHub o reconectar una integración con el permiso específico de workflows.

## Verificación antes de producción

1. Confirmar que el deploy levanta `pnpm start` y que el proveedor define `PORT`.
2. Verificar página raíz, `/api/trpc` y callback OAuth en staging.
3. Probar login/cierre de sesión, rol admin persistente, consentimiento, carga de catálogo, asignación y evaluación con cuentas de prueba sin datos reales.
4. Confirmar que cookies usan HTTPS y que el callback coincide exactamente.
5. Revisar logs para asegurar que no exponen tokens, respuestas o datos personales.
6. Solo entonces planificar el traslado de datos, si se requiere y se autoriza explícitamente.
