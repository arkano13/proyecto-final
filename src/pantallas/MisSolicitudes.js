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

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  COLORES,
  SOMBRA,
  RADIO,
} from '../estilos/globales';

import {
  API_BASE_URL,
  API_URLS,
} from '../config/config';

function obtenerEmoji(tipo) {
  if (tipo === 'Casa') return '🏡';
  if (tipo === 'Apartamento') return '🏢';
  if (tipo === 'Local') return '🏪';
  if (tipo === 'Oficina') return '🏢';
  if (tipo === 'Bodega') return '🏭';
  if (tipo === 'Terreno') return '🌳';

  return '🏠';
}

function obtenerUrlImagen(ruta) {
  if (!ruta) {
    return null;
  }

  if (
    ruta.startsWith('http://') ||
    ruta.startsWith('https://')
  ) {
    return ruta;
  }

  const coincidencia = API_BASE_URL.match(
    /^(https?:\/\/[^/]+)/
  );

  const servidor = coincidencia
    ? coincidencia[1]
    : '';

  if (ruta.startsWith('/')) {
    return `${servidor}${ruta}`;
  }

  return `${API_BASE_URL}/${ruta}`;
}

function obtenerBadge(estado) {
  if (estado === 'aprobada') {
    return {
      fondo: COLORES.exito,
      texto: '✅ Aprobada',
    };
  }

  if (estado === 'rechazada') {
    return {
      fondo: COLORES.peligro,
      texto: '❌ Rechazada',
    };
  }

  return {
    fondo: COLORES.acento,
    texto: '⏳ Pendiente',
  };
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '';
  }

  const fechaObjeto = new Date(
    fecha.replace(' ', 'T')
  );

  if (Number.isNaN(fechaObjeto.getTime())) {
    return fecha;
  }

  return fechaObjeto.toLocaleDateString(
    'es-HN'
  );
}

