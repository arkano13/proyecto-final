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

export default function ContratosAdmin({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;

  const [contratos, setContratos] = useState([]);
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

  const obtenerContratoId = (contrato) => {
    return Number(
      contrato?.id ||
        contrato?.contrato_id ||
        0
    );
  };

  const cargarContratos = useCallback(
    async (mostrarCarga = true) => {
      const arrendadorId =
        obtenerArrendadorId();

      if (!arrendadorId) {
        setContratos([]);
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
          API_URLS.LISTAR_CONTRATOS_ARRENDADOR,
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
            'Respuesta de contratos:',
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
              'No se pudieron cargar los contratos.'
          );
        }

        let lista = [];

        if (Array.isArray(datos)) {
          lista = datos;
        } else if (
          Array.isArray(datos.contratos)
        ) {
          lista = datos.contratos;
        } else if (Array.isArray(datos.data)) {
          lista = datos.data;
        }

        setContratos(lista);
      } catch (errorPeticion) {
        console.error(
          'Error al cargar contratos:',
          errorPeticion
        );

        setContratos([]);

        setError(
          errorPeticion.message ||
            'Ocurrió un error al cargar los contratos.'
        );
      } finally {
        setCargando(false);
      }
    },
    [obtenerArrendadorId]
  );

  useActualizacionAutomatica(
    cargarContratos,
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

  const ejecutarCambioEstado = async (
    contrato,
    nuevoEstado
  ) => {
    const contratoId =
      obtenerContratoId(contrato);

    const arrendadorId =
      obtenerArrendadorId();

    if (!contratoId || !arrendadorId) {
      mostrarMensaje(
        'Error',
        'No se pudo identificar el contrato o el arrendador.'
      );

      return;
    }

    try {
      setProcesandoId(contratoId);

      const respuesta = await fetch(
        API_URLS.CAMBIAR_ESTADO_CONTRATO,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            contrato_id: contratoId,
            arrendador_id: arrendadorId,
            estado: nuevoEstado.toUpperCase(),
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
          'Respuesta al cambiar contrato:',
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
            'No se pudo actualizar el contrato.'
        );
      }

      await cargarContratos(false);

      if (
        nuevoEstado.toLowerCase() ===
        'finalizado'
      ) {
        mostrarMensaje(
          'Contrato finalizado',
          'El contrato finalizó correctamente y la propiedad volvió a estar disponible.'
        );
      } else {
        mostrarMensaje(
          'Contrato cancelado',
          'El contrato se canceló correctamente y la propiedad volvió a estar disponible.'
        );
      }
    } catch (errorCambio) {
      console.error(
        'Error al cambiar contrato:',
        errorCambio
      );

      mostrarMensaje(
        'Error',
        errorCambio.message ||
          'No se pudo actualizar el contrato.'
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const confirmarCambioEstado = (
    contrato,
    nuevoEstado
  ) => {
    const esFinalizar =
      nuevoEstado.toLowerCase() ===
      'finalizado';

    const titulo = esFinalizar
      ? 'Finalizar contrato'
      : 'Cancelar contrato';

    const mensaje = esFinalizar
      ? '¿Deseas finalizar este contrato? La propiedad volverá a estar disponible.'
      : '¿Deseas cancelar este contrato? La propiedad volverá a estar disponible.';

    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      const confirmado =
        window.confirm(mensaje);

      if (confirmado) {
        ejecutarCambioEstado(
          contrato,
          nuevoEstado
        );
      }

      return;
    }

    Alert.alert(
      titulo,
      mensaje,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: esFinalizar
            ? 'Finalizar'
            : 'Cancelar contrato',
          style: esFinalizar
            ? 'default'
            : 'destructive',
          onPress: () =>
            ejecutarCambioEstado(
              contrato,
              nuevoEstado
            ),
        },
      ]
    );
  };

  const obtenerEstado = (contrato) => {
    return String(
      contrato?.estado ||
        contrato?.contrato_estado ||
        'activo'
    ).toLowerCase();
  };

  const obtenerTituloPropiedad = (
    contrato
  ) => {
    return (
      contrato?.propiedad?.titulo ||
      contrato?.propiedad?.propiedad_titulo ||
      contrato?.propiedad_titulo ||
      'Propiedad'
    );
  };

  const obtenerDireccionPropiedad = (
    contrato
  ) => {
    return (
      contrato?.propiedad?.direccion ||
      contrato?.propiedad
        ?.propiedad_direccion ||
      contrato?.propiedad_direccion ||
      ''
    );
  };

  const obtenerNombreInquilino = (
    contrato
  ) => {
    return (
      contrato?.inquilino?.nombre ||
      contrato?.inquilino
        ?.usuario_nombrecomp ||
      contrato?.inquilino_nombre ||
      'Inquilino'
    );
  };

  const obtenerCorreoInquilino = (
    contrato
  ) => {
    return (
      contrato?.inquilino?.correo ||
      contrato?.inquilino?.email ||
      contrato?.inquilino
        ?.usuario_correo ||
      contrato?.inquilino_correo ||
      ''
    );
  };

  const obtenerTelefonoInquilino = (
    contrato
  ) => {
    return (
      contrato?.inquilino?.telefono ||
      contrato?.inquilino
        ?.usuario_telefono ||
      contrato?.inquilino_telefono ||
      ''
    );
  };

  const obtenerFechaInicio = (contrato) => {
    return (
      contrato?.fecha_inicio ||
      contrato?.contrato_fecha_inicio ||
      ''
    );
  };

  const obtenerFechaFin = (contrato) => {
    return (
      contrato?.fecha_fin ||
      contrato?.contrato_fecha_fin ||
      ''
    );
  };

  const obtenerMonto = (contrato) => {
    return Number(
      contrato?.monto_mensual ||
        contrato?.contrato_monto_mensual ||
        0
    );
  };

  const obtenerDeposito = (contrato) => {
    return Number(
      contrato?.deposito ||
        contrato?.contrato_deposito ||
        0
    );
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

  const obtenerImagen = (contrato) => {
    const ruta =
      contrato?.propiedad?.imagen ||
      contrato?.propiedad?.foto ||
      contrato?.propiedad?.imagen_ruta ||
      contrato?.propiedad
        ?.propiedad_img_ruta ||
      contrato?.propiedad_imagen ||
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

  const obtenerColorEstado = (estado) => {
    if (estado === 'activo') {
      return {
        fondo: colores.exitoClaro,
        texto: colores.exito,
        icono: 'checkmark-circle',
      };
    }

    if (estado === 'finalizado') {
      return {
        fondo: colores.primarioClaro,
        texto: colores.primario,
        icono: 'flag',
      };
    }

    return {
      fondo: colores.peligroClaro,
      texto: colores.peligro,
      icono: 'close-circle',
    };
  };

  const contratosActivos =
    contratos.filter(
      (contrato) =>
        obtenerEstado(contrato) === 'activo'
    ).length;

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={colores.primario}
        />

        <Text style={styles.textoCargando}>
          Cargando contratos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.resumenSuperior}>
        <View style={styles.resumenIcono}>
          <Ionicons
            name="document-text-outline"
            size={28}
            color={colores.primario}
          />
        </View>

        <View style={styles.resumenTexto}>
          <Text style={styles.resumenTitulo}>
            Contratos
          </Text>

          <Text
            style={styles.resumenDescripcion}
          >
            {contratosActivos}{' '}
            {contratosActivos === 1
              ? 'contrato activo'
              : 'contratos activos'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonRecargar}
          onPress={() => cargarContratos()}
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
            style={styles.botonReintentar}
            onPress={() => cargarContratos()}
          >
            <Text
              style={styles.textoReintentar}
            >
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : contratos.length === 0 ? (
        <View style={styles.estadoPantalla}>
          <Ionicons
            name="document-text-outline"
            size={70}
            color={colores.textoSecundario}
          />

          <Text style={styles.vacioTitulo}>
            No tienes contratos
          </Text>

          <Text style={styles.vacioTexto}>
            Cuando crees un contrato desde una
            solicitud aprobada, aparecerá aquí.
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={() => cargarContratos()}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color={colores.primarioTexto}
            />

            <Text
              style={styles.textoReintentar}
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
          {contratos.map(
            (contrato, indice) => {
              const contratoId =
                obtenerContratoId(contrato);

              const estado =
                obtenerEstado(contrato);

              const colores =
                obtenerColorEstado(estado);

              const imagen =
                obtenerImagen(contrato);

              const estaProcesando =
                procesandoId === contratoId;

              return (
                <View
                  key={
                    contratoId ||
                    `contrato-${indice}`
                  }
                  style={styles.tarjeta}
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
                        size={46}
                        color={
                          colores.textoSecundario
                        }
                      />

                      <Text
                        style={
                          styles.textoSinImagen
                        }
                      >
                        Sin fotografía
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.contenidoTarjeta
                    }
                  >
                    <View
                      style={
                        styles.encabezadoTarjeta
                      }
                    >
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
                            contrato
                          )}
                        </Text>

                        <Text
                          style={
                            styles.numeroContrato
                          }
                        >
                          Contrato #{contratoId}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.estado,
                          {
                            backgroundColor:
                              colores.fondo,
                          },
                        ]}
                      >
                        <Ionicons
                          name={colores.icono}
                          size={15}
                          color={colores.texto}
                        />

                        <Text
                          style={[
                            styles.estadoTexto,
                            {
                              color:
                                colores.texto,
                            },
                          ]}
                        >
                          {estado.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {obtenerDireccionPropiedad(
                      contrato
                    ) !== '' && (
                      <View
                        style={
                          styles.filaInformacion
                        }
                      >
                        <Ionicons
                          name="location-outline"
                          size={18}
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
                            contrato
                          )}
                        </Text>
                      </View>
                    )}

                    <View
                      style={styles.separador}
                    />

                    <Text
                      style={styles.subtitulo}
                    >
                      Inquilino
                    </Text>

                    <View
                      style={
                        styles.filaInformacion
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color={colores.primario}
                      />

                      <Text
                        style={
                          styles.textoInformacionPrincipal
                        }
                      >
                        {obtenerNombreInquilino(
                          contrato
                        )}
                      </Text>
                    </View>

                    {obtenerCorreoInquilino(
                      contrato
                    ) !== '' && (
                      <View
                        style={
                          styles.filaInformacion
                        }
                      >
                        <Ionicons
                          name="mail-outline"
                          size={18}
                          color={
                            colores.primario
                          }
                        />

                        <Text
                          style={
                            styles.textoInformacion
                          }
                        >
                          {obtenerCorreoInquilino(
                            contrato
                          )}
                        </Text>
                      </View>
                    )}

                    {obtenerTelefonoInquilino(
                      contrato
                    ) !== '' && (
                      <View
                        style={
                          styles.filaInformacion
                        }
                      >
                        <Ionicons
                          name="call-outline"
                          size={18}
                          color={
                            colores.primario
                          }
                        />

                        <Text
                          style={
                            styles.textoInformacion
                          }
                        >
                          {obtenerTelefonoInquilino(
                            contrato
                          )}
                        </Text>
                      </View>
                    )}

                    <View style={styles.fechas}>
                      <View style={styles.fechaItem}>
                        <Text
                          style={
                            styles.fechaEtiqueta
                          }
                        >
                          Inicio
                        </Text>

                        <Text
                          style={styles.fechaValor}
                        >
                          {mostrarFecha(
                            obtenerFechaInicio(
                              contrato
                            )
                          )}
                        </Text>
                      </View>

                      <Ionicons
                        name="arrow-forward"
                        size={21}
                        color={
                          colores.textoSecundario
                        }
                      />

                      <View style={styles.fechaItem}>
                        <Text
                          style={
                            styles.fechaEtiqueta
                          }
                        >
                          Finalización
                        </Text>

                        <Text
                          style={styles.fechaValor}
                        >
                          {mostrarFecha(
                            obtenerFechaFin(
                              contrato
                            )
                          )}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.montos}>
                      <View style={styles.montoItem}>
                        <Text
                          style={
                            styles.montoEtiqueta
                          }
                        >
                          Mensualidad
                        </Text>

                        <Text
                          style={
                            styles.montoMensual
                          }
                        >
                          L{' '}
                          {mostrarDinero(
                            obtenerMonto(contrato)
                          )}
                        </Text>
                      </View>

                      <View style={styles.montoItem}>
                        <Text
                          style={
                            styles.montoEtiqueta
                          }
                        >
                          Depósito
                        </Text>

                        <Text
                          style={
                            styles.montoDeposito
                          }
                        >
                          L{' '}
                          {mostrarDinero(
                            obtenerDeposito(
                              contrato
                            )
                          )}
                        </Text>
                      </View>
                    </View>

                    {estado === 'activo' && (
                      <View
                        style={
                          styles.botonesContenedor
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.botonAccion,
                            styles.botonCancelar,
                            estaProcesando &&
                              styles.botonDeshabilitado,
                          ]}
                          onPress={() =>
                            confirmarCambioEstado(
                              contrato,
                              'CANCELADO'
                            )
                          }
                          disabled={
                            estaProcesando
                          }
                        >
                          {estaProcesando ? (
                            <ActivityIndicator
                              size="small"
                              color={colores.primarioTexto}
                            />
                          ) : (
                            <>
                              <Ionicons
                                name="close-circle-outline"
                                size={19}
                                color={colores.primarioTexto}
                              />

                              <Text
                                style={
                                  styles.textoBoton
                                }
                              >
                                Cancelar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.botonAccion,
                            styles.botonFinalizar,
                            estaProcesando &&
                              styles.botonDeshabilitado,
                          ]}
                          onPress={() =>
                            confirmarCambioEstado(
                              contrato,
                              'FINALIZADO'
                            )
                          }
                          disabled={
                            estaProcesando
                          }
                        >
                          {estaProcesando ? (
                            <ActivityIndicator
                              size="small"
                              color={colores.primarioTexto}
                            />
                          ) : (
                            <>
                              <Ionicons
                                name="flag-outline"
                                size={19}
                                color={colores.primarioTexto}
                              />

                              <Text
                                style={
                                  styles.textoBoton
                                }
                              >
                                Finalizar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            }
          )}
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

  resumenSuperior: {
    backgroundColor: colores.tarjeta,
    padding: 17,
    margin: 16,
    marginBottom: 0,
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
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colores.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resumenTexto: {
    flex: 1,
    marginLeft: 13,
  },

  resumenTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  resumenDescripcion: {
    marginTop: 3,
    fontSize: 14,
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
    marginBottom: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.borde,
    boxShadow:
      '0px 3px 10px rgba(15, 23, 42, 0.10)',
    elevation: 3,
  },

  imagenPropiedad: {
    width: '100%',
    height: 185,
    backgroundColor: colores.borde,
  },

  sinImagen: {
    height: 165,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.campo,
  },

  textoSinImagen: {
    marginTop: 6,
    color: colores.textoSecundario,
  },

  contenidoTarjeta: {
    padding: 17,
  },

  encabezadoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },

  tituloContenedor: {
    flex: 1,
  },

  tituloPropiedad: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  numeroContrato: {
    marginTop: 4,
    fontSize: 12,
    color: colores.textoSecundario,
  },

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  filaInformacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },

  textoInformacion: {
    flex: 1,
    fontSize: 14,
    color: colores.textoSecundario,
  },

  textoInformacionPrincipal: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },

  separador: {
    height: 1,
    backgroundColor: colores.borde,
    marginVertical: 15,
  },

  subtitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  fechas: {
    marginTop: 16,
    padding: 13,
    borderRadius: RADIO.sm,
    backgroundColor: colores.fondo,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fechaItem: {
    flex: 1,
    alignItems: 'center',
  },

  fechaEtiqueta: {
    fontSize: 11,
    color: colores.textoSecundario,
  },

  fechaValor: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  montos: {
    marginTop: 13,
    flexDirection: 'row',
    gap: 10,
  },

  montoItem: {
    flex: 1,
    padding: 12,
    borderRadius: RADIO.sm,
    backgroundColor: colores.exitoClaro,
  },

  montoEtiqueta: {
    fontSize: 11,
    color: colores.textoSecundario,
  },

  montoMensual: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: 'bold',
    color: colores.exito,
  },

  montoDeposito: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  botonesContenedor: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  botonAccion: {
    flex: 1,
    minHeight: 46,
    borderRadius: RADIO.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  botonCancelar: {
    backgroundColor: colores.peligro,
  },

  botonFinalizar: {
    backgroundColor: colores.primario,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.primarioTexto,
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
