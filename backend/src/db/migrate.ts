import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '../config/env';

const SQL_DIR = path.resolve(process.cwd(), 'sql');
const ARCHIVOS = [
  '02_create_tables.sql',
  '08_multitenant.sql',
  '03_insert_roles.sql',
  '04_insert_permissions.sql',
  '05_seed_data.sql',
  '06_agregar_telefono_usuarios.sql',
  '07_seguridad_passwords.sql',
  '09_diagramas.sql',
  '10_diagramas_svg.sql',
];

function parseDatabaseUrl(url: string): { host: string; port: number; user: string; password: string; database: string } {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)),
  };
}

async function crearBaseDeDatosSiNoExiste(): Promise<string> {
  const { host, port, user, password, database } = parseDatabaseUrl(env.databaseUrl);
  const adminClient = new Client({ host, port, user, password, database: 'postgres' });
  await adminClient.connect();
  try {
    const resultado = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [database]);
    if (!resultado.rowCount) {
      await adminClient.query(`CREATE DATABASE "${database}"`);
      console.log(`Base de datos "${database}" creada.`);
    } else {
      console.log(`La base de datos "${database}" ya existe.`);
    }
  } finally {
    await adminClient.end();
  }
  return database;
}

async function ejecutarArchivos() {
  for (const archivo of ARCHIVOS) {
    const ruta = path.join(SQL_DIR, archivo);
    if (!fs.existsSync(ruta)) {
      console.error(`No existe el archivo SQL: ${archivo}`);
      process.exit(1);
    }
    const sql = fs.readFileSync(ruta, 'utf-8');
    const client = new Client({ connectionString: env.databaseUrl });
    await client.connect();
    try {
      await client.query(sql);
      console.log(`Aplicado: ${archivo}`);
    } finally {
      await client.end();
    }
  }
}

async function main() {
  const base = await crearBaseDeDatosSiNoExiste();
  console.log(`Conectando a la base de datos "${base}"...`);
  await ejecutarArchivos();
  console.log('Migraciones completadas correctamente.');
}

main().catch((err) => {
  console.error('[db:migrate] Error ejecutando migraciones:', err);
  process.exit(1);
});