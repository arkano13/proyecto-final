import React, {
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, API_URLS } from '../config/config';
import { RADIO } from '../estilos/globales';
import { useTema } from '../context/TemaContext';
import useActualizacionAutomatica from '../hooks/useActualizacionAutomatica';

export default function MisPagos({
  route,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;

  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const obtenerInquilinoId = useCallback(() => {
    return Number(
      usuario?.id ||
        usuario?.usuario_id ||
        0
    );
  }, [usuario]);

  const cargarPagos = useCallback(async (
    mostrarCarga = true
  ) => {
    const inquilinoId =
      obtenerInquilinoId();

    if (!inquilinoId) {
      setPagos([]);
      setError(
        'No se pudo identificar al inquilino.'
      );
      setCargando(false);
      return;
    }

    try {
      if (mostrarCarga) {
        setCargando(true);
      }
      setError('');

      const respuesta = await fetch(
        API_URLS.LISTAR_PAGOS_INQUILINO,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            inquilino_id: inquilinoId,
          }),
        }
      );

      const textoRespuesta =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(textoRespuesta);
      } catch (errorJson) {
        console.log(
          'Respuesta de pagos:',
          textoRespuesta
        );

        throw new Error(
          'El servidor no devolvió una respuesta válida.'
        );
      }

      if (
        !respuesta.ok ||
        datos.exito === false ||
        datos.success === false
      ) {
        throw new Error(
          datos.mensaje ||
            datos.message ||
            'No se pudieron cargar los pagos.'
        );
      }

      let lista = [];

      if (Array.isArray(datos)) {
        lista = datos;
      } else if (Array.isArray(datos.pagos)) {
        lista = datos.pagos;
      } else if (Array.isArray(datos.data)) {
        lista = datos.data;
      }

      setPagos(lista);
    } catch (errorPeticion) {
      console.error(
        'Error al cargar pagos:',
        errorPeticion
      );

      setPagos([]);

      setError(
        errorPeticion.message ||
          'Ocurrió un error al cargar los pagos.'
      );
    } finally {
      setCargando(false);
    }
  }, [obtenerInquilinoId]);

  useActualizacionAutomatica(
    cargarPagos,
    20
  );

  const obtenerPagoId = (pago) => {
    return Number(
      pago?.id ||
        pago?.pago_id ||
        0
    );
  };

  const obtenerEstado = (pago) => {
    return String(
      pago?.estado ||
        pago?.pago_estado ||
        'pagado'
    ).toLowerCase();
  };

  const obtenerPeriodo = (pago) => {
    return (
      pago?.periodo ||
      pago?.pago_periodo ||
      ''
    );
  };

  const obtenerFechaPago = (pago) => {
    return (
      pago?.fecha_pago ||
      pago?.pago_fecha ||
      ''
    );
  };

  const obtenerMonto = (pago) => {
    return Number(
      pago?.monto ||
        pago?.pago_monto ||
        0
    );
  };

  const obtenerMetodo = (pago) => {
    return String(
      pago?.metodo ||
        pago?.pago_metodo ||
        'otro'
    ).toLowerCase();
  };

  const obtenerReferencia = (pago) => {
    return (
      pago?.referencia ||
      pago?.pago_referencia ||
      ''
    );
  };

  const obtenerObservacion = (pago) => {
    return (
      pago?.observacion ||
      pago?.pago_observacion ||
      ''
    );
  };

  const obtenerTituloPropiedad = (pago) => {
    return (
      pago?.propiedad?.titulo ||
      pago?.propiedad?.propiedad_titulo ||
      pago?.propiedad_titulo ||
      'Propiedad'
    );
  };

  const obtenerDireccionPropiedad = (
    pago
  ) => {
    return (
      pago?.propiedad?.direccion ||
      pago?.propiedad?.propiedad_direccion ||
      pago?.propiedad_direccion ||
      ''
    );
  };

  const obtenerNombreArrendador = (pago) => {
    return (
      pago?.arrendador?.nombre ||
      pago?.arrendador
        ?.usuario_nombrecomp ||
      pago?.arrendador_nombre ||
      'Arrendador'
    );
  };

  const obtenerCorreoArrendador = (pago) => {
    return (
      pago?.arrendador?.correo ||
      pago?.arrendador?.email ||
      pago?.arrendador
        ?.usuario_correo ||
      pago?.arrendador_correo ||
      ''
    );
  };

  const obtenerImagen = (pago) => {
    const ruta =
      pago?.propiedad?.imagen ||
      pago?.propiedad?.foto ||
      pago?.propiedad?.imagen_ruta ||
      pago?.propiedad?.propiedad_img_ruta ||
      pago?.propiedad_imagen ||
      '';

    if (!ruta) {
      return null;
    }

    if (
      String(ruta).startsWith('http://') ||
      String(ruta).startsWith('https://')
    ) {
      return String(ruta);
    }

    /*
     * El backend puede devolver la
     * ruta ya absoluta desde la raíz
     * del dominio (con "/movilFinal"
     * incluido). Si eso pasa, no hay
     * que volver a pegar API_BASE_URL
     * completo, o queda duplicado.
     */
    const coincidencia =
      API_BASE_URL.match(
        /^(https?:\/\/[^/]+)/
      );

    const servidor = coincidencia
      ? coincidencia[1]
      : '';

    if (String(ruta).startsWith('/')) {
      return `${servidor}${ruta}`;
    }

    return `${API_BASE_URL}/${ruta}`;
  };

  const mostrarDinero = (cantidad) => {
    return Number(
      cantidad || 0
    ).toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const mostrarFecha = (fecha) => {
    if (!fecha) {
      return 'No disponible';
    }

    const fechaObjeto = new Date(
      `${String(fecha).substring(0, 10)}T00:00:00`
    );

    if (
      Number.isNaN(fechaObjeto.getTime())
    ) {
      return String(fecha);
    }

    return fechaObjeto.toLocaleDateString(
      'es-HN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  const mostrarPeriodo = (periodo) => {
    if (
      !periodo ||
      !/^\d{4}-\d{2}$/.test(periodo)
    ) {
      return periodo || 'No disponible';
    }

    const partes = periodo.split('-');
    const anio = Number(partes[0]);
    const mes = Number(partes[1]);

    const fecha = new Date(
      anio,
      mes - 1,
      1
    );

    const nombreMes =
      fecha.toLocaleDateString('es-HN', {
        month: 'long',
      });

    return `${
      nombreMes.charAt(0).toUpperCase() +
      nombreMes.slice(1)
    } ${anio}`;
  };

  const obtenerMetodoVisual = (metodo) => {
    if (metodo === 'efectivo') {
      return {
        etiqueta: 'Efectivo',
        icono: 'cash-outline',
      };
    }

    if (metodo === 'transferencia') {
      return {
        etiqueta: 'Transferencia',
        icono: 'swap-horizontal-outline',
      };
    }

    if (metodo === 'deposito') {
      return {
        etiqueta: 'Depósito',
        icono: 'business-outline',
      };
    }

    return {
      etiqueta: 'Otro',
      icono: 'wallet-outline',
    };
  };

  const pagosValidos = pagos.filter(
    (pago) =>
      obtenerEstado(pago) === 'pagado'
  );

  const totalPagado = pagosValidos.reduce(
    (total, pago) =>
      total + obtenerMonto(pago),
    0
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={colores.primario}
        />

        <Text style={styles.textoCargando}>
          Cargando pagos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.resumen}>
        <View style={styles.resumenIcono}>
          <Ionicons
            name="wallet-outline"
            size={31}
            color={colores.primario}
          />
        </View>

        <View style={styles.resumenInformacion}>
          <Text style={styles.resumenEtiqueta}>
            Total pagado
          </Text>

          <Text style={styles.resumenMonto}>
            L {mostrarDinero(totalPagado)}
          </Text>

          <Text style={styles.resumenCantidad}>
            {pagosValidos.length}{' '}
            {pagosValidos.length === 1
              ? 'pago válido'
              : 'pagos válidos'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonRecargar}
          onPress={cargarPagos}
        >
          <Ionicons
            name="refresh"
            size={22}
            color={colores.primario}
          />
        </TouchableOpacity>
      </View>

      {error !== '' ? (
        <View style={styles.estadoPantalla}>
          <Ionicons
            name="alert-circle-outline"
            size={55}
            color={colores.peligro}
          />

          <Text style={styles.errorTexto}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.botonActualizar}
            onPress={cargarPagos}
          >
            <Text
              style={styles.textoActualizar}
            >
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : pagos.length === 0 ? (
        <View style={styles.estadoPantalla}>
          <Ionicons
            name="receipt-outline"
            size={70}
            color={colores.textoSecundario}
          />

          <Text style={styles.vacioTitulo}>
            No tienes pagos registrados
          </Text>

          <Text style={styles.vacioTexto}>
            Cuando el arrendador registre un pago,
            aparecerá en esta pantalla.
          </Text>

          <TouchableOpacity
            style={styles.botonActualizar}
            onPress={cargarPagos}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colores.primarioTexto}
            />

            <Text
              style={styles.textoActualizar}
            >
              Actualizar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        >
          {pagos.map((pago, indice) => {
            const pagoId = obtenerPagoId(pago);
            const estado = obtenerEstado(pago);
            const imagen = obtenerImagen(pago);

            const metodo =
              obtenerMetodoVisual(
                obtenerMetodo(pago)
              );

            const estaAnulado =
              estado === 'anulado';

            return (
              <View
                key={
                  pagoId ||
                  `pago-${indice}`
                }
                style={[
                  styles.tarjeta,
                  estaAnulado &&
                    styles.tarjetaAnulada,
                ]}
              >
                <View
                  style={
                    styles.encabezadoTarjeta
                  }
                >
                  {imagen ? (
                    <Image
                      source={{ uri: imagen }}
                      style={
                        styles.imagenPropiedad
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={styles.sinImagen}
                    >
                      <Ionicons
                        name="home-outline"
                        size={26}
                        color={
                          colores.textoSecundario
                        }
                      />
                    </View>
                  )}

                  <View
                    style={
                      styles.tituloContenedor
                    }
                  >
                    <Text
                      style={
                        styles.tituloPropiedad
                      }
                    >
                      {obtenerTituloPropiedad(
                        pago
                      )}
                    </Text>

                    <Text
                      style={styles.arrendador}
                    >
                      Arrendador:{' '}
                      {obtenerNombreArrendador(
                        pago
                      )}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.estado,
                      estaAnulado
                        ? styles.estadoAnulado
                        : styles.estadoPagado,
                    ]}
                  >
                    <Ionicons
                      name={
                        estaAnulado
                          ? 'close-circle'
                          : 'checkmark-circle'
                      }
                      size={15}
                      color={
                        estaAnulado
                          ? colores.peligro
                          : colores.exito
                      }
                    />

                    <Text
                      style={[
                        styles.estadoTexto,
                        {
                          color: estaAnulado
                            ? colores.peligro
                            : colores.exito,
                        },
                      ]}
                    >
                      {estado.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {obtenerDireccionPropiedad(
                  pago
                ) !== '' && (
                  <View
                    style={
                      styles.filaInformacion
                    }
                  >
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color={
                        colores.textoSecundario
                      }
                    />

                    <Text
                      style={
                        styles.textoInformacion
                      }
                    >
                      {obtenerDireccionPropiedad(
                        pago
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.pagoPrincipal}>
                  <View>
                    <Text
                      style={styles.periodoEtiqueta}
                    >
                      Periodo pagado
                    </Text>

                    <Text
                      style={styles.periodoTexto}
                    >
                      {mostrarPeriodo(
                        obtenerPeriodo(pago)
                      )}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.monto,
                      estaAnulado &&
                        styles.montoAnulado,
                    ]}
                  >
                    L{' '}
                    {mostrarDinero(
                      obtenerMonto(pago)
                    )}
                  </Text>
                </View>

                <View style={styles.detalles}>
                  <View style={styles.detalleItem}>
                    <View style={styles.detalleIcono}>
                      <Ionicons
                        name="calendar-outline"
                        size={19}
                        color={colores.primario}
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.detalleEtiqueta
                        }
                      >
                        Fecha del pago
                      </Text>

                      <Text
                        style={styles.detalleValor}
                      >
                        {mostrarFecha(
                          obtenerFechaPago(pago)
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detalleItem}>
                    <View style={styles.detalleIcono}>
                      <Ionicons
                        name={metodo.icono}
                        size={19}
                        color={colores.primario}
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.detalleEtiqueta
                        }
                      >
                        Método
                      </Text>

                      <Text
                        style={styles.detalleValor}
                      >
                        {metodo.etiqueta}
                      </Text>
                    </View>
                  </View>
                </View>

                {obtenerReferencia(pago) !==
                  '' && (
                  <View
                    style={
                      styles.informacionAdicional
                    }
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={18}
                      color={colores.primario}
                    />

                    <Text
                      style={
                        styles.informacionEtiqueta
                      }
                    >
                      Referencia:
                    </Text>

                    <Text
                      style={
                        styles.informacionValor
                      }
                    >
                      {obtenerReferencia(pago)}
                    </Text>
                  </View>
                )}

                {obtenerObservacion(pago) !==
                  '' && (
                  <View
                    style={
                      styles.observacionContenedor
                    }
                  >
                    <Text
                      style={
                        styles.observacionTitulo
                      }
                    >
                      Observación
                    </Text>

                    <Text
                      style={
                        styles.observacionTexto
                      }
                    >
                      {obtenerObservacion(pago)}
                    </Text>
                  </View>
                )}

                {obtenerCorreoArrendador(pago) !==
                  '' && (
                  <View
                    style={
                      styles.contactoContenedor
                    }
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={
                        colores.textoSecundario
                      }
                    />

                    <Text
                      style={
                        styles.contactoTexto
                      }
                    >
                      {obtenerCorreoArrendador(
                        pago
                      )}
                    </Text>
                  </View>
                )}

                <View
                  style={styles.numeroPago}
                >
                  <Text
                    style={
                      styles.numeroPagoTexto
                    }
                  >
                    Comprobante de pago #{pagoId}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const crearStyles = (colores) =>
  StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.fondo,
  },

  textoCargando: {
    marginTop: 12,
    fontSize: 15,
    color: colores.textoSecundario,
  },

  resumen: {
    backgroundColor: colores.tarjeta,
    margin: 16,
    marginBottom: 0,
    padding: 17,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow:
      '0px 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 2,
  },

  resumenIcono: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: colores.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resumenInformacion: {
    flex: 1,
    marginLeft: 13,
  },

  resumenEtiqueta: {
    fontSize: 13,
    color: colores.textoSecundario,
  },

  resumenMonto: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.primario,
  },

  resumenCantidad: {
    marginTop: 2,
    fontSize: 12,
    color: colores.textoSecundario,
  },

  botonRecargar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },

  lista: {
    padding: 16,
    paddingBottom: 35,
  },

  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: RADIO.lg,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    boxShadow:
      '0px 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 2,
  },

  tarjetaAnulada: {
    opacity: 0.72,
    backgroundColor: colores.campo,
  },

  encabezadoTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imagenPropiedad: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: colores.borde,
  },

  sinImagen: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: colores.campo,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tituloContenedor: {
    flex: 1,
    marginLeft: 11,
  },

  tituloPropiedad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  arrendador: {
    marginTop: 3,
    fontSize: 12,
    color: colores.textoSecundario,
  },

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estadoPagado: {
    backgroundColor: colores.exitoClaro,
  },

  estadoAnulado: {
    backgroundColor: colores.peligroClaro,
  },

  estadoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  filaInformacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 11,
  },

  textoInformacion: {
    flex: 1,
    fontSize: 13,
    color: colores.textoSecundario,
  },

  pagoPrincipal: {
    marginTop: 15,
    padding: 14,
    borderRadius: RADIO.sm,
    backgroundColor: colores.primarioClaro,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  periodoEtiqueta: {
    fontSize: 11,
    color: colores.textoSecundario,
  },

  periodoTexto: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  monto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.primario,
  },

  montoAnulado: {
    color: colores.textoSecundario,
    textDecorationLine: 'line-through',
  },

  detalles: {
    marginTop: 13,
    gap: 9,
  },

  detalleItem: {
    minHeight: 55,
    padding: 10,
    borderRadius: RADIO.sm,
    backgroundColor: colores.fondo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  detalleIcono: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: colores.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detalleEtiqueta: {
    fontSize: 10,
    color: colores.textoSecundario,
  },

  detalleValor: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },

  informacionAdicional: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 5,
  },

  informacionEtiqueta: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  informacionValor: {
    flex: 1,
    fontSize: 13,
    color: colores.textoSecundario,
  },

  observacionContenedor: {
    marginTop: 12,
    padding: 11,
    borderRadius: RADIO.sm,
    backgroundColor: colores.fondo,
    borderLeftWidth: 3,
    borderLeftColor: colores.primario,
  },

  observacionTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  observacionTexto: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colores.textoSecundario,
  },

  contactoContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },

  contactoTexto: {
    flex: 1,
    fontSize: 13,
    color: colores.textoSecundario,
  },

  numeroPago: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    alignItems: 'center',
  },

  numeroPagoTexto: {
    fontSize: 11,
    color: colores.textoSecundario,
  },

  estadoPantalla: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  errorTexto: {
    marginTop: 13,
    marginBottom: 18,
    fontSize: 15,
    textAlign: 'center',
    color: colores.peligro,
  },

  vacioTitulo: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colores.textoPrincipal,
  },

  vacioTexto: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colores.textoSecundario,
  },

  botonActualizar: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: RADIO.sm,
    backgroundColor: colores.primario,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  textoActualizar: {
    color: colores.primarioTexto,
    fontSize: 14,
    fontWeight: 'bold',
  },
});