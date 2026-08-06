import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  API_URLS,
} from '../config/config';

import {
  borrarSesion,
} from '../servicios/sesion';

import {
  useTema,
} from '../context/TemaContext';

const RESUMEN_INICIAL = {
  propiedades: 0,
  solicitudes_pendientes: 0,
  contratos_activos: 0,
  pagos_registrados: 0,
};

const MENU = [
  {
    icono: '🏠',
    titulo: 'Mis Propiedades',
    sub: 'Gestiona tus propiedades',
    pantalla: 'MisPropiedades',
  },
  {
    icono: '📋',
    titulo: 'Solicitudes',
    sub: 'Aprueba o rechaza solicitudes',
    pantalla: 'Solicitudes',
  },
  {
    icono: '📝',
    titulo: 'Contratos',
    sub: 'Ver contratos activos',
    pantalla: 'ContratosAdmin',
  },
  {
    icono: '💰',
    titulo: 'Pagos',
    sub: 'Pagos recibidos y registrados',
    pantalla: 'PagosAdmin',
  },
  {
    icono: '📊',
    titulo: 'Reportes',
    sub: 'Estadísticas e ingresos',
    pantalla: 'Reportes',
  },
  {
    icono: '👤',
    titulo: 'Mi Perfil',
    sub: 'Edita tu información',
    pantalla: 'Perfil',
  },
];

