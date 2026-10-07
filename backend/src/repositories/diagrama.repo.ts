import { query, queryOne } from '../config/db';
import { DiagramaRow } from '../models/types';

export const diagramaRepo = {
  listar(): Promise<DiagramaRow[]> {
    return query<DiagramaRow>(
      `SELECT id, numero, nombre, titulo, categoria, descripcion, content_type,
              ancho, alto,
              COALESCE(LENGTH(svg), LENGTH(imagen), 0) AS tamanio, actualizado_en
       FROM diagramas
       ORDER BY numero`
    );
  },

  obtenerPorId(id: number): Promise<DiagramaRow | null> {
    return queryOne<DiagramaRow>(
      `SELECT id, numero, nombre, titulo, categoria, descripcion, imagen, svg, content_type, ancho, alto
       FROM diagramas
       WHERE id = $1`,
      [id]
    );
  },
};