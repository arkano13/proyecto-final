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
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, API_URLS } from '../config/config';
import {
  RADIO,
} from '../estilos/globales';
import { useTema } from '../context/TemaContext';
import useActualizacionAutomatica from '../hooks/useActualizacionAutomatica';

export default function PagosAdmin({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;

  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  const obtenerArrendadorId = useCallback(() => {
    return Number(
      usuario?.id ||
        usuario?.usuario_id ||
        0
    );
  }, [usuario]);

  const obtenerPagoId = (pago) => {
    return Number(
      pago?.id ||
        pago?.pago_id ||
        0
    );
  };

  const cargarPagos = useCallback(
    async (mostrarCarga = true) => {
      const arrendadorId =
        obtenerArrendadorId();

      if (!arrendadorId) {
        setPagos([]);
        setError(
          'No se pudo identificar al arrendador.'
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
          API_URLS.LISTAR_PAGOS_ARRENDADOR,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              arrendador_id: arrendadorId,
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
    },
    [obtenerArrendadorId]
  );

  useActualizacionAutomatica(
    cargarPagos,
    20
  );

  const mostrarMensaje = (
    titulo,
    mensaje
  ) => {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      window.alert(mensaje);
      return;
    }

    Alert.alert(titulo, mensaje);
  };

  const ejecutarAnulacion = async (pago) => {
    const pagoId = obtenerPagoId(pago);
    const arrendadorId =
      obtenerArrendadorId();

    if (!pagoId || !arrendadorId) {
      mostrarMensaje(
        'Error',
        'No se pudo identificar el pago o el arrendador.'
      );

      return;
    }

    try {
      setProcesandoId(pagoId);

      const respuesta = await fetch(
        API_URLS.ANULAR_PAGO,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            pago_id: pagoId,
            arrendador_id: arrendadorId,
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
          'Respuesta al anular pago:',
          textoRespuesta
        );

        throw new Error(
          'El servidor no devolvió una respuesta válida.'
        );
      }

      const fueExitoso =
        datos.exito === true ||
        datos.success === true;

      if (!respuesta.ok || !fueExitoso) {
        throw new Error(
          datos.mensaje ||
            datos.message ||
            'No se pudo anular el pago.'
        );
      }

      await cargarPagos(false);

      mostrarMensaje(
        'Pago anulado',
        'El pago se anuló correctamente.'
      );
    } catch (errorAnulacion) {
      console.error(
        'Error al anular pago:',
        errorAnulacion
      );

      mostrarMensaje(
        'Error',
        errorAnulacion.message ||
          'No se pudo anular el pago.'
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const confirmarAnulacion = (pago) => {
    const mensaje =
      '¿Deseas anular este pago? El registro permanecerá guardado como anulado.';

    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      const confirmado =
        window.confirm(mensaje);

      if (confirmado) {
        ejecutarAnulacion(pago);
      }

      return;
    }

    Alert.alert(
      'Anular pago',
      mensaje,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Anular',
          style: 'destructive',
          onPress: () =>
            ejecutarAnulacion(pago),
        },
      ]
    );
  };

  const abrirRegistrarPago = () => {
    navigation.navigate('RegistrarPago', {
      usuario,
    });
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

  const obtenerNombreInquilino = (pago) => {
    return (
      pago?.inquilino?.nombre ||
      pago?.inquilino
        ?.usuario_nombrecomp ||
      pago?.inquilino_nombre ||
      'Inquilino'
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

    const rutaLimpia =
      String(ruta).replace(/^\/+/, '');

    return `${API_BASE_URL}/${rutaLimpia}`;
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
    (pago) => obtenerEstado(pago) === 'pagado'
  );

  const totalRecibido = pagosValidos.reduce(
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
        <View style={styles.resumenFila}>
          <View style={styles.resumenIcono}>
            <Ionicons
              name="cash-outline"
              size={30}
              color={colores.exito}
            />
          </View>

          <View style={styles.resumenInformacion}>
            <Text style={styles.resumenEtiqueta}>
              Total recibido
            </Text>

            <Text style={styles.resumenMonto}>
              L {mostrarDinero(totalRecibido)}
            </Text>

            <Text style={styles.resumenCantidad}>
              {pagosValidos.length}{' '}
              {pagosValidos.length === 1
                ? 'pago registrado'
                : 'pagos registrados'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botonRecargar}
            onPress={() => cargarPagos()}
          >
            <Ionicons
              name="refresh"
              size={22}
              color={colores.primario}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botonNuevoPago}
          onPress={abrirRegistrarPago}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colores.primarioTexto}
          />

          <Text style={styles.textoNuevoPago}>
            Registrar pago
          </Text>
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
            style={styles.botonReintentar}
            onPress={() => cargarPagos()}
          >
            <Text
              style={styles.textoReintentar}
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
            No hay pagos registrados
          </Text>

          <Text style={styles.vacioTexto}>
            Presiona Registrar pago para agregar
            el primer pago de un contrato.
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={abrirRegistrarPago}
          >
            <Ionicons
              name="add-outline"
              size={20}
              color={colores.primarioTexto}
            />

            <Text
              style={styles.textoReintentar}
            >
              Registrar pago
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
            const metodo = obtenerMetodoVisual(
              obtenerMetodo(pago)
            );

            const estaProcesando =
              procesandoId === pagoId;

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
                        size={25}
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
                      style={styles.inquilino}
                    >
                      {obtenerNombreInquilino(
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
                      Periodo
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
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={colores.primario}
                    />

                    <View>
                      <Text
                        style={
                          styles.detalleEtiqueta
                        }
                      >
                        Fecha
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
                    <Ionicons
                      name={metodo.icono}
                      size={18}
                      color={colores.primario}
                    />

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

                {!estaAnulado && (
                  <TouchableOpacity
                    style={[
                      styles.botonAnular,
                      estaProcesando &&
                        styles.botonDeshabilitado,
                    ]}
                    onPress={() =>
                      confirmarAnulacion(pago)
                    }
                    disabled={estaProcesando}
                  >
                    {estaProcesando ? (
                      <ActivityIndicator
                        size="small"
                        color={colores.peligro}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="close-circle-outline"
                          size={19}
                          color={colores.peligro}
                        />

                        <Text
                          style={
                            styles.textoAnular
                          }
                        >
                          Anular pago
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
    boxShadow:
      '0px 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 2,
  },

  resumenFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resumenIcono: {
    width: 57,
    height: 57,
    borderRadius: 16,
    backgroundColor: colores.exitoClaro,
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
    color: colores.exito,
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

  botonNuevoPago: {
    minHeight: 48,
    marginTop: 15,
    borderRadius: RADIO.sm,
    backgroundColor: colores.primario,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  textoNuevoPago: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colores.primarioTexto,
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
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: colores.borde,
  },

  sinImagen: {
    width: 52,
    height: 52,
    borderRadius: 13,
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

  inquilino: {
    marginTop: 3,
    fontSize: 13,
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
    padding: 13,
    borderRadius: RADIO.sm,
    backgroundColor: colores.exitoClaro,
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
    color: colores.exito,
  },

  montoAnulado: {
    color: colores.textoSecundario,
    textDecorationLine: 'line-through',
  },

  detalles: {
    marginTop: 13,
    flexDirection: 'row',
    gap: 10,
  },

  detalleItem: {
    flex: 1,
    minHeight: 55,
    padding: 10,
    borderRadius: RADIO.sm,
    backgroundColor: colores.fondo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  detalleEtiqueta: {
    fontSize: 10,
    color: colores.textoSecundario,
  },

  detalleValor: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },

  informacionAdicional: {
    flexDirection: 'row',
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

  botonAnular: {
    minHeight: 43,
    marginTop: 14,
    borderRadius: RADIO.sm,
    borderWidth: 1,
    borderColor: colores.peligro,
    backgroundColor: colores.peligroClaro,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoAnular: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.peligro,
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

  botonReintentar: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: RADIO.sm,
    backgroundColor: colores.primario,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  textoReintentar: {
    color: colores.primarioTexto,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