export default function AdminDashboard({
  navigation,
  route,
}) {
  const {
    colores,
    limpiarTemaUsuario,
  } = useTema();

  const styles = crearStyles(colores);

  const usuario =
    route?.params?.usuario;

  const [resumen, setResumen] =
    useState(RESUMEN_INICIAL);

  const [
    actualizando,
    setActualizando,
  ] = useState(false);

  const [
    errorResumen,
    setErrorResumen,
  ] = useState('');

  const arrendadorId = Number(
    usuario?.id ||
      usuario?.usuario_id ||
      0
  );

  const cargarResumen = useCallback(
    async () => {
      if (!arrendadorId) {
        setResumen(RESUMEN_INICIAL);

        setErrorResumen(
          'No se pudo identificar al usuario.'
        );

        return;
      }

      try {
        setActualizando(true);
        setErrorResumen('');

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
            'Respuesta del resumen:',
            texto
          );

          throw new Error(
            'El servidor respondió incorrectamente.'
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
              'No se pudo cargar el resumen.'
          );
        }

        const nuevoResumen =
          datos.resumen || {};

        setResumen({
          propiedades: Number(
            nuevoResumen
              .propiedades
              ?.total ??
              nuevoResumen
                .propiedades ??
              0
          ),

          solicitudes_pendientes:
            Number(
              nuevoResumen
                .solicitudes
                ?.pendientes ??
                nuevoResumen
                  .solicitudes_pendientes ??
                0
            ),

          contratos_activos: Number(
            nuevoResumen
              .contratos
              ?.activos ??
              nuevoResumen
                .contratos_activos ??
              0
          ),

          pagos_registrados: Number(
            nuevoResumen
              .pagos
              ?.validos ??
              nuevoResumen
                .pagos
                ?.total ??
              nuevoResumen
                .pagos_registrados ??
              0
          ),
        });
      } catch (errorPeticion) {
        console.error(
          'Error al cargar el dashboard:',
          errorPeticion
        );

        setErrorResumen(
          errorPeticion.message ||
            'No se pudo cargar el resumen.'
        );
      } finally {
        setActualizando(false);
      }
    },
    [arrendadorId]
  );

  /*
   * Cargar nuevamente el resumen cada
   * vez que regresamos al dashboard.
   */
  useFocusEffect(
    useCallback(() => {
      cargarResumen();
    }, [cargarResumen])
  );

  const estadisticas = [
    {
      icono: '🏠',
      numero: resumen.propiedades,
      label: 'Propiedades',
    },
    {
      icono: '📋',
      numero:
        resumen
          .solicitudes_pendientes,
      label:
        'Solicitudes pendientes',
    },
    {
      icono: '📝',
      numero:
        resumen.contratos_activos,
      label:
        'Contratos activos',
    },
    {
      icono: '💰',
      numero:
        resumen.pagos_registrados,
      label:
        'Pagos registrados',
    },
  ];

  const nombreUsuario =
    usuario?.nombre_completo ||
    usuario?.usuario_nombrecomp ||
    usuario?.usuario ||
    usuario?.usuario_nombre ||
    'Arrendador';

  const abrirPantalla = (
    pantalla
  ) => {
    navigation.navigate(
      pantalla,
      {
        usuario,
      }
    );
  };

  const cerrarSesion = async () => {
    limpiarTemaUsuario();

    await borrarSesion();

    navigation.replace(
      'Login'
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contenido
      }
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={actualizando}
          onRefresh={cargarResumen}
          colors={[
            colores.primario,
          ]}
          tintColor={
            colores.primario
          }
        />
      }
    >
      <View style={styles.header}>
        <Text
          style={styles.headerSaludo}
        >
          Bienvenido de nuevo 👋
        </Text>

        <Text
          style={styles.headerNombre}
        >
          {nombreUsuario}
        </Text>

        <View
          style={styles.headerBadge}
        >
          <Text
            style={
              styles.headerBadgeTexto
            }
          >
            🏠 Arrendador
          </Text>
        </View>
      </View>

      <View
        style={
          styles.tarjetasContainer
        }
      >
        {estadisticas.map(
          (
            estadistica,
            indice
          ) => (
            <View
              key={indice}
              style={styles.tarjeta}
            >
              <Text
                style={
                  styles.tarjetaIcono
                }
              >
                {estadistica.icono}
              </Text>

              <Text
                style={
                  styles.tarjetaNumero
                }
              >
                {estadistica.numero}
              </Text>

              <Text
                style={
                  styles.tarjetaLabel
                }
              >
                {estadistica.label}
              </Text>
            </View>
          )
        )}
      </View>

      {errorResumen ? (
        <Text
          style={
            styles.errorResumen
          }
        >
          {errorResumen}
        </Text>
      ) : null}

      <Text
        style={styles.seccionTitulo}
      >
        ¿Qué deseas hacer?
      </Text>

      <View
        style={styles.menuContainer}
      >
        {MENU.map(
          (item, indice) => (
            <TouchableOpacity
              key={indice}
              style={styles.menuBtn}
              onPress={() =>
                abrirPantalla(
                  item.pantalla
                )
              }
              activeOpacity={0.75}
            >
              <View
                style={
                  styles
                    .menuIconoContainer
                }
              >
                <Text
                  style={
                    styles.menuIcono
                  }
                >
                  {item.icono}
                </Text>
              </View>

              <View
                style={
                  styles
                    .menuTextoContainer
                }
              >
                <Text
                  style={
                    styles.menuTitulo
                  }
                >
                  {item.titulo}
                </Text>

                <Text
                  style={
                    styles.menuSub
                  }
                >
                  {item.sub}
                </Text>
              </View>

              <Text
                style={
                  styles.menuFlecha
                }
              >
                ›
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TouchableOpacity
        style={styles.cerrarBtn}
        onPress={cerrarSesion}
        activeOpacity={0.75}
      >
        <Text
          style={styles.cerrarTexto}
        >
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const crearStyles = (
  colores
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colores.fondo,
    },

    contenido: {
      paddingBottom: 25,
    },

    header: {
      backgroundColor:
        colores.primario,

      paddingTop: 55,
      paddingBottom: 28,
      paddingHorizontal: 24,

      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },

    headerSaludo: {
      color:
        colores.primarioTexto,

      fontSize: 14,
      opacity: 0.9,
    },

    headerNombre: {
      color:
        colores.primarioTexto,

      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 2,
    },

    headerBadge: {
      backgroundColor:
        'rgba(15, 23, 42, 0.3)',

      alignSelf: 'flex-start',

      paddingHorizontal: 10,
      paddingVertical: 5,

      borderRadius: 20,
      marginTop: 9,
    },

    headerBadgeTexto: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },

    tarjetasContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 12,
    },

    tarjeta: {
      width: '47%',
      minHeight: 135,
      padding: 18,

      borderRadius: 16,
      borderWidth: 1,

      borderColor:
        colores.borde,

      backgroundColor:
        colores.tarjeta,

      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',

      elevation: 2,
    },

    tarjetaIcono: {
      fontSize: 30,
      marginBottom: 10,
    },

    tarjetaNumero: {
      fontSize: 30,
      fontWeight: 'bold',

      color:
        colores.primario,
    },

    tarjetaLabel: {
      fontSize: 13,

      color:
        colores.textoSecundario,

      marginTop: 2,
    },

    seccionTitulo: {
      fontSize: 17,
      fontWeight: 'bold',

      color:
        colores.textoPrincipal,

      paddingHorizontal: 20,
      marginTop: 4,
      marginBottom: 12,
    },

    errorResumen: {
      color:
        colores.peligro,

      fontSize: 13,
      textAlign: 'center',

      paddingHorizontal: 20,
      marginTop: -5,
      marginBottom: 12,
    },

    menuContainer: {
      paddingHorizontal: 16,
      gap: 10,
    },

    menuBtn: {
      minHeight: 80,
      padding: 16,

      borderRadius: 14,
      borderWidth: 1,

      borderColor:
        colores.borde,

      backgroundColor:
        colores.tarjeta,

      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,

      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',

      elevation: 2,
    },

    menuIconoContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,

      backgroundColor:
        colores.primarioClaro,

      justifyContent: 'center',
      alignItems: 'center',
    },

    menuIcono: {
      fontSize: 22,
    },

    menuTextoContainer: {
      flex: 1,
    },

    menuTitulo: {
      fontSize: 16,
      fontWeight: '600',

      color:
        colores.textoPrincipal,
    },

    menuSub: {
      fontSize: 13,

      color:
        colores.textoSecundario,

      marginTop: 2,
    },

    menuFlecha: {
      fontSize: 25,

      color:
        colores.textoSecundario,
    },

    cerrarBtn: {
      minHeight: 50,
      margin: 20,
      padding: 14,

      borderRadius: 12,
      borderWidth: 1,

      borderColor:
        colores.peligro,

      backgroundColor:
        colores.peligroClaro,

      justifyContent: 'center',
      alignItems: 'center',
    },

    cerrarTexto: {
      color:
        colores.peligro,

      fontWeight: 'bold',
      fontSize: 15,
    },
  });