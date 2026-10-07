import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import {
  loginSchema,
  cambiarContrasenaSchema,
  solicitarRecuperacionSchema,
  validarCodigoRecuperacionSchema,
  restablecerPasswordSchema,
} from '../models/schemas';
import { loginEmailLimiter, loginIpLimiter, recuperacionLimiter } from '../middleware/rateLimit';

export const authRoutes = Router();

const loginMiddlewares =
  process.env.NODE_ENV === 'test'
    ? [validateBody(loginSchema), authController.login]
    : [validateBody(loginSchema), loginEmailLimiter, loginIpLimiter, authController.login];

authRoutes.post('/login', ...loginMiddlewares);
authRoutes.get('/perfil', authenticateToken, authController.perfil);
authRoutes.post('/logout', authenticateToken, authController.logout);
authRoutes.put('/contrasena', authenticateToken, validateBody(cambiarContrasenaSchema), authController.cambiarContrasena);
authRoutes.post(
  '/recuperar',
  validateBody(solicitarRecuperacionSchema),
  recuperacionLimiter,
  authController.solicitarRecuperacion
);
authRoutes.post(
  '/recuperar/validar',
  validateBody(validarCodigoRecuperacionSchema),
  authController.validarCodigoRecuperacion
);
authRoutes.post(
  '/recuperar/restablecer',
  validateBody(restablecerPasswordSchema),
  authController.restablecerPassword
);