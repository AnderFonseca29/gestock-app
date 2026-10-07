import nodemailer, { Transporter } from 'nodemailer';
import { env, isProduction } from '../config/env';

export function smtpConfigurado(): boolean {
  return Boolean(env.smtpHost && env.smtpUser);
}

export function smsConfigurado(): boolean {
  return Boolean(env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber);
}

let transporter: Transporter | null = null;

function obtenerTransporter(): Transporter | null {
  if (!smtpConfigurado()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
  }
  return transporter;
}

export async function enviarCodigoRecuperacion(
  email: string,
  codigo: string,
  nombre: string
): Promise<boolean> {
  const asunto = 'Código de verificación para restablecer tu contraseña';
  const cuerpo =
    `Hola ${nombre},\n\n` +
    `Recibimos una solicitud para restablecer tu contraseña en GESTOCK.\n\n` +
    `Tu código de verificación es: ${codigo}\n` +
    `Tiene una validez de 15 minutos.\n\n` +
    `Si no solicitaste este cambio, ignora este correo.\n\n` +
    `— Equipo GESTOCK`;

  console.log('[codigo-recuperacion] Destino:', email, '| Código:', codigo, '| SMTP:', smtpConfigurado() ? env.smtpHost : 'no configurado');

  const t = obtenerTransporter();
  if (!t) return false;

  try {
    await t.sendMail({
      from: env.smtpFrom,
      to: email,
      subject: asunto,
      text: cuerpo,
    });
    return true;
  } catch (err) {
    console.error('[mailer] No se pudo enviar el correo de recuperación:', err instanceof Error ? err.message : err);
    return false;
  }
}

export function normalizarParaTwilio(telefono: string): string {
  const digito = telefono.replace(/[\s()-]/g, '');
  if (digito.startsWith('+')) return digito;
  if (digito.startsWith('00')) return `+${digito.slice(2)}`;
  if (digito.startsWith('0')) return `+${env.twilioCountryCode}${digito.slice(1)}`;
  return `+${env.twilioCountryCode}${digito}`;
}

export async function enviarCodigoSms(
  telefono: string,
  codigo: string,
  nombre: string
): Promise<boolean> {
  const mensaje =
    `Hola ${nombre}, tu c\u00f3digo de verificaci\u00f3n en GESTOCK es ${codigo}.\n` +
    `V\u00e1lido por 15 minutos. Si no realizaste esta solicitud, ignora este mensaje.`;

  const canal = smsConfigurado()
    ? `Twilio (${env.twilioFromNumber})`
    : 'no configurado (modo demo)';
  console.log('[sms-recuperacion] Destino:', telefono, '| C\u00f3digo:', codigo, '| Proveedor SMS:', canal);

  if (!smsConfigurado()) return false;

  try {
    const params = new URLSearchParams({
      To: normalizarParaTwilio(telefono),
      From: env.twilioFromNumber!,
      Body: mensaje,
    });
    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.twilioAccountSid!)}/Messages.json`;
    const credenciales = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString('base64');
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credenciales}`,
      },
      body: params.toString(),
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error('[sms] Twilio rechaz\u00f3 el SMS:', respuesta.status, detalle.slice(0, 300));
    }
    return respuesta.ok;
  } catch (err) {
    console.error('[sms] No se pudo enviar el SMS de recuperaci\u00f3n:', err instanceof Error ? err.message : err);
    return false;
  }
}

export function revelarCodigoEnDesarrollo(): boolean {
  return !isProduction;
}