import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
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

const TIPOS = [
  'Todos',
  'Casa',
  'Apartamento',
  'Local',
  'Oficina',
  'Bodega',
  'Terreno',
];

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

export default function ExplorarScreen({
  navigation,
  route,
}) {
  const usuario = route.params?.usuario;

  const [propiedades, setPropiedades] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState('');

  const [tipoFiltro, setTipoFiltro] =
    useState('Todos');

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  const cargarPropiedades = useCallback(
    async () => {
      setCargando(true);
      setError('');

      try {
        const respuesta = await fetch(
          API_URLS.LISTAR_DISPONIBLES,
          {
            method: 'GET',
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
          'Error al cargar propiedades:',
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
    []
  );

  useFocusEffect(
    useCallback(() => {
      cargarPropiedades();
    }, [cargarPropiedades])
  );

  const propiedadesFiltradas =
    propiedades.filter(propiedad => {
      const textoBusqueda =
        busqueda.trim().toLowerCase();

      const coincideBusqueda =
        textoBusqueda === '' ||
        propiedad.titulo
          ?.toLowerCase()
          .includes(textoBusqueda) ||
        propiedad.direccion
          ?.toLowerCase()
          .includes(textoBusqueda);

      const coincideTipo =
        tipoFiltro === 'Todos' ||
        propiedad.tipo === tipoFiltro;

      return (
        coincideBusqueda &&
        coincideTipo
      );
    });

  const abrirDetalle = propiedad => {
    navigation.navigate(
      'DetallePropiedadCliente',
      {
        usuario,
        propiedad,
      }
    );
  };

  if (cargando) {
    return (
      <View style={s.centrado}>
        <ActivityIndicator
          size="large"
          color={COLORES.primario}
        />

        <Text style={s.cargandoTexto}>
          Cargando propiedades...
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
          onPress={cargarPropiedades}
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
        <Text style={s.headerTitulo}>
          🔍 Explorar
        </Text>

        <Text style={s.headerSub}>
          Encuentra tu próximo hogar
        </Text>

        <TextInput
          style={s.buscador}
          placeholder="Buscar por nombre o dirección..."
          placeholderTextColor="#94a3b8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtrosScroll}
        contentContainerStyle={
          s.filtrosContainer
        }
      >
        {TIPOS.map(tipoActual => (
          <TouchableOpacity
            key={tipoActual}
            style={[
              s.filtroBtn,

              tipoFiltro === tipoActual &&
                s.filtroActivo,
            ]}
            onPress={() =>
              setTipoFiltro(tipoActual)
            }
          >
            <Text
              style={[
                s.filtroTexto,

                tipoFiltro === tipoActual &&
                  s.filtroTextoActivo,
              ]}
            >
              {tipoActual}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={s.lista}
      >
        <Text style={s.resultados}>
          {propiedadesFiltradas.length}{' '}
          {propiedadesFiltradas.length === 1
            ? 'propiedad encontrada'
            : 'propiedades encontradas'}
        </Text>

        {propiedadesFiltradas.length ===
        0 ? (
          <View style={s.vacio}>
            <Text style={s.vacioIcono}>
              🏚️
            </Text>

            <Text style={s.vacioTitulo}>
              Sin propiedades
            </Text>

            <Text style={s.vacioTexto}>
              No se encontraron propiedades disponibles.
            </Text>
          </View>
        ) : (
          propiedadesFiltradas.map(
            propiedad => {
              const urlImagen =
                obtenerUrlImagen(
                  propiedad.foto_ruta
                );

              return (
                <TouchableOpacity
                  key={propiedad.id}
                  style={s.tarjeta}
                  onPress={() =>
                    abrirDetalle(propiedad)
                  }
                >
                  <View
                    style={s.tarjetaImagen}
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
                      <Text
                        style={s.tarjetaEmoji}
                      >
                        {obtenerEmoji(
                          propiedad.tipo
                        )}
                      </Text>
                    )}

                    <View
                      style={
                        s.tarjetaTipoBadge
                      }
                    >
                      <Text
                        style={
                          s.tarjetaTipoBadgeTexto
                        }
                      >
                        {propiedad.tipo}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={s.tarjetaBody}
                  >
                    <Text
                      style={s.tarjetaTitulo}
                    >
                      {propiedad.titulo}
                    </Text>

                    <Text
                      style={
                        s.tarjetaDireccion
                      }
                    >
                      📍 {propiedad.direccion}
                    </Text>

                    <View
                      style={
                        s.tarjetaDetalles
                      }
                    >
                      <Text style={s.detalle}>
                        🛏{' '}
                        {propiedad.habitaciones}{' '}
                        hab.
                      </Text>

                      <Text style={s.detalle}>
                        🚿 {propiedad.banos}{' '}
                        baño(s)
                      </Text>
                    </View>

                    <View
                      style={s.tarjetaFooter}
                    >
                      <Text style={s.precio}>
                        L.{' '}
                        {Number(
                          propiedad.precio
                        ).toLocaleString()}

                        <Text
                          style={s.precioSub}
                        >
                          /mes
                        </Text>
                      </Text>

                      <View style={s.btnVer}>
                        <Text
                          style={s.btnVerTexto}
                        >
                          Ver →
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          )
        )}
      </ScrollView>
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
    marginTop: 12,
    color: COLORES.textoSecundario,
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
  },

  headerTitulo: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerSub: {
    color: COLORES.primarioClaro,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },

  buscador: {
    backgroundColor: '#ffffff',
    borderRadius: RADIO.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.textoPrincipal,
  },

  filtrosScroll: {
    maxHeight: 56,
  },

  filtrosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },

  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORES.fondoTarjeta,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
  },

  filtroActivo: {
    backgroundColor: COLORES.primario,
    borderColor: COLORES.primario,
  },

  filtroTexto: {
    color: COLORES.textoSecundario,
    fontWeight: '600',
    fontSize: 13,
  },

  filtroTextoActivo: {
    color: '#ffffff',
  },

  lista: {
    padding: 16,
    gap: 16,
  },

  resultados: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    marginBottom: 4,
  },

  vacio: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  vacioIcono: {
    fontSize: 56,
  },

  vacioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    marginTop: 12,
  },

  vacioTexto: {
    color: COLORES.textoSecundario,
    marginTop: 6,
    textAlign: 'center',
  },

  tarjeta: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.lg,
    overflow: 'hidden',
    ...SOMBRA,
  },

  tarjetaImagen: {
    height: 150,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagen: {
    width: '100%',
    height: '100%',
  },

  tarjetaEmoji: {
    fontSize: 60,
  },

  tarjetaTipoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORES.primario,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  tarjetaTipoBadgeTexto: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  tarjetaBody: {
    padding: 16,
  },

  tarjetaTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
  },

  tarjetaDireccion: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    marginTop: 4,
  },

  tarjetaDetalles: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  detalle: {
    fontSize: 13,
    color: COLORES.textoSecundario,
  },

  tarjetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  precio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORES.primario,
  },

  precioSub: {
    fontSize: 13,
    fontWeight: 'normal',
    color: COLORES.textoSecundario,
  },

  btnVer: {
    backgroundColor: COLORES.primario,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIO.sm,
  },

  btnVerTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});