export default function MisSolicitudes({
  navigation,
  route,
}) {
  const usuario = route.params?.usuario;

  const [solicitudes, setSolicitudes] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  const cargarSolicitudes = useCallback(
    async () => {
      if (!usuario?.id) {
        setError(
          'No se encontró la información del usuario.'
        );

        setCargando(false);
        return;
      }

      setCargando(true);
      setError('');

      try {
        const respuesta = await fetch(
          API_URLS.LISTAR_SOLICITUDES_INQUILINO,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              inquilino_id: usuario.id,
            }),
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {
          throw new Error(
            datos.mensaje ||
              'No se pudieron cargar las solicitudes.'
          );
        }

        setSolicitudes(
          datos.solicitudes || []
        );
      } catch (errorPeticion) {
        console.error(
          'Error al listar solicitudes:',
          errorPeticion
        );

        setError(
          errorPeticion.message ||
            'No se pudo conectar con el servidor.'
        );
      } finally {
        setCargando(false);
      }
    },
    [usuario?.id]
  );

  useFocusEffect(
    useCallback(() => {
      cargarSolicitudes();
    }, [cargarSolicitudes])
  );

  if (cargando) {
    return (
      <View style={s.centrado}>
        <ActivityIndicator
          size="large"
          color={COLORES.primario}
        />

        <Text style={s.cargandoTexto}>
          Cargando solicitudes...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centrado}>
        <Text style={s.errorTexto}>
          {error}
        </Text>

        <TouchableOpacity
          style={s.btnReintentar}
          onPress={cargarSolicitudes}
        >
          <Text style={s.btnReintentarTexto}>
            Reintentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={s.volver}>
            ←
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={s.headerTitulo}>
            📋 Mis Solicitudes
          </Text>

          <Text style={s.headerSub}>
            {solicitudes.length}{' '}
            {solicitudes.length === 1
              ? 'solicitud enviada'
              : 'solicitudes enviadas'}
          </Text>
        </View>
      </View>

      {solicitudes.length === 0 ? (
        <View style={s.vacio}>
          <Text style={s.vacioIcono}>
            📭
          </Text>

          <Text style={s.vacioTitulo}>
            Sin solicitudes
          </Text>

          <Text style={s.vacioTexto}>
            Todavía no has solicitado ninguna propiedad.
          </Text>

          <TouchableOpacity
            style={s.btnExplorar}
            onPress={() =>
              navigation.navigate(
                'ExplorarScreen',
                {
                  usuario,
                }
              )
            }
          >
            <Text style={s.btnExplorarTexto}>
              Explorar propiedades
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.lista}
        >
          {solicitudes.map(solicitud => {
            const propiedad =
              solicitud.propiedad || {};

            const arrendador =
              solicitud.arrendador || {};

            const badge = obtenerBadge(
              solicitud.estado
            );

            const urlImagen =
              obtenerUrlImagen(
                propiedad.foto_ruta
              );

            return (
              <View
                key={solicitud.id}
                style={s.tarjeta}
              >
                <View style={s.tarjetaTop}>
                  <View
                    style={s.imagenContainer}
                  >
                    {urlImagen ? (
                      <Image
                        source={{
                          uri: urlImagen,
                        }}
                        style={s.imagen}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={s.emoji}>
                        {obtenerEmoji(
                          propiedad.tipo
                        )}
                      </Text>
                    )}
                  </View>

                  <View style={s.info}>
                    <Text
                      style={s.propiedadTitulo}
                    >
                      {propiedad.titulo}
                    </Text>

                    <Text style={s.direccion}>
                      📍 {propiedad.direccion}
                    </Text>

                    <Text style={s.fecha}>
                      📅 Enviada:{' '}
                      {formatearFecha(
                        solicitud.fecha
                      )}
                    </Text>

                    <Text style={s.arrendador}>
                      👤{' '}
                      {arrendador.nombre ||
                        'Arrendador'}
                    </Text>
                  </View>
                </View>

                <View style={s.mensajeBox}>
                  <Text style={s.mensajeLabel}>
                    Tu mensaje
                  </Text>

                  <Text style={s.mensajeTexto}>
                    “{solicitud.mensaje}”
                  </Text>
                </View>

                <View style={s.footer}>
                  <Text style={s.precio}>
                    L.{' '}
                    {Number(
                      propiedad.precio || 0
                    ).toLocaleString()}
                    /mes
                  </Text>

                  <View
                    style={[
                      s.badge,
                      {
                        backgroundColor:
                          badge.fondo,
                      },
                    ]}
                  >
                    <Text style={s.badgeTexto}>
                      {badge.texto}
                    </Text>
                  </View>
                </View>

                {solicitud.estado ===
                'aprobada' ? (
                  <View style={s.aprobadaAlert}>
                    <Text
                      style={s.aprobadaTexto}
                    >
                      🎉 Tu solicitud fue aprobada.
                      Próximamente podrás revisar el
                      contrato.
                    </Text>
                  </View>
                ) : null}

                {solicitud.estado ===
                'rechazada' ? (
                  <View style={s.rechazadaAlert}>
                    <Text
                      style={s.rechazadaTexto}
                    >
                      Esta solicitud fue rechazada por
                      el arrendador.
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.fondo,
    padding: 24,
  },

  cargandoTexto: {
    color: COLORES.textoSecundario,
    marginTop: 12,
  },

  errorTexto: {
    color: COLORES.peligro,
    textAlign: 'center',
    marginBottom: 16,
  },

  btnReintentar: {
    backgroundColor: COLORES.primario,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: RADIO.sm,
  },

  btnReintentarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  header: {
    backgroundColor: COLORES.primario,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  volver: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerTitulo: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  headerSub: {
    color: COLORES.primarioClaro,
    fontSize: 13,
    marginTop: 3,
  },

  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },

  vacioIcono: {
    fontSize: 58,
  },

  vacioTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    marginTop: 12,
  },

  vacioTexto: {
    color: COLORES.textoSecundario,
    textAlign: 'center',
    marginTop: 6,
  },

  btnExplorar: {
    backgroundColor: COLORES.primario,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIO.sm,
    marginTop: 18,
  },

  btnExplorarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  lista: {
    padding: 16,
    gap: 14,
  },

  tarjeta: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.lg,
    padding: 18,
    ...SOMBRA,
  },

  tarjetaTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },

  imagenContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  imagen: {
    width: '100%',
    height: '100%',
  },

  emoji: {
    fontSize: 34,
  },

  info: {
    flex: 1,
  },

  propiedadTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
  },

  direccion: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    marginTop: 3,
  },

  fecha: {
    fontSize: 12,
    color: COLORES.textoClaro,
    marginTop: 3,
  },

  arrendador: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 3,
  },

  mensajeBox: {
    backgroundColor: COLORES.fondo,
    borderRadius: RADIO.sm,
    padding: 12,
    marginBottom: 14,
  },

  mensajeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORES.primario,
    marginBottom: 4,
  },

  mensajeTexto: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORES.primario,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  aprobadaAlert: {
    backgroundColor: COLORES.exitoClaro,
    borderRadius: RADIO.sm,
    padding: 10,
    marginTop: 12,
  },

  aprobadaTexto: {
    color: COLORES.exito,
    fontSize: 13,
    fontWeight: '600',
  },

  rechazadaAlert: {
    backgroundColor: COLORES.peligroClaro,
    borderRadius: RADIO.sm,
    padding: 10,
    marginTop: 12,
  },

  rechazadaTexto: {
    color: COLORES.peligro,
    fontSize: 13,
    fontWeight: '600',
  },
});