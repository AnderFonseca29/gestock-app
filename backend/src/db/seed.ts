import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '../config/env';

const SQL_DIR = path.resolve(process.cwd(), 'sql');

async function main() {
  const ruta = path.join(SQL_DIR, '05_seed_data.sql');
  if (!fs.existsSync(ruta)) {
    console.error('No existe el archivo 05_seed_data.sql');
    process.exit(1);
  }

  const client = new Client({ connectionString: env.databaseUrl });
  await client.connect();
  try {
    const sql = fs.readFileSync(ruta, 'utf-8');
    await client.query(sql);
    console.log('Datos semilla aplicados correctamente.');
    console.log('Credenciales de prueba:');
    console.log('  admin@gestock.com / Admin2026!');
    console.log('  supervisor@gestock.com / Supervisor2026!');
    console.log('  operario@gestock.com / Operario2026!');
    console.log('  tecnico@gestock.com / Tecnico2026!');
    console.log('  auditor@gestock.com / Auditor2026!');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[db:seed] Error aplicando datos semilla:', err);
  process.exit(1);
});