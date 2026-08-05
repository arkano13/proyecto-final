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
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import styles from '../estilos/MisPropiedadesStyles';

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

function mostrarMensaje(
  titulo,
  mensaje
) {
  if (Platform.OS === 'web') {
    window.alert(mensaje);
    return;
  }

  Alert.alert(titulo, mensaje);
}

export default function MisPropiedades({
  navigation,
  route,
}) {
  const usuario = route.params?.usuario;

  const [propiedades, setPropiedades] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  const cargarPropiedades = useCallback(
    async () => {
      if (!usuario?.id) {
        setError(
          'No se encontró la información del usuario.'
        );

        setCargando(false);
        return;
      }

      setError('');
      setCargando(true);

      try {
        const respuesta = await fetch(
          API_URLS.LISTAR_PROPIEDADES,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              usuario_id: usuario.id,
            }),
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {
          throw new Error(
            datos.mensaje ||
              'No se pudieron cargar las propiedades.'
          );
        }

        setPropiedades(
          datos.propiedades || []
        );
      } catch (errorPeticion) {
        console.error(
          'Error al listar propiedades:',
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

  /*
   * Se ejecuta al entrar y al regresar
   * desde FormPropiedad.
   */
  useFocusEffect(
    useCallback(() => {
      cargarPropiedades();
    }, [cargarPropiedades])
  );

  const agregarPropiedad = () => {
    navigation.navigate('FormPropiedad', {
      usuario,
      propiedad: null,
    });
  };

  const editarPropiedad = propiedad => {
    navigation.navigate('FormPropiedad', {
      usuario,
      propiedad,
    });
  };

  const ejecutarEliminacion = async (
    propiedad
  ) => {
    try {
      const respuesta = await fetch(
        API_URLS.ELIMINAR_PROPIEDAD,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            propiedad_id: propiedad.id,
            usuario_id: usuario.id,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.exito) {
        mostrarMensaje(
          'Error',
          datos.mensaje ||
            'No se pudo eliminar la propiedad.'
        );

        return;
      }

      setPropiedades(
        propiedadesActuales =>
          propiedadesActuales.filter(
            item =>
              item.id !== propiedad.id
          )
      );

      mostrarMensaje(
        '✅ Eliminada',
        'La propiedad fue eliminada correctamente.'
      );
    } catch (errorPeticion) {
      console.error(
        'Error al eliminar propiedad:',
        errorPeticion
      );

      mostrarMensaje(
        'Error',
        'No se pudo conectar con el servidor.'
      );
    }
  };

  const eliminarPropiedad = propiedad => {
    const mensaje =
      `¿Seguro que deseas eliminar "${propiedad.titulo}"?`;

    /*
     * Expo Web utiliza la confirmación
     * propia del navegador.
     */
    if (Platform.OS === 'web') {
      const confirmado =
        window.confirm(mensaje);

      if (confirmado) {
        ejecutarEliminacion(propiedad);
      }

      return;
    }

    /*
     * Android y iPhone utilizan Alert.
     */
    Alert.alert(
      'Eliminar propiedad',
      mensaje,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            ejecutarEliminacion(propiedad),
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#0f766e"
        />

        <Text
          style={{
            marginTop: 12,
            color: '#64748b',
          }}
        >
          Cargando propiedades...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
      >
               <Text
          style={{
            color: '#dc2626',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          {error}
        </Text>

        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={cargarPropiedades}
        >
          <Text style={styles.btnAgregarTexto}>
            Reintentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 22,
              marginRight: 10,
            }}
          >
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitulo}>
          🏠 Mis Propiedades
        </Text>

        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={agregarPropiedad}
        >
          <Text style={styles.btnAgregarTexto}>
            + Agregar
          </Text>
        </TouchableOpacity>
      </View>

      {propiedades.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioIcono}>
            🏚️
          </Text>

          <Text style={styles.vacioTexto}>
            Sin propiedades
          </Text>

          <Text style={styles.vacioSub}>
            Agrega tu primera propiedad
          </Text>

          <TouchableOpacity
            style={[
              styles.btnAgregar,
              {
                marginTop: 18,
                padding: 12,
              },
            ]}
            onPress={agregarPropiedad}
          >
            <Text style={styles.btnAgregarTexto}>
              Agregar propiedad
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.lista}
        >
          {propiedades.map(propiedad => {
            const disponible =
              propiedad.estado ===
              'DISPONIBLE';

            const urlImagen =
              obtenerUrlImagen(
                propiedad.foto_ruta
              );

            return (
              <View
                key={propiedad.id}
                style={styles.tarjeta}
              >
                <View
                  style={styles.tarjetaImagen}
                >
                  {urlImagen ? (
                    <Image
                      source={{
                        uri: urlImagen,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={
                        styles.tarjetaImagenEmoji
                      }
                    >
                      {obtenerEmoji(
                        propiedad.tipo
                      )}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.tarjetaBadge,

                      disponible
                        ? styles.badgeDisponible
                        : styles.badgeOcupada,
                    ]}
                  >
                    <Text style={styles.badgeTexto}>
                      {disponible
                        ? '✓ Disponible'
                        : '• Ocupada'}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.tarjetaBody}
                >
                  <Text
                    style={styles.tarjetaTitulo}
                  >
                    {propiedad.titulo}
                  </Text>

                  <Text
                    style={
                      styles.tarjetaDireccion
                    }
                  >
                    📍 {propiedad.direccion}
                  </Text>

                  <Text
                    style={styles.tarjetaPrecio}
                  >
                    L.{' '}
                    {Number(
                      propiedad.precio
                    ).toLocaleString()}

                    <Text
                      style={
                        styles.tarjetaPrecioSub
                      }
                    >
                      {' '}
                      /mes
                    </Text>
                  </Text>

                  <View
                    style={
                      styles.tarjetaAcciones
                    }
                  >
                    <TouchableOpacity
                      style={styles.btnEditar}
                      onPress={() =>
                        editarPropiedad(
                          propiedad
                        )
                      }
                    >
                      <Text
                        style={
                          styles.btnEditarTexto
                        }
                      >
                        ✏️ Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnEliminar}
                      onPress={() =>
                        eliminarPropiedad(
                          propiedad
                        )
                      }
                    >
                      <Text
                        style={
                          styles.btnEliminarTexto
                        }
                      >
                        🗑️ Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}