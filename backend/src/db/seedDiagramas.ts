import { Client } from 'pg';
import { env } from '../config/env';
import { generarTodas } from '../diagramas/build';
import { verificacion } from '../diagramas/verify';

async function main() {
  const todos = generarTodas();

  const r = verificacion();
  if (r.bad > 0) {
    console.error(`[db:diagramas] VERIFICACION FALLIDA: ${r.bad}/${r.total} problemas.\n`);
    console.error(r.fallas.filter((f) => f.startsWith('FAIL')).join('\n'));
    process.exit(1);
  }
  console.log(`[db:diagramas] Verificacion previa: ${r.ok}/${r.total} comprobaciones OK.`);

  const client = new Client({ connectionString: env.databaseUrl });
  await client.connect();
  try {
    for (const d of todos) {
      await client.query(
        `INSERT INTO diagramas (numero, nombre, titulo, categoria, descripcion, svg, imagen, content_type, ancho, alto)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, 'image/svg+xml', $7, $8)
         ON CONFLICT (numero) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           titulo = EXCLUDED.titulo,
           categoria = EXCLUDED.categoria,
           descripcion = EXCLUDED.descripcion,
           svg = EXCLUDED.svg,
           imagen = NULL,
           content_type = EXCLUDED.content_type,
           ancho = EXCLUDED.ancho,
           alto = EXCLUDED.alto,
           actualizado_en = now()`,
        [d.numero, d.nombre, d.titulo, d.categoria, d.descripcion, d.svg, d.ancho, d.alto]
      );
    }
    console.log(`Diagramas regenerados desde el codigo: ${todos.length} SVG en la tabla diagramas.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[db:diagramas] Error regenerando diagramas:', err);
  process.exit(1);
});