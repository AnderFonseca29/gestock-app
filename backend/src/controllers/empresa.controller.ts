import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { empresaRepo } from '../repositories/empresa.repo';
import { transaction } from '../config/db';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';
import { loginEnEmpresa } from '../services/auth.service';
import { sesionRepo } from '../repositories/sesion.repo';
import { obtenerSesionInfo } from '../utils/requestInfo';
import { EmpresaRow } from '../models/types';

export const empresaController = {
  async seleccionar(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = Number(req.body.empresaId);
      const { email, password } = req.body;
      if (!req.user?.sesionId) throw ApiError.unauthorized('No se pudo identificar la sesión actual.');

      const empresa = await empresaRepo.buscarPorId(empresaId);
      if (!empresa) throw ApiError.notFound('La empresa no existe.');
      if (empresa.estado !== 'Activa') throw ApiError.forbidden('La empresa está inactiva. No puedes seleccionarla.');

      const resultado = await loginEnEmpresa(email, password, empresaId, obtenerSesionInfo(req));

      await sesionRepo.cerrar(req.user.sesionId);

      await registrarAuditoria({
        usuarioId: resultado.usuario.id,
        accion: 'SELECCIONAR',
        modulo: 'EMPRESAS',
        entidad: 'empresas',
        registroId: empresaId,
        descripcion: `El usuario ${resultado.usuario.email} cambió a la empresa ${empresa.nombre}.`,
      });

      ok(res, resultado, 'Empresa seleccionada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const empresas = await empresaRepo.listar();
      ok(res, empresas);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const empresa = await empresaRepo.buscarPorId(id);
      if (!empresa) throw ApiError.notFound('La empresa no existe.');
      ok(res, empresa);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, nit, correo, telefono, direccion, moneda, formatoFecha, adminEmail, adminPassword, adminNombre, adminApellido } = req.body;
      const existe = await empresaRepo.buscarPorNit(nit);
      if (existe) throw ApiError.conflict('Ya existe una empresa con ese NIT.');

      const empresa = await transaction<EmpresaRow>(async (client) => {
        const empRows = await client.query(
          `INSERT INTO empresas (nombre, nit, correo, telefono, direccion, moneda, formato_fecha)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            nombre,
            nit,
            correo,
            telefono ?? null,
            direccion ?? null,
            moneda ?? 'COP - Peso Colombiano',
            formatoFecha ?? 'DD/MM/YYYY',
          ]
        );
        const nuevaEmpresa = empRows.rows[0] as EmpresaRow;

        const rolAdmin = await client.query(
          `SELECT id FROM roles WHERE LOWER(nombre) = 'administrador' LIMIT 1`
        );
        if (!rolAdmin.rows.length) {
          throw ApiError.internal('No existe el rol Administrador en el sistema.');
        }

        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await client.query(
          `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol_id, empresa_id, estado)
           VALUES ($1, $2, $3, NULL, $4, $5, $6, 'Activo')`,
          [
            adminNombre ?? 'Administrador',
            adminApellido ?? nombre,
            adminEmail.toLowerCase().trim(),
            passwordHash,
            rolAdmin.rows[0].id,
            nuevaEmpresa.id,
          ]
        );

        return nuevaEmpresa;
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'EMPRESAS',
        entidad: 'empresas',
        registroId: empresa.id,
        descripcion: `Se creó la empresa ${empresa.nombre} (NIT ${empresa.nit}) con su administrador.`,
      });

      created(res, empresa, 'Empresa registrada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const empresa = await empresaRepo.buscarPorId(id);
      if (!empresa) throw ApiError.notFound('La empresa no existe.');

      const actualizada = await empresaRepo.actualizar(id, req.body);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'EMPRESAS',
        entidad: 'empresas',
        registroId: id,
        descripcion: `Se actualizó la empresa ${empresa.nombre}.`,
      });

      ok(res, actualizada, 'Empresa actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const empresa = await empresaRepo.buscarPorId(id);
      if (!empresa) throw ApiError.notFound('La empresa no existe.');

      await empresaRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'EMPRESAS',
        entidad: 'empresas',
        registroId: id,
        descripcion: `Se eliminó la empresa ${empresa.nombre}.`,
      });

      noContent(res, 'Empresa eliminada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};