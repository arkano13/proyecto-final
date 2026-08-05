import { API_URLS } from '../config/config';

/**
 * Registra una acción en la bitácora. No bloquea la UI si falla
 * (el registro de auditoría nunca debe trabar al usuario).
 *
 * @param {number|null} usuario_id - id del usuario que hace la acción (null si aún no hay sesión, ej. login fallido)
 * @param {string} accion - ej. 'LOGIN_EXITOSO', 'LOGIN_FALLIDO', 'CERRAR_SESION', 'CONCEDER_ACCESO'
 * @param {string|null} tabla_afectada - ej. 'tbl_usuario_final', 'tbl_acceso_final'
 * @param {string|number|null} registro_id - id del registro afectado, si aplica
 * @param {string} estado_operacion - 'EXITOSO' o 'FALLIDO'
 */
export function registrarBitacora(usuario_id, accion, tabla_afectada = null, registro_id = null, estado_operacion = 'EXITOSO') {
  fetch(API_URLS.REGISTRAR_BITACORA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuario_id ?? 0,
      accion,
      tabla_afectada,
      registro_id,
      estado_operacion,
    }),
  }).catch(() => {
    // Silencioso a propósito: si la bitácora falla, no debe interrumpir al usuario
  });
}