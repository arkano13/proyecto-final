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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL, API_URLS } from '../config/config';
import {
  COLORES,
  RADIO,
} from '../estilos/globales';

export default function MiContrato({
  route,
  navigation,
}) {
  const usuario = route?.params?.usuario;

  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const obtenerInquilinoId = useCallback(() => {
    return Number(
      usuario?.id ||
        usuario?.usuario_id ||
        0
    );
  }, [usuario]);

  const cargarContratos = useCallback(async () => {
    const inquilinoId = obtenerInquilinoId();

    if (!inquilinoId) {
      setContratos([]);
      setError(
        'No se pudo identificar al usuario.'
      );
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError('');

      const respuesta = await fetch(
        API_URLS.LISTAR_CONTRATOS_INQUILINO,
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
      } else if (Array.isArray(datos.contratos)) {
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
          'Ocurrió un error al cargar el contrato.'
      );
    } finally {
      setCargando(false);
    }
  }, [obtenerInquilinoId]);

  useFocusEffect(
    useCallback(() => {
      cargarContratos();
    }, [cargarContratos])
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
      `${String(fecha).substring(0, 10)}T00:00:00`
    );

    if (
      Number.isNaN(fechaObjeto.getTime())
    ) {
      return null;
    }

    return fechaObjeto;
  };

  const mostrarFecha = (fecha) => {
    const fechaObjeto = convertirFecha(fecha);

    if (!fechaObjeto) {
      return fecha || 'No disponible';
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

  const obtenerProgreso = (contrato) => {
    const inicio = convertirFecha(
      obtenerFecha(contrato, 'inicio')
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
      fin.getTime() - inicio.getTime();

    const transcurrido =
      ahora.getTime() - inicio.getTime();

    const diaMilisegundos =
      1000 * 60 * 60 * 24;

    const diasRestantes = Math.max(
      0,
      Math.ceil(
        (fin.getTime() - ahora.getTime()) /
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
        (transcurrido / totalMilisegundos) *
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
    const numero = Number(cantidad || 0);

    return numero.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
      'Dirección no disponible'
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

  const obtenerColorEstado = (estado) => {
    if (estado === 'activo') {
      return {
        fondo: COLORES.exitoClaro,
        texto: COLORES.exito,
        icono: 'checkmark-circle',
      };
    }

    if (estado === 'finalizado') {
      return {
        fondo: '#dbeafe',
        texto: '#2563eb',
        icono: 'flag',
      };
    }

    return {
      fondo: COLORES.peligroClaro,
      texto: COLORES.peligro,
      icono: 'close-circle',
    };
  };

  const contratoActivo = contratos.find(
    (contrato) =>
      obtenerEstado(contrato) === 'activo'
  );

  const contratosAnteriores =
    contratos.filter(
      (contrato) =>
        obtenerEstado(contrato) !== 'activo'
    );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={COLORES.primario}
        />

        <Text style={styles.textoCargando}>
          Cargando contrato...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoSuperior}>
          <TouchableOpacity
            style={styles.botonEncabezado}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonEncabezado}
            onPress={cargarContratos}
          >
            <Ionicons
              name="refresh"
              size={23}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.tituloPantalla}>
          Mi contrato
        </Text>

        <Text style={styles.subtituloPantalla}>
          Información de tu alquiler
        </Text>
      </View>

      {error !== '' ? (
        <View style={styles.estadoPantalla}>
          <Ionicons
            name="alert-circle-outline"
            size={55}
            color={COLORES.peligro}
          />

          <Text style={styles.errorTexto}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={cargarContratos}
          >
            <Text
              style={styles.textoReintentar}
            >
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : !contratoActivo ? (
        <View style={styles.estadoPantalla}>
          <Ionicons
            name="document-text-outline"
            size={70}
            color={COLORES.textoClaro}
          />

          <Text style={styles.sinContratoTitulo}>
            No tienes un contrato activo
          </Text>

          <Text
            style={
              styles.sinContratoDescripcion
            }
          >
            Cuando el arrendador cree tu contrato,
            aparecerá en esta pantalla.
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={cargarContratos}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color="#ffffff"
            />

            <Text
              style={styles.textoReintentar}
            >
              Actualizar
            </Text>
          </TouchableOpacity>

          {contratosAnteriores.length > 0 && (
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
                {contratosAnteriores.length}{' '}
                {contratosAnteriores.length === 1
                  ? 'contrato anterior'
                  : 'contratos anteriores'}
                .
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {(() => {
            const imagen =
              obtenerImagen(contratoActivo);

            const progreso =
              obtenerProgreso(contratoActivo);

            const estado =
              obtenerEstado(contratoActivo);

            const colorEstado =
              obtenerColorEstado(estado);

            return (
              <>
                <View
                  style={styles.tarjetaPropiedad}
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
                        size={55}
                        color={
                          COLORES.textoClaro
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
                          COLORES.textoSecundario
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

                <View style={styles.seccion}>
                  <Text
                    style={styles.seccionTitulo}
                  >
                    Vigencia del contrato
                  </Text>

                  <View style={styles.fechasFila}>
                    <View style={styles.fechaItem}>
                      <View
                        style={
                          styles.iconoFecha
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={21}
                          color={
                            COLORES.primario
                          }
                        />
                      </View>

                      <Text
                        style={styles.fechaEtiqueta}
                      >
                        Inicio
                      </Text>

                      <Text
                        style={styles.fechaValor}
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
                      color={COLORES.textoClaro}
                    />

                    <View style={styles.fechaItem}>
                      <View
                        style={
                          styles.iconoFecha
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={21}
                          color={
                            COLORES.primario
                          }
                        />
                      </View>

                      <Text
                        style={styles.fechaEtiqueta}
                      >
                        Finalización
                      </Text>

                      <Text
                        style={styles.fechaValor}
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
                      style={styles.progresoBarra}
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
                      style={styles.progresoTexto}
                    >
                      {progreso.diasRestantes}{' '}
                      {progreso.diasRestantes === 1
                        ? 'día restante'
                        : 'días restantes'}
                    </Text>
                  </View>
                </View>

                <View style={styles.seccion}>
                  <Text
                    style={styles.seccionTitulo}
                  >
                    Información de pago
                  </Text>

                  <View style={styles.pagoFila}>
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
                        Monto mensual del alquiler
                      </Text>
                    </View>

                    <Text
                      style={styles.montoPrincipal}
                    >
                      L{' '}
                      {mostrarDinero(
                        obtenerMonto(
                          contratoActivo
                        )
                      )}
                    </Text>
                  </View>

                  <View style={styles.separador} />

                  <View style={styles.pagoFila}>
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
                      style={styles.montoDeposito}
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

                <View style={styles.seccion}>
                  <Text
                    style={styles.seccionTitulo}
                  >
                    Datos del arrendador
                  </Text>

                  <View
                    style={
                      styles.arrendadorEncabezado
                    }
                  >
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={25}
                        color={COLORES.primario}
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
                          COLORES.primario
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
                          COLORES.primario
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

                <View style={styles.numeroContrato}>
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color={COLORES.textoSecundario}
                  />

                  <Text
                    style={
                      styles.numeroContratoTexto
                    }
                  >
                    Contrato #
                    {contratoActivo?.id ||
                      contratoActivo?.contrato_id}
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

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.fondo,
  },

  textoCargando: {
    marginTop: 12,
    fontSize: 15,
    color: COLORES.textoSecundario,
  },

  encabezado: {
    backgroundColor: COLORES.primario,
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
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  tituloPantalla: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  subtituloPantalla: {
    color: COLORES.primarioClaro,
    fontSize: 14,
    marginTop: 4,
  },

  contenido: {
    padding: 17,
    paddingBottom: 40,
  },

  tarjetaPropiedad: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.lg,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    boxShadow:
      '0px 3px 10px rgba(15, 23, 42, 0.10)',
    elevation: 3,
  },

  imagenPropiedad: {
    width: '100%',
    height: 190,
    backgroundColor: COLORES.borde,
  },

  sinImagen: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },

  textoSinImagen: {
    marginTop: 7,
    color: COLORES.textoClaro,
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
    color: COLORES.textoPrincipal,
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
    color: COLORES.textoSecundario,
  },

  seccion: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    boxShadow:
      '0px 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 2,
  },

  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORES.primario,
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
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  fechaEtiqueta: {
    fontSize: 12,
    color: COLORES.textoClaro,
  },

  fechaValor: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
  },

  progresoContenedor: {
    marginTop: 20,
  },

  progresoBarra: {
    height: 9,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: COLORES.borde,
  },

  progresoRelleno: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: COLORES.primario,
  },

  progresoTexto: {
    marginTop: 7,
    fontSize: 13,
    textAlign: 'right',
    color: COLORES.textoSecundario,
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
    color: COLORES.textoPrincipal,
  },

  pagoDescripcion: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 3,
  },

  montoPrincipal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORES.exito,
  },

  montoDeposito: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
  },

  separador: {
    height: 1,
    backgroundColor: COLORES.borde,
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
    backgroundColor: COLORES.primarioClaro,
  },

  arrendadorInformacion: {
    flex: 1,
    marginLeft: 12,
  },

  arrendadorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
  },

  arrendadorEtiqueta: {
    marginTop: 2,
    fontSize: 13,
    color: COLORES.exito,
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
    color: COLORES.textoSecundario,
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
    color: COLORES.peligro,
  },

  botonReintentar: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: RADIO.sm,
    backgroundColor: COLORES.primario,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  textoReintentar: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  sinContratoTitulo: {
    marginTop: 16,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORES.textoPrincipal,
  },

  sinContratoDescripcion: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: COLORES.textoSecundario,
  },

  historialResumen: {
    marginTop: 20,
    padding: 12,
    borderRadius: RADIO.sm,
    backgroundColor: '#e0f2fe',
  },

  historialResumenTexto: {
    fontSize: 13,
    color: '#0369a1',
  },
});