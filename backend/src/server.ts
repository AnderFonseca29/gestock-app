import { createApp } from './app';
import { env, isProduction } from './config/env';
import { testConnection } from './config/db';

const JWT_SECRET_DEFECTO = 'GESTOCK_DEV_SECRET_CAMBIA_ESTO';

function validarConfiguracionProduccion() {
  if (isProduction && env.jwtSecret === JWT_SECRET_DEFECTO) {
    throw new Error(
      '[Server] Producción requiere un JWT_SECRET seguro definido en las variables de entorno. Deteniendo el arranque por seguridad.'
    );
  }
}

async function main() {
  await testConnection();
  validarConfiguracionProduccion();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`GESTOCK API escuchando en http://localhost:${env.port}`);
    console.log(`Documentación Swagger: http://localhost:${env.port}/api/docs`);
  });
}

main().catch((err) => {
  console.error('[Server] No se pudo iniciar el servidor:', err);
  process.exit(1);
});