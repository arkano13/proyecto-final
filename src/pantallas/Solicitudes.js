import React, {
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, API_URLS } from '../config/config';
import {
  RADIO,
} from '../estilos/globales';
import { useTema } from '../context/TemaContext';
import useActualizacionAutomatica from '../hooks/useActualizacionAutomatica';

export default function Solicitudes({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;

  const [solicitudes, setSolicitudes] = useState([]);
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

  const obtenerSolicitudId = (solicitud) => {
    return Number(
      solicitud?.id ||
        solicitud?.solicitud_id ||
        0
    );
  };

  const cargarSolicitudes = useCallback(
    async (mostrarCarga = true) => {
      const arrendadorId = obtenerArrendadorId();

      if (!arrendadorId) {
        setSolicitudes([]);
        setError('No se pudo identificar al usuario.');
        setCargando(false);
        return;
      }

      try {
        if (mostrarCarga) {
          setCargando(true);
        }

        setError('');

        const respuesta = await fetch(
          API_URLS.LISTAR_SOLICITUDES_ARRENDADOR,
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

        const textoRespuesta = await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(textoRespuesta);
        } catch (errorJson) {
          console.log(
            'Respuesta recibida:',
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
              'No se pudieron cargar las solicitudes.'
          );
        }

        let lista = [];

        if (Array.isArray(datos)) {
          lista = datos;
        } else if (Array.isArray(datos.solicitudes)) {
          lista = datos.solicitudes;
        } else if (Array.isArray(datos.data)) {
          lista = datos.data;
        }

        setSolicitudes(lista);
      } catch (errorPeticion) {
        console.error(
          'Error al cargar solicitudes:',
          errorPeticion
        );

        setSolicitudes([]);

        setError(
          errorPeticion.message ||
            'Ocurrió un error al cargar las solicitudes.'
        );
      } finally {
        setCargando(false);
      }
    },
    [obtenerArrendadorId]
  );

  useActualizacionAutomatica(
    cargarSolicitudes,
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
    solicitud,
    nuevoEstado
  ) => {
    const solicitudId =
      obtenerSolicitudId(solicitud);

    const arrendadorId =
      obtenerArrendadorId();

    if (!solicitudId || !arrendadorId) {
      mostrarMensaje(
        'Error',
        'No se pudo identificar la solicitud o el usuario.'
      );

      return;
    }

    try {
      setProcesandoId(solicitudId);

      const respuesta = await fetch(
        API_URLS.CAMBIAR_ESTADO_SOLICITUD,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            solicitud_id: solicitudId,
            arrendador_id: arrendadorId,
            estado: nuevoEstado.toUpperCase(),
          }),
        }
      );

      const textoRespuesta = await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(textoRespuesta);
      } catch (errorJson) {
        console.log(
          'Respuesta recibida:',
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
            'No se pudo actualizar la solicitud.'
        );
      }

      await cargarSolicitudes(false);

      if (
        nuevoEstado.toLowerCase() === 'aprobada'
      ) {
        mostrarMensaje(
          'Solicitud aprobada',
          'La solicitud se aprobó correctamente. Ahora puedes crear el contrato.'
        );
      } else {
        mostrarMensaje(
          'Solicitud rechazada',
          'La solicitud se rechazó correctamente.'
        );
      }
    } catch (errorCambio) {
      console.error(
        'Error al cambiar estado:',
        errorCambio
      );

      mostrarMensaje(
        'Error',
        errorCambio.message ||
          'No se pudo actualizar la solicitud.'
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const cambiarEstado = (
    solicitud,
    nuevoEstado
  ) => {
    const esAprobacion =
      nuevoEstado.toLowerCase() === 'aprobada';

    const mensaje = esAprobacion
      ? '¿Deseas aprobar esta solicitud? La propiedad cambiará a ocupada.'
      : '¿Deseas rechazar esta solicitud?';

    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      const confirmado =
        window.confirm(mensaje);

      if (confirmado) {
        ejecutarCambioEstado(
          solicitud,
          nuevoEstado
        );
      }

      return;
    }

    Alert.alert(
      'Confirmar acción',
      mensaje,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: esAprobacion
            ? 'Aprobar'
            : 'Rechazar',
          style: esAprobacion
            ? 'default'
            : 'destructive',
          onPress: () =>
            ejecutarCambioEstado(
              solicitud,
              nuevoEstado
            ),
        },
      ]
    );
  };

  const abrirCrearContrato = (solicitud) => {
    navigation.navigate('CrearContrato', {
      usuario,
      solicitud,
    });
  };

  const obtenerEstado = (solicitud) => {
    return String(
      solicitud?.estado ||
        solicitud?.solicitud_estado ||
        'pendiente'
    ).toLowerCase();
  };

  const obtenerNombreInquilino = (
    solicitud
  ) => {
    return (
      solicitud?.inquilino?.nombre ||
      solicitud?.inquilino?.usuario_nombrecomp ||
      solicitud?.inquilino_nombre ||
      'Usuario'
    );
  };

  const obtenerCorreoInquilino = (
    solicitud
  ) => {
    return (
      solicitud?.inquilino?.correo ||
      solicitud?.inquilino?.email ||
      solicitud?.inquilino?.usuario_correo ||
      solicitud?.inquilino_correo ||
      ''
    );
  };

  const obtenerTelefonoInquilino = (
    solicitud
  ) => {
    return (
      solicitud?.inquilino?.telefono ||
      solicitud?.inquilino?.usuario_telefono ||
      solicitud?.inquilino_telefono ||
      ''
    );
  };

  const obtenerTituloPropiedad = (
    solicitud
  ) => {
    return (
      solicitud?.propiedad?.titulo ||
      solicitud?.propiedad?.propiedad_titulo ||
      solicitud?.propiedad_titulo ||
      'Propiedad'
    );
  };

  const obtenerDireccionPropiedad = (
    solicitud
  ) => {
    return (
      solicitud?.propiedad?.direccion ||
      solicitud?.propiedad?.propiedad_direccion ||
      solicitud?.propiedad_direccion ||
      ''
    );
  };

  const obtenerMensaje = (solicitud) => {
    return (
      solicitud?.mensaje ||
      solicitud?.solicitud_mensaje ||
      'Sin mensaje.'
    );
  };

  const obtenerFecha = (solicitud) => {
    const fecha =
      solicitud?.fecha ||
      solicitud?.fecha_creacion ||
      solicitud?.solicitud_fcreacion;

    if (!fecha) {
      return 'Fecha no disponible';
    }

    const fechaNormalizada =
      String(fecha).replace(' ', 'T');

    const fechaObjeto =
      new Date(fechaNormalizada);

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

  const obtenerImagen = (solicitud) => {
    const ruta =
      solicitud?.propiedad?.imagen ||
      solicitud?.propiedad?.foto ||
      solicitud?.propiedad?.imagen_ruta ||
      solicitud?.propiedad
        ?.propiedad_img_ruta ||
      solicitud?.propiedad_imagen ||
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

  const obtenerColorEstado = (estado) => {
    if (estado === 'aprobada') {
      return {
        fondo: colores.exitoClaro,
        texto: colores.exito,
        icono: 'checkmark-circle',
      };
    }

    if (estado === 'rechazada') {
      return {
        fondo: colores.peligroClaro,
        texto: colores.peligro,
        icono: 'close-circle',
      };
    }

    return {
      fondo: colores.advertenciaClaro,
      texto: colores.advertencia,
      icono: 'time',
    };
  };

  const solicitudesPendientes =
    solicitudes.filter(
      (solicitud) =>
        obtenerEstado(solicitud) ===
        'pendiente'
    ).length;

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={colores.primario}
        />

        <Text style={styles.textoCargando}>
          Cargando solicitudes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoSuperior}>
          <TouchableOpacity
            style={styles.botonRegresar}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colores.primarioTexto}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonRecargar}
            onPress={() =>
              cargarSolicitudes()
            }
          >
            <Ionicons
              name="refresh"
              size={23}
              color={colores.primarioTexto}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.tituloPantalla}>
          Solicitudes
        </Text>

        <Text style={styles.subtituloPantalla}>
          {solicitudesPendientes}{' '}
          {solicitudesPendientes === 1
            ? 'solicitud pendiente'
            : 'solicitudes pendientes'}
        </Text>
      </View>

      {error !== '' ? (
        <View style={styles.errorPrincipal}>
          <Ionicons
            name="alert-circle-outline"
            size={50}
            color={colores.peligro}
          />

          <Text style={styles.errorTexto}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={() =>
              cargarSolicitudes()
            }
          >
            <Text
              style={styles.textoReintentar}
            >
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : solicitudes.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons
            name="document-text-outline"
            size={70}
            color={colores.textoSecundario}
          />

          <Text style={styles.vacioTitulo}>
            No tienes solicitudes
          </Text>

          <Text
            style={styles.vacioDescripcion}
          >
            Las solicitudes de tus propiedades
            aparecerán aquí.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        >
          {solicitudes.map(
            (solicitud, indice) => {
              const solicitudId =
                obtenerSolicitudId(solicitud);

              const estado =
                obtenerEstado(solicitud);

              const colorEstado =
                obtenerColorEstado(estado);

              const imagen =
                obtenerImagen(solicitud);

              const estaProcesando =
                procesandoId === solicitudId;

              return (
                <View
                  key={
                    solicitudId ||
                    `solicitud-${indice}`
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
                        size={45}
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
                            solicitud
                          )}
                        </Text>

                        <Text
                          style={
                            styles.fechaSolicitud
                          }
                        >
                          Solicitud del{' '}
                          {obtenerFecha(
                            solicitud
                          )}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.estado,
                          {
                            backgroundColor:
                              colorEstado.fondo,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            colorEstado.icono
                          }
                          size={15}
                          color={
                            colorEstado.texto
                          }
                        />

                        <Text
                          style={[
                            styles.textoEstado,
                            {
                              color:
                                colorEstado.texto,
                            },
                          ]}
                        >
                          {estado.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {obtenerDireccionPropiedad(
                      solicitud
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
                            solicitud
                          )}
                        </Text>
                      </View>
                    )}

                    <View
                      style={styles.separador}
                    />

                    <Text style={styles.subtitulo}>
                      Datos del interesado
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
                          styles.textoInformacion
                        }
                      >
                        {obtenerNombreInquilino(
                          solicitud
                        )}
                      </Text>
                    </View>

                    {obtenerCorreoInquilino(
                      solicitud
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
                            solicitud
                          )}
                        </Text>
                      </View>
                    )}

                    {obtenerTelefonoInquilino(
                      solicitud
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
                            solicitud
                          )}
                        </Text>
                      </View>
                    )}

                    <View
                      style={
                        styles.mensajeContenedor
                      }
                    >
                      <Text
                        style={styles.mensajeTitulo}
                      >
                        Mensaje
                      </Text>

                      <Text
                        style={styles.mensajeTexto}
                      >
                        {obtenerMensaje(
                          solicitud
                        )}
                      </Text>
                    </View>

                    {estado === 'pendiente' && (
                      <View
                        style={
                          styles.botonesContenedor
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.botonAccion,
                            styles.botonRechazar,
                            estaProcesando &&
                              styles.botonDeshabilitado,
                          ]}
                          onPress={() =>
                            cambiarEstado(
                              solicitud,
                              'RECHAZADA'
                            )
                          }
                          disabled={
                            estaProcesando
                          }
                        >
                          {estaProcesando ? (
                            <ActivityIndicator
                              size="small"
                              color="#ffffff"
                            />
                          ) : (
                            <>
                              <Ionicons
                                name="close-circle-outline"
                                size={20}
                                color="#ffffff"
                              />

                              <Text
                                style={
                                  styles.textoBotonAccion
                                }
                              >
                                Rechazar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.botonAccion,
                            styles.botonAprobar,
                            estaProcesando &&
                              styles.botonDeshabilitado,
                          ]}
                          onPress={() =>
                            cambiarEstado(
                              solicitud,
                              'APROBADA'
                            )
                          }
                          disabled={
                            estaProcesando
                          }
                        >
                          {estaProcesando ? (
                            <ActivityIndicator
                              size="small"
                              color="#ffffff"
                            />
                          ) : (
                            <>
                              <Ionicons
                                name="checkmark-circle-outline"
                                size={20}
                                color="#ffffff"
                              />

                              <Text
                                style={
                                  styles.textoBotonAccion
                                }
                              >
                                Aprobar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {estado === 'aprobada' && (
                      <TouchableOpacity
                        style={
                          styles.botonCrearContrato
                        }
                        onPress={() =>
                          abrirCrearContrato(
                            solicitud
                          )
                        }
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={21}
                          color="#ffffff"
                        />

                        <Text
                          style={
                            styles.textoCrearContrato
                          }
                        >
                          Crear contrato
                        </Text>
                      </TouchableOpacity>
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

  encabezado: {
    backgroundColor: colores.primario,
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  encabezadoSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  botonRegresar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  botonRecargar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tituloPantalla: {
    color: colores.primarioTexto,
    fontSize: 24,
    fontWeight: 'bold',
  },

  subtituloPantalla: {
    color: colores.primarioTexto,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
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
    fontSize: 13,
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

  fechaSolicitud: {
    marginTop: 4,
    fontSize: 13,
    color: colores.textoSecundario,
  },

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },

  textoEstado: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  filaInformacion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },

  textoInformacion: {
    flex: 1,
    fontSize: 14,
    color: colores.textoSecundario,
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

  mensajeContenedor: {
    marginTop: 15,
    padding: 13,
    borderRadius: RADIO.sm,
    backgroundColor: colores.campo,
    borderLeftWidth: 4,
    borderLeftColor: colores.primario,
  },

  mensajeTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
    marginBottom: 5,
  },

  mensajeTexto: {
    fontSize: 14,
    lineHeight: 21,
    color: colores.textoSecundario,
  },

  botonesContenedor: {
    flexDirection: 'row',
    marginTop: 17,
    gap: 10,
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

  botonRechazar: {
    backgroundColor: colores.peligro,
  },

  botonAprobar: {
    backgroundColor: colores.exito,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBotonAccion: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  botonCrearContrato: {
    minHeight: 49,
    marginTop: 17,
    borderRadius: RADIO.sm,
    backgroundColor: colores.primario,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  textoCrearContrato: {
    color: colores.primarioTexto,
    fontSize: 15,
    fontWeight: 'bold',
  },

  errorPrincipal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  errorTexto: {
    marginTop: 12,
    marginBottom: 18,
    textAlign: 'center',
    fontSize: 15,
    color: colores.peligro,
  },

  botonReintentar: {
    backgroundColor: colores.primario,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIO.sm,
  },

  textoReintentar: {
    color: colores.primarioTexto,
    fontWeight: 'bold',
  },

  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  vacioTitulo: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  vacioDescripcion: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colores.textoSecundario,
  },
});