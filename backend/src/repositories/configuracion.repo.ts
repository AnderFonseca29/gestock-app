import { query, queryOne } from '../config/db';
import { ConfiguracionRow } from '../models/types';

export const configuracionRepo = {
  async listar(): Promise<ConfiguracionRow[]> {
    return query<ConfiguracionRow>(`SELECT * FROM configuracion_sistema ORDER BY clave`);
  },

  async obtener(clave: string): Promise<ConfiguracionRow | null> {
    return queryOne<ConfiguracionRow>(`SELECT * FROM configuracion_sistema WHERE clave = $1`, [clave]);
  },

  async actualizar(clave: string, valor: string): Promise<void> {
    await query(
      `INSERT INTO configuracion_sistema (clave, valor)
       VALUES ($1, $2)
       ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, fecha_actualizacion = NOW()`,
      [clave, valor]
    );
  },

  async actualizarVarias(entradas: Record<string, string>): Promise<void> {
    for (const [clave, valor] of Object.entries(entradas)) {
      await this.actualizar(clave, valor);
    }
  },
};