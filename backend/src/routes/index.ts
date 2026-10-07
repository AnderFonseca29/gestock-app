import { Router, Request, Response } from 'express';
import { authRoutes } from './auth.routes';
import { usuarioRoutes } from './usuario.routes';
import { rolRoutes } from './rol.routes';
import { permisoRoutes } from './permiso.routes';
import { empresaRoutes } from './empresa.routes';
import { categoriaRoutes } from './categoria.routes';
import { bodegaRoutes } from './bodega.routes';
import { productoRoutes } from './producto.routes';
import { movimientoRoutes } from './movimiento.routes';
import { recepcionRoutes } from './recepcion.routes';
import { auditoriaRoutes } from './auditoria.routes';
import { incidenciaRoutes } from './incidencia.routes';
import { mantenimientoRoutes } from './mantenimiento.routes';
import { sesionRoutes } from './sesion.routes';
import { notificacionRoutes } from './notificacion.routes';
import { configuracionRoutes } from './configuracion.routes';
import { dashboardRoutes } from './dashboard.routes';
import { reporteRoutes } from './reporte.routes';
import { diagramaRoutes } from './diagrama.routes';
import { ok } from '../utils/response';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req: Request, res: Response) => {
  ok(res, { estado: 'OK', fecha: new Date().toISOString() }, 'Servicio disponible.');
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/usuarios', usuarioRoutes);
apiRoutes.use('/roles', rolRoutes);
apiRoutes.use('/permisos', permisoRoutes);
apiRoutes.use('/empresas', empresaRoutes);
apiRoutes.use('/categorias', categoriaRoutes);
apiRoutes.use('/bodegas', bodegaRoutes);
apiRoutes.use('/productos', productoRoutes);
apiRoutes.use('/movimientos', movimientoRoutes);
apiRoutes.use('/recepciones', recepcionRoutes);
apiRoutes.use('/auditorias', auditoriaRoutes);
apiRoutes.use('/incidencias', incidenciaRoutes);
apiRoutes.use('/mantenimientos', mantenimientoRoutes);
apiRoutes.use('/sesiones', sesionRoutes);
apiRoutes.use('/notificaciones', notificacionRoutes);
apiRoutes.use('/configuracion', configuracionRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
apiRoutes.use('/reportes', reporteRoutes);
apiRoutes.use('/diagramas', diagramaRoutes);