export function ok(res: any, data: any, message?: string): void {
  res.status(200).json({ success: true, message: message || 'Operación realizada correctamente.', data });
}

export function created(res: any, data: any, message: string): void {
  res.status(201).json({ success: true, message, data });
}

export function noContent(res: any, message?: string): void {
  res.status(200).json({ success: true, message: message || 'Operación realizada correctamente.', data: null });
}