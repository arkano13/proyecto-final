import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

import {
  API_BASE_URL,
  API_URLS,
} from '../config/config';

import { RADIO } from '../estilos/globales';
import { useTema } from '../context/TemaContext';
import useActualizacionAutomatica from '../hooks/useActualizacionAutomatica';

export default function MiContrato({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;

  const [contratos, setContratos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  const obtenerInquilinoId =
    useCallback(() => {
      return Number(
        usuario?.id ||
          usuario?.usuario_id ||
          0
      );
    }, [usuario]);

  const cargarContratos =
    useCallback(async (
      mostrarCarga = true
    ) => {
      const inquilinoId =
        obtenerInquilinoId();

      if (!inquilinoId) {
        setContratos([]);

        setError(
          'No se pudo identificar al usuario.'
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
          API_URLS
            .LISTAR_CONTRATOS_INQUILINO,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept: 'application/json',
            },

            body: JSON.stringify({
              inquilino_id:
                inquilinoId,
            }),
          }
        );

        const textoRespuesta =
          await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(
            textoRespuesta
          );
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
        } else if (
          Array.isArray(datos.data)
        ) {
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
            'Ocurrió un error al cargar el contrato.'
        );
      } finally {
        setCargando(false);
      }
    }, [obtenerInquilinoId]);

  useActualizacionAutomatica(
    cargarContratos,
    20
  );

  const obtenerEstado = (contrato) => {
    return String(
      contrato?.estado ||
        contrato?.contrato_estado ||
        ''
    ).toLowerCase();
  };

  const obtenerFecha = (
    contrato,
    tipoFecha
  ) => {
    if (tipoFecha === 'inicio') {
      return (
        contrato?.fecha_inicio ||
        contrato?.contrato_fecha_inicio ||
        ''
      );
    }

    return (
      contrato?.fecha_fin ||
      contrato?.contrato_fecha_fin ||
      ''
    );
  };

  const convertirFecha = (fecha) => {
    if (!fecha) {
      return null;
    }

    const fechaObjeto = new Date(
      `${String(fecha).substring(
        0,
        10
      )}T00:00:00`
    );

    if (
      Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      return null;
    }

    return fechaObjeto;
  };

  const mostrarFecha = (fecha) => {
    const fechaObjeto =
      convertirFecha(fecha);

    if (!fechaObjeto) {
      return (
        fecha || 'No disponible'
      );
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

  const obtenerProgreso = (
    contrato
  ) => {
    const inicio = convertirFecha(
      obtenerFecha(
        contrato,
        'inicio'
      )
    );

    const fin = convertirFecha(
      obtenerFecha(contrato, 'fin')
    );

    if (!inicio || !fin) {
      return {
        porcentaje: 0,
        diasRestantes: 0,
      };
    }

    const ahora = new Date();

    ahora.setHours(0, 0, 0, 0);

    const totalMilisegundos =
      fin.getTime() -
      inicio.getTime();

    const transcurrido =
      ahora.getTime() -
      inicio.getTime();

    const diaMilisegundos =
      1000 * 60 * 60 * 24;

    const diasRestantes = Math.max(
      0,
      Math.ceil(
        (fin.getTime() -
          ahora.getTime()) /
          diaMilisegundos
      )
    );

    if (totalMilisegundos <= 0) {
      return {
        porcentaje: 100,
        diasRestantes,
      };
    }

    const porcentaje = Math.min(
      100,
      Math.max(
        0,
        (transcurrido /
          totalMilisegundos) *
          100
      )
    );

    return {
      porcentaje,
      diasRestantes,
    };
  };

  const obtenerMonto = (contrato) => {
    return Number(
      contrato?.monto_mensual ||
        contrato
          ?.contrato_monto_mensual ||
        0
    );
  };

  const obtenerDeposito = (
    contrato
  ) => {
    return Number(
      contrato?.deposito ||
        contrato?.contrato_deposito ||
        0
    );
  };

  const mostrarDinero = (cantidad) => {
    const numero = Number(
      cantidad || 0
    );

    return numero.toLocaleString(
      'es-HN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const obtenerTituloPropiedad = (
    contrato
  ) => {
    return (
      contrato?.propiedad?.titulo ||
      contrato?.propiedad
        ?.propiedad_titulo ||
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
      'Dirección no disponible'
    );
  };

  const obtenerImagen = (contrato) => {
    const ruta =
      contrato?.propiedad?.imagen ||
      contrato?.propiedad?.foto ||
      contrato?.propiedad
        ?.imagen_ruta ||
      contrato?.propiedad
        ?.propiedad_img_ruta ||
      contrato?.propiedad_imagen ||
      '';

    if (!ruta) {
      return null;
    }

    if (
      String(ruta).startsWith(
        'http://'
      ) ||
      String(ruta).startsWith(
        'https://'
      )
    ) {
      return String(ruta);
    }

    const rutaLimpia =
      String(ruta).replace(
        /^\/+/,
        ''
      );

    return `${API_BASE_URL}/${rutaLimpia}`;
  };

  const obtenerNombreArrendador = (
    contrato
  ) => {
    return (
      contrato?.arrendador?.nombre ||
      contrato?.arrendador
        ?.usuario_nombrecomp ||
      contrato?.arrendador_nombre ||
      'Arrendador'
    );
  };

  const obtenerCorreoArrendador = (
    contrato
  ) => {
    return (
      contrato?.arrendador?.correo ||
      contrato?.arrendador?.email ||
      contrato?.arrendador
        ?.usuario_correo ||
      contrato?.arrendador_correo ||
      ''
    );
  };

  const obtenerTelefonoArrendador = (
    contrato
  ) => {
    return (
      contrato?.arrendador?.telefono ||
      contrato?.arrendador
        ?.usuario_telefono ||
      contrato?.arrendador_telefono ||
      ''
    );
  };

  const obtenerColorEstado = (
    estado
  ) => {
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

  const agregarRecordatorioCalendario =
    async (contrato) => {
      if (Platform.OS === 'web') {
        window.alert(
          'El calendario debe probarse desde un teléfono Android o iPhone.'
        );

        return;
      }

      const fechaFin = convertirFecha(
        obtenerFecha(
          contrato,
          'fin'
        )
      );

      if (!fechaFin) {
        Alert.alert(
          'Fecha no disponible',
          'El contrato no tiene una fecha de finalización válida.'
        );

        return;
      }

      fechaFin.setHours(
        9,
        0,
        0,
        0
      );

      const fechaFinalEvento =
        new Date(
          fechaFin.getTime() +
            60 * 60 * 1000
        );

      try {
        const resultado =
          await Calendar
            .createEventInCalendarAsync(
              {
                title:
                  'Finalización de contrato - RentaFácil',

                startDate: fechaFin,

                endDate:
                  fechaFinalEvento,

                location:
                  obtenerDireccionPropiedad(
                    contrato
                  ),

                notes:
                  'Finalización del contrato de ' +
                  obtenerTituloPropiedad(
                    contrato
                  ) +
                  '. Mensualidad: L ' +
                  mostrarDinero(
                    obtenerMonto(
                      contrato
                    )
                  ) +
                  '.',

                alarms: [
                  {
                    relativeOffset:
                      -1440,
                  },
                ],
              }
            );

        if (
          resultado?.action ===
          'saved'
        ) {
          Alert.alert(
            'Recordatorio guardado',
            'El evento se agregó al calendario del dispositivo.'
          );
        }
      } catch (errorCalendario) {
        console.error(
          'Error al abrir el calendario:',
          errorCalendario
        );

        Alert.alert(
          'No se pudo abrir el calendario',
          'Verifica que el dispositivo tenga una aplicación de calendario.'
        );
      }
    };

  const contratoActivo =
    contratos.find(
      (contrato) =>
        obtenerEstado(contrato) ===
        'activo'
    );

  const contratosAnteriores =
    contratos.filter(
      (contrato) =>
        obtenerEstado(contrato) !==
        'activo'
    );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={colores.primario}
        />

        <Text
          style={styles.textoCargando}
        >
          Cargando contrato...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View
        style={styles.encabezado}
      >
        <View
          style={
            styles.encabezadoSuperior
          }
        >
          <TouchableOpacity
            style={
              styles.botonEncabezado
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                colores.primarioTexto
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.botonEncabezado
            }
            onPress={cargarContratos}
          >
            <Ionicons
              name="refresh"
              size={23}
              color={
                colores.primarioTexto
              }
            />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.tituloPantalla}
        >
          Mi contrato
        </Text>

        <Text
          style={
            styles.subtituloPantalla
          }
        >
          Información de tu alquiler
        </Text>
      </View>

      {error !== '' ? (
        <View
          style={styles.estadoPantalla}
        >
          <Ionicons
            name="alert-circle-outline"
            size={55}
            color={colores.peligro}
          />

          <Text
            style={styles.errorTexto}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.botonReintentar
            }
            onPress={cargarContratos}
          >
            <Text
              style={
                styles.textoReintentar
              }
            >
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : !contratoActivo ? (
        <View
          style={styles.estadoPantalla}
        >
          <Ionicons
            name="document-text-outline"
            size={70}
            color={
              colores.textoSecundario
            }
          />

          <Text
            style={
              styles.sinContratoTitulo
            }
          >
            No tienes un contrato activo
          </Text>

          <Text
            style={
              styles.sinContratoDescripcion
            }
          >
            Cuando el arrendador cree tu
            contrato, aparecerá en esta
            pantalla.
          </Text>

          <TouchableOpacity
            style={
              styles.botonReintentar
            }
            onPress={cargarContratos}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color={
                colores.primarioTexto
              }
            />

            <Text
              style={
                styles.textoReintentar
              }
            >
              Actualizar
            </Text>
          </TouchableOpacity>

          {contratosAnteriores.length >
            0 && (
            <View
              style={
                styles.historialResumen
              }
            >
              <Text
                style={
                  styles.historialResumenTexto
                }
              >
                Tienes{' '}
                {
                  contratosAnteriores.length
                }{' '}
                {contratosAnteriores.length ===
                1
                  ? 'contrato anterior'
                  : 'contratos anteriores'}
                .
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            styles.contenido
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {(() => {
            const imagen =
              obtenerImagen(
                contratoActivo
              );

            const progreso =
              obtenerProgreso(
                contratoActivo
              );

            const estado =
              obtenerEstado(
                contratoActivo
              );

            const colorEstado =
              obtenerColorEstado(
                estado
              );

            return (
              <>
                <View
                  style={
                    styles.tarjetaPropiedad
                  }
                >
                  {imagen ? (
                    <Image
                      source={{
                        uri: imagen,
                      }}
                      style={
                        styles.imagenPropiedad
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={
                        styles.sinImagen
                      }
                    >
                      <Ionicons
                        name="home-outline"
                        size={55}
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
                      styles.informacionPropiedad
                    }
                  >
                    <View
                      style={
                        styles.tituloPropiedadFila
                      }
                    >
                      <Text
                        style={
                          styles.tituloPropiedad
                        }
                      >
                        {obtenerTituloPropiedad(
                          contratoActivo
                        )}
                      </Text>

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
                            styles.estadoTexto,
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

                    <View
                      style={
                        styles.filaInformacion
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={19}
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
                          contratoActivo
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={styles.seccion}
                >
                  <Text
                    style={
                      styles.seccionTitulo
                    }
                  >
                    Vigencia del contrato
                  </Text>

                  <View
                    style={
                      styles.fechasFila
                    }
                  >
                    <View
                      style={
                        styles.fechaItem
                      }
                    >
                      <View
                        style={
                          styles.iconoFecha
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={21}
                          color={
                            colores.primario
                          }
                        />
                      </View>

                      <Text
                        style={
                          styles.fechaEtiqueta
                        }
                      >
                        Inicio
                      </Text>

                      <Text
                        style={
                          styles.fechaValor
                        }
                      >
                        {mostrarFecha(
                          obtenerFecha(
                            contratoActivo,
                            'inicio'
                          )
                        )}
                      </Text>
                    </View>

                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color={
                        colores.textoSecundario
                      }
                    />

                    <View
                      style={
                        styles.fechaItem
                      }
                    >
                      <View
                        style={
                          styles.iconoFecha
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={21}
                          color={
                            colores.primario
                          }
                        />
                      </View>

                      <Text
                        style={
                          styles.fechaEtiqueta
                        }
                      >
                        Finalización
                      </Text>

                      <Text
                        style={
                          styles.fechaValor
                        }
                      >
                        {mostrarFecha(
                          obtenerFecha(
                            contratoActivo,
                            'fin'
                          )
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.progresoContenedor
                    }
                  >
                    <View
                      style={
                        styles.progresoBarra
                      }
                    >
                      <View
                        style={[
                          styles.progresoRelleno,
                          {
                            width: `${progreso.porcentaje}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.progresoTexto
                      }
                    >
                      {
                        progreso.diasRestantes
                      }{' '}
                      {progreso.diasRestantes ===
                      1
                        ? 'día restante'
                        : 'días restantes'}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.seccion}
                >
                  <Text
                    style={
                      styles.seccionTitulo
                    }
                  >
                    Información de pago
                  </Text>

                  <View
                    style={styles.pagoFila}
                  >
                    <View>
                      <Text
                        style={
                          styles.pagoEtiqueta
                        }
                      >
                        Mensualidad
                      </Text>

                      <Text
                        style={
                          styles.pagoDescripcion
                        }
                      >
                        Monto mensual del
                        alquiler
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.montoPrincipal
                      }
                    >
                      L{' '}
                      {mostrarDinero(
                        obtenerMonto(
                          contratoActivo
                        )
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.separador
                    }
                  />

                  <View
                    style={styles.pagoFila}
                  >
                    <View>
                      <Text
                        style={
                          styles.pagoEtiqueta
                        }
                      >
                        Depósito
                      </Text>

                      <Text
                        style={
                          styles.pagoDescripcion
                        }
                      >
                        Depósito registrado
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.montoDeposito
                      }
                    >
                      L{' '}
                      {mostrarDinero(
                        obtenerDeposito(
                          contratoActivo
                        )
                      )}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.seccion}
                >
                  <Text
                    style={
                      styles.seccionTitulo
                    }
                  >
                    Datos del arrendador
                  </Text>

                  <View
                    style={
                      styles.arrendadorEncabezado
                    }
                  >
                    <View
                      style={styles.avatar}
                    >
                      <Ionicons
                        name="person"
                        size={25}
                        color={
                          colores.primario
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.arrendadorInformacion
                      }
                    >
                      <Text
                        style={
                          styles.arrendadorNombre
                        }
                      >
                        {obtenerNombreArrendador(
                          contratoActivo
                        )}
                      </Text>

                      <Text
                        style={
                          styles.arrendadorEtiqueta
                        }
                      >
                        Propietario
                      </Text>
                    </View>
                  </View>

                  {obtenerCorreoArrendador(
                    contratoActivo
                  ) !== '' && (
                    <View
                      style={
                        styles.filaInformacion
                      }
                    >
                      <Ionicons
                        name="mail-outline"
                        size={19}
                        color={
                          colores.primario
                        }
                      />

                      <Text
                        style={
                          styles.textoInformacion
                        }
                      >
                        {obtenerCorreoArrendador(
                          contratoActivo
                        )}
                      </Text>
                    </View>
                  )}

                  {obtenerTelefonoArrendador(
                    contratoActivo
                  ) !== '' && (
                    <View
                      style={
                        styles.filaInformacion
                      }
                    >
                      <Ionicons
                        name="call-outline"
                        size={19}
                        color={
                          colores.primario
                        }
                      />

                      <Text
                        style={
                          styles.textoInformacion
                        }
                      >
                        {obtenerTelefonoArrendador(
                          contratoActivo
                        )}
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={styles.seccion}
                >
                  <Text
                    style={
                      styles.seccionTitulo
                    }
                  >
                    Recordatorio
                  </Text>

                  <Text
                    style={
                      styles.recordatorioDescripcion
                    }
                  >
                    Guarda en el calendario del
                    teléfono la fecha de
                    finalización del contrato.
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.botonCalendario
                    }
                    onPress={() =>
                      agregarRecordatorioCalendario(
                        contratoActivo
                      )
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color={
                        colores.primarioTexto
                      }
                    />

                    <Text
                      style={
                        styles.textoBotonCalendario
                      }
                    >
                      Agregar al calendario
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={
                    styles.numeroContrato
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color={
                      colores.textoSecundario
                    }
                  />

                  <Text
                    style={
                      styles.numeroContratoTexto
                    }
                  >
                    Contrato #
                    {contratoActivo?.id ||
                      contratoActivo
                        ?.contrato_id}
                  </Text>
                </View>
              </>
            );
          })()}
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

    botonEncabezado: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.16)',
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

    contenido: {
      padding: 17,
      paddingBottom: 40,
    },

    tarjetaPropiedad: {
      backgroundColor: colores.tarjeta,
      borderRadius: RADIO.lg,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.borde,
      boxShadow:
        '0px 3px 10px rgba(15, 23, 42, 0.10)',
      elevation: 3,
    },

    imagenPropiedad: {
      width: '100%',
      height: 190,
      backgroundColor: colores.borde,
    },

    sinImagen: {
      height: 170,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colores.campo,
    },

    textoSinImagen: {
      marginTop: 7,
      color: colores.textoSecundario,
    },

    informacionPropiedad: {
      padding: 17,
    },

    tituloPropiedadFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
    },

    tituloPropiedad: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
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

    seccion: {
      backgroundColor: colores.tarjeta,
      borderRadius: RADIO.lg,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.borde,
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    seccionTitulo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colores.primario,
      marginBottom: 16,
    },

    fechasFila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    fechaItem: {
      flex: 1,
      alignItems: 'center',
    },

    iconoFecha: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 7,
    },

    fechaEtiqueta: {
      fontSize: 12,
      color: colores.textoSecundario,
    },

    fechaValor: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
    },

    progresoContenedor: {
      marginTop: 20,
    },

    progresoBarra: {
      height: 9,
      borderRadius: 5,
      overflow: 'hidden',
      backgroundColor: colores.borde,
    },

    progresoRelleno: {
      height: '100%',
      borderRadius: 5,
      backgroundColor: colores.primario,
    },

    progresoTexto: {
      marginTop: 7,
      fontSize: 13,
      textAlign: 'right',
      color: colores.textoSecundario,
    },

    pagoFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },

    pagoEtiqueta: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
    },

    pagoDescripcion: {
      fontSize: 12,
      color: colores.textoSecundario,
      marginTop: 3,
    },

    montoPrincipal: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colores.exito,
    },

    montoDeposito: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
    },

    separador: {
      height: 1,
      backgroundColor: colores.borde,
      marginVertical: 15,
    },

    arrendadorEncabezado: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        colores.primarioClaro,
    },

    arrendadorInformacion: {
      flex: 1,
      marginLeft: 12,
    },

    arrendadorNombre: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
    },

    arrendadorEtiqueta: {
      marginTop: 2,
      fontSize: 13,
      color: colores.exito,
    },

    recordatorioDescripcion: {
      marginBottom: 15,
      fontSize: 14,
      lineHeight: 20,
      color: colores.textoSecundario,
    },

    botonCalendario: {
      minHeight: 48,
      borderRadius: RADIO.sm,
      backgroundColor: colores.primario,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },

    textoBotonCalendario: {
      color: colores.primarioTexto,
      fontSize: 15,
      fontWeight: 'bold',
    },

    numeroContrato: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7,
      marginTop: 2,
    },

    numeroContratoTexto: {
      fontSize: 13,
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
      textAlign: 'center',
      fontSize: 15,
      color: colores.peligro,
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

    sinContratoTitulo: {
      marginTop: 16,
      fontSize: 21,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colores.textoPrincipal,
    },

    sinContratoDescripcion: {
      marginTop: 8,
      marginBottom: 20,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: colores.textoSecundario,
    },

    historialResumen: {
      marginTop: 20,
      padding: 12,
      borderRadius: RADIO.sm,
      backgroundColor:
        colores.primarioClaro,
    },

    historialResumenTexto: {
      fontSize: 13,
      color: colores.primario,
    },
  });
