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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { API_URLS } from '../config/config';

import {
  RADIO,
} from '../estilos/globales';
import { useTema } from '../context/TemaContext';

export default function Reportes({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario =
    route?.params?.usuario;

  const [resumen, setResumen] =
    useState(null);

  const [
    ingresosMensuales,
    setIngresosMensuales,
  ] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  const obtenerArrendadorId =
    useCallback(() => {
      return Number(
        usuario?.id ||
          usuario?.usuario_id ||
          0
      );
    }, [usuario]);

  const cargarReporte =
    useCallback(async () => {
      const arrendadorId =
        obtenerArrendadorId();

      if (!arrendadorId) {
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
          API_URLS
            .REPORTE_RESUMEN_ARRENDADOR,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body: JSON.stringify({
              arrendador_id:
                arrendadorId,
            }),
          }
        );

        const texto =
          await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(texto);
        } catch (errorJson) {
          console.log(
            'Respuesta del reporte:',
            texto
          );

          throw new Error(
            'El servidor respondió incorrectamente.'
          );
        }

        if (
          !respuesta.ok ||
          (!datos.exito &&
            !datos.success)
        ) {
          throw new Error(
            datos.mensaje ||
              'No se pudo cargar el reporte.'
          );
        }

        setResumen(
          datos.resumen || null
        );

        setIngresosMensuales(
          Array.isArray(
            datos.ingresos_mensuales
          )
            ? datos.ingresos_mensuales
            : []
        );
      } catch (errorPeticion) {
        console.error(
          'Error al cargar reporte:',
          errorPeticion
        );

        setError(
          errorPeticion.message ||
            'No se pudo cargar el reporte.'
        );
      } finally {
        setCargando(false);
      }
    }, [obtenerArrendadorId]);

  useFocusEffect(
    useCallback(() => {
      cargarReporte();
    }, [cargarReporte])
  );

  const mostrarDinero = (cantidad) => {
    return Number(
      cantidad || 0
    ).toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const obtenerMayorIngreso = () => {
    if (
      ingresosMensuales.length === 0
    ) {
      return 0;
    }

    return Math.max(
      ...ingresosMensuales.map(
        (item) =>
          Number(item.total || 0)
      )
    );
  };

  const obtenerPorcentaje = (
    valor,
    total
  ) => {
    const numeroValor =
      Number(valor || 0);

    const numeroTotal =
      Number(total || 0);

    if (numeroTotal <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (numeroValor / numeroTotal) *
          100
      )
    );
  };

  const TarjetaMetrica = ({
    titulo,
    valor,
    descripcion,
    icono,
    color,
    fondo,
  }) => {
    return (
      <View style={styles.tarjetaMetrica}>
        <View
          style={[
            styles.iconoMetrica,
            {
              backgroundColor: fondo,
            },
          ]}
        >
          <Ionicons
            name={icono}
            size={25}
            color={color}
          />
        </View>

        <Text
          style={styles.valorMetrica}
        >
          {valor}
        </Text>

        <Text
          style={styles.tituloMetrica}
        >
          {titulo}
        </Text>

        <Text
          style={
            styles.descripcionMetrica
          }
        >
          {descripcion}
        </Text>
      </View>
    );
  };

  const BarraEstado = ({
    nombre,
    valor,
    total,
    color,
  }) => {
    const porcentaje =
      obtenerPorcentaje(
        valor,
        total
      );

    return (
      <View style={styles.estadoItem}>
        <View
          style={styles.estadoEncabezado}
        >
          <Text
            style={styles.estadoNombre}
          >
            {nombre}
          </Text>

          <Text
            style={styles.estadoValor}
          >
            {valor}
          </Text>
        </View>

        <View
          style={styles.barraFondo}
        >
          <View
            style={[
              styles.barraRelleno,
              {
                width: `${porcentaje}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

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
          Cargando estadísticas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.pantalla}>
        <View style={styles.encabezado}>
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
              color={colores.primarioTexto}
            />
          </TouchableOpacity>

          <Text
            style={styles.tituloPantalla}
          >
            Reportes
          </Text>
        </View>

        <View style={styles.centro}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={colores.peligro}
          />

          <Text style={styles.errorTexto}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={cargarReporte}
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
      </View>
    );
  }

  const propiedades =
    resumen?.propiedades || {};

  const solicitudes =
    resumen?.solicitudes || {};

  const contratos =
    resumen?.contratos || {};

  const pagos =
    resumen?.pagos || {};

  const mayorIngreso =
    obtenerMayorIngreso();

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
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
              color={colores.primarioTexto}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.botonEncabezado
            }
            onPress={cargarReporte}
          >
            <Ionicons
              name="refresh"
              size={23}
              color={colores.primarioTexto}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.tituloPantalla}
        >
          Reportes
        </Text>

        <Text
          style={
            styles.subtituloPantalla
          }
        >
          Resumen de tus propiedades
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.contenido
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.tituloSeccion}>
          Resumen general
        </Text>

        <View
          style={
            styles.metricasContenedor
          }
        >
          <TarjetaMetrica
            titulo="Ingresos"
            valor={`L ${mostrarDinero(
              pagos.ingresos
            )}`}
            descripcion="Pagos registrados"
            icono="cash-outline"
            color={colores.exito}
            fondo={colores.exitoClaro}
          />

          <TarjetaMetrica
            titulo="Propiedades"
            valor={
              propiedades.total || 0
            }
            descripcion="Propiedades creadas"
            icono="home-outline"
            color={colores.primario}
            fondo={colores.primarioClaro}
          />

          <TarjetaMetrica
            titulo="Contratos"
            valor={
              contratos.activos || 0
            }
            descripcion="Contratos activos"
            icono="document-text-outline"
            color={
              colores.oscuro
                ? '#c4b5fd'
                : '#7c3aed'
            }
            fondo={
              colores.oscuro
                ? '#4c1d95'
                : '#ede9fe'
            }
          />

          <TarjetaMetrica
            titulo="Solicitudes"
            valor={
              solicitudes.pendientes ||
              0
            }
            descripcion="Pendientes"
            icono="time-outline"
            color={colores.advertencia}
            fondo={colores.advertenciaClaro}
          />
        </View>

        <View style={styles.seccion}>
          <Text
            style={styles.seccionTitulo}
          >
            Estado de propiedades
          </Text>

          <BarraEstado
            nombre="Disponibles"
            valor={
              propiedades.disponibles ||
              0
            }
            total={
              propiedades.total || 0
            }
            color={colores.exito}
          />

          <BarraEstado
            nombre="Ocupadas"
            valor={
              propiedades.ocupadas || 0
            }
            total={
              propiedades.total || 0
            }
            color={colores.primario}
          />

          <BarraEstado
            nombre="Inactivas"
            valor={
              propiedades.inactivas || 0
            }
            total={
              propiedades.total || 0
            }
            color={colores.textoSecundario}
          />
        </View>

        <View style={styles.seccion}>
          <Text
            style={styles.seccionTitulo}
          >
            Estado de solicitudes
          </Text>

          <BarraEstado
            nombre="Pendientes"
            valor={
              solicitudes.pendientes ||
              0
            }
            total={
              solicitudes.total || 0
            }
            color={colores.advertencia}
          />

          <BarraEstado
            nombre="Aprobadas"
            valor={
              solicitudes.aprobadas || 0
            }
            total={
              solicitudes.total || 0
            }
            color={colores.exito}
          />

          <BarraEstado
            nombre="Rechazadas"
            valor={
              solicitudes.rechazadas ||
              0
            }
            total={
              solicitudes.total || 0
            }
            color={colores.peligro}
          />
        </View>

        <View style={styles.seccion}>
          <Text
            style={styles.seccionTitulo}
          >
            Contratos
          </Text>

          <View
            style={styles.contratosFila}
          >
            <View
              style={styles.contratoDato}
            >
              <Text
                style={
                  styles.contratoValor
                }
              >
                {contratos.activos || 0}
              </Text>

              <Text
                style={
                  styles.contratoEtiqueta
                }
              >
                Activos
              </Text>
            </View>

            <View
              style={styles.contratoDato}
            >
              <Text
                style={
                  styles.contratoValor
                }
              >
                {contratos.finalizados ||
                  0}
              </Text>

              <Text
                style={
                  styles.contratoEtiqueta
                }
              >
                Finalizados
              </Text>
            </View>

            <View
              style={styles.contratoDato}
            >
              <Text
                style={
                  styles.contratoValor
                }
              >
                {contratos.cancelados ||
                  0}
              </Text>

              <Text
                style={
                  styles.contratoEtiqueta
                }
              >
                Cancelados
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text
            style={styles.seccionTitulo}
          >
            Ingresos mensuales
          </Text>

          {ingresosMensuales.length ===
          0 ? (
            <View
              style={styles.sinIngresos}
            >
              <Ionicons
                name="bar-chart-outline"
                size={45}
                color={
                  colores.textoSecundario
                }
              />

              <Text
                style={
                  styles.sinIngresosTexto
                }
              >
                Todavía no hay pagos para
                mostrar.
              </Text>
            </View>
          ) : (
            ingresosMensuales.map(
              (item) => {
                const porcentaje =
                  obtenerPorcentaje(
                    item.total,
                    mayorIngreso
                  );

                return (
                  <View
                    key={item.periodo}
                    style={
                      styles.ingresoItem
                    }
                  >
                    <View
                      style={
                        styles.ingresoEncabezado
                      }
                    >
                      <Text
                        style={
                          styles.ingresoPeriodo
                        }
                      >
                        {item.periodo}
                      </Text>

                      <Text
                        style={
                          styles.ingresoTotal
                        }
                      >
                        L{' '}
                        {mostrarDinero(
                          item.total
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.barraIngresoFondo
                      }
                    >
                      <View
                        style={[
                          styles.barraIngreso,
                          {
                            width:
                              `${porcentaje}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.cantidadPagos
                      }
                    >
                      {item.cantidad}{' '}
                      {Number(
                        item.cantidad
                      ) === 1
                        ? 'pago'
                        : 'pagos'}
                    </Text>
                  </View>
                );
              }
            )
          )}
        </View>
      </ScrollView>
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
    padding: 25,
    backgroundColor: colores.fondo,
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
    marginBottom: 15,
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
    marginTop: 4,
    color: colores.primarioTexto,
    fontSize: 14,
    opacity: 0.9,
  },

  contenido: {
    padding: 17,
    paddingBottom: 40,
  },

  tituloSeccion: {
    marginBottom: 13,
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  metricasContenedor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 11,
    marginBottom: 16,
  },

  tarjetaMetrica: {
    width: '48%',
    minHeight: 155,
    padding: 15,
    borderRadius: RADIO.lg,
    backgroundColor:
      colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  iconoMetrica: {
    width: 43,
    height: 43,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  valorMetrica: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  tituloMetrica: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  descripcionMetrica: {
    marginTop: 2,
    fontSize: 12,
    color: colores.textoSecundario,
  },

  seccion: {
    marginBottom: 16,
    padding: 18,
    borderRadius: RADIO.lg,
    backgroundColor:
      colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  seccionTitulo: {
    marginBottom: 17,
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.primario,
  },

  estadoItem: {
    marginBottom: 16,
  },

  estadoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  estadoNombre: {
    fontSize: 14,
    color: colores.textoPrincipal,
  },

  estadoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  barraFondo: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colores.borde,
  },

  barraRelleno: {
    height: '100%',
    borderRadius: 5,
  },

  contratosFila: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  contratoDato: {
    flex: 1,
    alignItems: 'center',
  },

  contratoValor: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colores.primario,
  },

  contratoEtiqueta: {
    marginTop: 4,
    fontSize: 12,
    color: colores.textoSecundario,
  },

  ingresoItem: {
    marginBottom: 18,
  },

  ingresoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  ingresoPeriodo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  ingresoTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.exito,
  },

  barraIngresoFondo: {
    height: 18,
    overflow: 'hidden',
    borderRadius: 9,
    backgroundColor: colores.borde,
  },

  barraIngreso: {
    height: '100%',
    borderRadius: 9,
    backgroundColor: colores.primario,
  },

  cantidadPagos: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'right',
    color: colores.textoSecundario,
  },

  sinIngresos: {
    alignItems: 'center',
    paddingVertical: 22,
  },

  sinIngresosTexto: {
    marginTop: 8,
    fontSize: 14,
    color: colores.textoSecundario,
  },

  textoCargando: {
    marginTop: 12,
    fontSize: 15,
    color: colores.textoSecundario,
  },

  errorTexto: {
    marginTop: 14,
    marginBottom: 18,
    fontSize: 15,
    textAlign: 'center',
    color: colores.peligro,
  },

  botonReintentar: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: RADIO.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.primario,
  },

  textoReintentar: {
    color: colores.primarioTexto,
    fontSize: 14,
    fontWeight: 'bold',
  },
});