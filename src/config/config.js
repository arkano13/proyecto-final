export const API_BASE_URL =
  'http://localhost/movilFinal';

export const API_URLS = {
  // Autenticación
  CHECKBD:
    `${API_BASE_URL}/api/auth/checkbd.php`,

  LOGIN:
    `${API_BASE_URL}/api/auth/login.php`,

  REGISTRAR_USUARIO:
    `${API_BASE_URL}/api/auth/registrarUsuario.php`,

  // Propiedades
  CREAR_PROPIEDAD:
    `${API_BASE_URL}/api/propiedades/crearPropiedad.php`,

  LISTAR_PROPIEDADES:
    `${API_BASE_URL}/api/propiedades/listarPropiedades.php`,

  LISTAR_DISPONIBLES:
    `${API_BASE_URL}/api/propiedades/listarDisponibles.php`,

  CONSULTAR_PROPIEDAD:
    `${API_BASE_URL}/api/propiedades/consultarPropiedad.php`,

  ACTUALIZAR_PROPIEDAD:
    `${API_BASE_URL}/api/propiedades/actualizarPropiedad.php`,

  ELIMINAR_PROPIEDAD:
    `${API_BASE_URL}/api/propiedades/eliminarPropiedad.php`,

  CAMBIAR_ESTADO_PROPIEDAD:
    `${API_BASE_URL}/api/propiedades/cambiarEstado.php`,

  // Solicitudes
  CREAR_SOLICITUD:
    `${API_BASE_URL}/api/solicitudes/crearSolicitud.php`,

  LISTAR_SOLICITUDES_ARRENDADOR:
    `${API_BASE_URL}/api/solicitudes/listarSolicitudesArrendador.php`,

  LISTAR_SOLICITUDES_INQUILINO:
    `${API_BASE_URL}/api/solicitudes/listarSolicitudesInquilino.php`,

  CAMBIAR_ESTADO_SOLICITUD:
    `${API_BASE_URL}/api/solicitudes/cambiarEstadoSolicitud.php`,

  // Contratos
  CREAR_CONTRATO:
    `${API_BASE_URL}/api/contratos/crearContrato.php`,

  LISTAR_CONTRATOS_ARRENDADOR:
    `${API_BASE_URL}/api/contratos/listarContratosArrendador.php`,

  LISTAR_CONTRATOS_INQUILINO:
    `${API_BASE_URL}/api/contratos/listarContratosInquilino.php`,

  CAMBIAR_ESTADO_CONTRATO:
    `${API_BASE_URL}/api/contratos/cambiarEstadoContrato.php`,

  // Pagos
  REGISTRAR_PAGO:
    `${API_BASE_URL}/api/pagos/registrarPago.php`,

  LISTAR_PAGOS_ARRENDADOR:
    `${API_BASE_URL}/api/pagos/listarPagosArrendador.php`,

  LISTAR_PAGOS_INQUILINO:
    `${API_BASE_URL}/api/pagos/listarPagosInquilino.php`,

  ANULAR_PAGO:
    `${API_BASE_URL}/api/pagos/anularPago.php`,

  // Fotografías y registros
  SUBIR_FOTO:
    `${API_BASE_URL}/core/uploadphoto.php`,

  REGISTRAR_BITACORA:
    `${API_BASE_URL}/core/Logger.php`,

  REGISTRAR_DISPOSITIVO:
    `${API_BASE_URL}/core/dispositivo.php`,

  // Consultas de registros
  FILTRAR_DISPOSITIVO:
    `${API_BASE_URL}/api/logs/consultarDispositivo.php`,

  FILTRAR_BITACORA:
    `${API_BASE_URL}/api/logs/consultarBitacora.php`,
};