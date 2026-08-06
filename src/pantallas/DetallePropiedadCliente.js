import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";

import { SOMBRA, RADIO } from "../estilos/globales";
import { useTema } from "../context/TemaContext";

import { API_BASE_URL, API_URLS } from "../config/config";

function obtenerEmoji(tipo) {
  if (tipo === "Casa") return "🏡";
  if (tipo === "Apartamento") return "🏢";
  if (tipo === "Local") return "🏪";
  if (tipo === "Oficina") return "🏢";
  if (tipo === "Bodega") return "🏭";
  if (tipo === "Terreno") return "🌳";

  return "🏠";
}

function obtenerUrlImagen(ruta) {
  if (!ruta) {
    return null;
  }

  if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
    return ruta;
  }

  const coincidencia = API_BASE_URL.match(/^(https?:\/\/[^/]+)/);

  const servidor = coincidencia ? coincidencia[1] : "";

  if (ruta.startsWith("/")) {
    return `${servidor}${ruta}`;
  }

  return `${API_BASE_URL}/${ruta}`;
}

function mostrarAlerta(titulo, mensaje) {
  if (Platform.OS === "web") {
    window.alert(mensaje);
    return;
  }

  Alert.alert(titulo, mensaje);
}

export default function DetallePropiedadCliente({ navigation, route }) {
  const { colores } = useTema();
  const s = crearStyles(colores);

  const propiedad = route.params?.propiedad;
  const usuario = route.params?.usuario;

  const [mensaje, setMensaje] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [enviado, setEnviado] = useState(false);

  const urlImagen = obtenerUrlImagen(propiedad?.foto_ruta);

  const arrendador = propiedad?.arrendador || {};

  const enviarSolicitud = async () => {
    if (!usuario?.id) {
      mostrarAlerta("Error", "No se encontró la información del usuario.");

      return;
    }

    if (!propiedad?.id) {
      mostrarAlerta("Error", "No se encontró la propiedad.");

      return;
    }

    if (!mensaje.trim()) {
      mostrarAlerta(
        "Campo requerido",
        "Escribe un mensaje para el arrendador.",
      );

      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch(API_URLS.CREAR_SOLICITUD, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          propiedad_id: propiedad.id,
          inquilino_id: usuario.id,
          mensaje: mensaje.trim(),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.exito) {
        mostrarAlerta(
          "Error",
          datos.mensaje || "No se pudo enviar la solicitud.",
        );

        return;
      }

      setEnviado(true);
      setMensaje("");

      mostrarAlerta(
        "✅ Solicitud enviada",
        "Tu solicitud fue enviada correctamente al arrendador.",
      );
    } catch (errorPeticion) {
      console.error("Error al enviar solicitud:", errorPeticion);

      mostrarAlerta("Error", "No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (!propiedad) {
    return (

      
      <View style={s.centrado}>
        <Text style={s.errorTexto}>No se encontró la propiedad.</Text>

        <TouchableOpacity
          style={s.btnVolverError}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.btnVolverErrorTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
   
       <KeyboardAvoidingView
      style={s.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
    <ScrollView
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingBottom: 120,
  }}
>
        <View style={s.imagenContainer}>
          {urlImagen ? (
            <Image
              source={{ uri: urlImagen }}
              style={s.imagen}
              resizeMode="cover"
            />
          ) : (
            <Text style={s.imagenEmoji}>{obtenerEmoji(propiedad.tipo)}</Text>
          )}

          <TouchableOpacity
            style={s.btnVolver}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>

          <View style={s.tipoBadge}>
            <Text style={s.tipoBadgeTexto}>{propiedad.tipo}</Text>
          </View>
        </View>

        <View style={s.contenido}>
          <View style={s.seccion}>
            <Text style={s.titulo}>{propiedad.titulo}</Text>

            <Text style={s.direccion}>📍 {propiedad.direccion}</Text>

            <Text style={s.precio}>
              L. {Number(propiedad.precio).toLocaleString()}
              <Text style={s.precioSub}> /mes</Text>
            </Text>

            <View style={s.disponibleBadge}>
              <Text style={s.disponibleBadgeTexto}>✓ Disponible</Text>
            </View>
          </View>

          {propiedad.descripcion ? (
            <View style={s.seccion}>
              <Text style={s.seccionTitulo}>📄 Descripción</Text>

              <Text style={s.descripcion}>{propiedad.descripcion}</Text>
            </View>
          ) : null}

          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>📋 Características</Text>

            <View style={s.caracteristicas}>
              <View style={s.caracteristicaItem}>
                <Text style={s.caracteristicaIcono}>🛏</Text>

                <Text style={s.caracteristicaValor}>
                  {propiedad.habitaciones || 0}
                </Text>

                <Text style={s.caracteristicaLabel}>Habitaciones</Text>
              </View>

              <View style={s.caracteristicaItem}>
                <Text style={s.caracteristicaIcono}>🚿</Text>

                <Text style={s.caracteristicaValor}>
                  {propiedad.banos || 0}
                </Text>

                <Text style={s.caracteristicaLabel}>Baños</Text>
              </View>

              <View style={s.caracteristicaItem}>
                <Text style={s.caracteristicaIcono}>📅</Text>

                <Text style={s.caracteristicaValor}>Inmediata</Text>

                <Text style={s.caracteristicaLabel}>Disponibilidad</Text>
              </View>
            </View>
          </View>

          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>👤 Arrendador</Text>

            <View style={s.arrendadorCard}>
              <View style={s.arrendadorAvatar}>
                <Text style={s.avatarTexto}>👤</Text>
              </View>

              <View style={s.arrendadorInfo}>
                <Text style={s.arrendadorNombre}>
                  {arrendador.nombre || "Arrendador"}
                </Text>

                <Text style={s.arrendadorSub}>Propietario verificado ✓</Text>

                {arrendador.correo ? (
                  <Text style={s.arrendadorContacto}>
                    ✉️ {arrendador.correo}
                  </Text>
                ) : null}

                {arrendador.telefono ? (
                  <Text style={s.arrendadorContacto}>
                    📞 {arrendador.telefono}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>📍 Ubicación</Text>

            <View style={s.mapaPlaceholder}>
              <Text style={s.mapaIcono}>🗺️</Text>

              <Text style={s.mapaTexto}>{propiedad.direccion}</Text>

              {propiedad.latitud !== null && propiedad.longitud !== null ? (
                <Text style={s.coordenadas}>
                  {Number(propiedad.latitud).toFixed(5)},{" "}
                  {Number(propiedad.longitud).toFixed(5)}
                </Text>
              ) : (
                <Text style={s.coordenadas}>Sin coordenadas registradas</Text>
              )}
            </View>
          </View>

          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>📨 Enviar solicitud</Text>

            {enviado ? (
              <View style={s.enviadoContainer}>
                <Text style={s.enviadoIcono}>✅</Text>

                <Text style={s.enviadoTitulo}>Solicitud enviada</Text>

                <Text style={s.enviadoTexto}>
                  El arrendador revisará tu solicitud.
                </Text>

                <TouchableOpacity
                  style={s.btnMisSolicitudes}
                  onPress={() =>
                    navigation.navigate("MisSolicitudes", {
                      usuario,
                    })
                  }
                >
                  <Text style={s.btnMisSolicitudesTexto}>
                    Ver mis solicitudes
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={s.mensajeInput}
                  placeholder="Preséntate y explica por qué te interesa esta propiedad..."
                  placeholderTextColor={colores.textoSecundario}
                  value={mensaje}
                  onChangeText={setMensaje}
                  multiline
                  numberOfLines={4}
                  editable={!enviando}
                />

                <TouchableOpacity
                  style={[s.btnSolicitar, enviando && s.btnDeshabilitado]}
                  onPress={enviarSolicitud}
                  disabled={enviando}
                >
                  {enviando ? (
                    <ActivityIndicator color={colores.primarioTexto} />
                  ) : (
                    <Text style={s.btnSolicitarTexto}>📨 Enviar solicitud</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
  );
}

const crearStyles = (colores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    centrado: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colores.fondo,
      padding: 24,
    },

    errorTexto: {
      color: colores.peligro,
      fontSize: 16,
      marginBottom: 16,
    },

    btnVolverError: {
      backgroundColor: colores.primario,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: RADIO.sm,
    },

    btnVolverErrorTexto: {
      color: colores.primarioTexto,
      fontWeight: "bold",
    },

    imagenContainer: {
      height: 240,
      backgroundColor: colores.primarioClaro,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },

    imagen: {
      width: "100%",
      height: "100%",
    },

    imagenEmoji: {
      fontSize: 80,
    },

    btnVolver: {
      position: "absolute",
      top: 20,
      left: 16,
      backgroundColor: "rgba(0,0,0,0.45)",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },

    btnVolverTexto: {
      color: colores.primarioTexto,
      fontWeight: "600",
    },

    tipoBadge: {
      position: "absolute",
      top: 20,
      right: 16,
      backgroundColor: colores.primario,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    tipoBadgeTexto: {
      color: colores.primarioTexto,
      fontWeight: "bold",
      fontSize: 12,
    },

    contenido: {
      padding: 20,
      gap: 16,
    },

    seccion: {
      backgroundColor: colores.tarjeta,
      borderRadius: RADIO.lg,
      padding: 18,
      ...SOMBRA,
    },

    titulo: {
      fontSize: 22,
      fontWeight: "bold",
      color: colores.textoPrincipal,
    },

    direccion: {
      fontSize: 14,
      color: colores.textoSecundario,
      marginTop: 6,
    },

    precio: {
      fontSize: 26,
      fontWeight: "bold",
      color: colores.primario,
      marginTop: 10,
    },

    precioSub: {
      fontSize: 15,
      fontWeight: "normal",
      color: colores.textoSecundario,
    },

    disponibleBadge: {
      backgroundColor: colores.exitoClaro,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginTop: 10,
    },

    disponibleBadgeTexto: {
      color: colores.exito,
      fontSize: 12,
      fontWeight: "bold",
    },

    seccionTitulo: {
      fontSize: 15,
      fontWeight: "bold",
      color: colores.primario,
      marginBottom: 14,
    },

    descripcion: {
      color: colores.textoSecundario,
      fontSize: 14,
      lineHeight: 21,
    },

    caracteristicas: {
      flexDirection: "row",
      justifyContent: "space-around",
    },

    caracteristicaItem: {
      flex: 1,
      alignItems: "center",
    },

    caracteristicaIcono: {
      fontSize: 28,
      marginBottom: 6,
    },

    caracteristicaValor: {
      fontSize: 16,
      fontWeight: "bold",
      color: colores.textoPrincipal,
    },

    caracteristicaLabel: {
      fontSize: 11,
      color: colores.textoSecundario,
      marginTop: 2,
      textAlign: "center",
    },

    arrendadorCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },

    arrendadorAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colores.primarioClaro,
      justifyContent: "center",
      alignItems: "center",
    },

    avatarTexto: {
      fontSize: 24,
    },

    arrendadorInfo: {
      flex: 1,
    },

    arrendadorNombre: {
      fontSize: 16,
      fontWeight: "bold",
      color: colores.textoPrincipal,
    },

    arrendadorSub: {
      fontSize: 13,
      color: colores.exito,
      marginTop: 2,
    },

    arrendadorContacto: {
      fontSize: 12,
      color: colores.textoSecundario,
      marginTop: 4,
    },

    mapaPlaceholder: {
      backgroundColor: colores.fondo,
      borderRadius: RADIO.md,
      minHeight: 130,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colores.borde,
      padding: 14,
    },

    mapaIcono: {
      fontSize: 40,
    },

    mapaTexto: {
      color: colores.textoSecundario,
      fontSize: 13,
      marginTop: 6,
      textAlign: "center",
    },

    coordenadas: {
      color: colores.textoSecundario,
      fontSize: 12,
      marginTop: 5,
    },

    mensajeInput: {
      backgroundColor: colores.fondo,
      borderWidth: 1.5,
      borderColor: colores.borde,
      borderRadius: RADIO.md,
      padding: 14,
      fontSize: 15,
      color: colores.textoPrincipal,
      height: 110,
      textAlignVertical: "top",
      marginBottom: 14,
    },

    btnSolicitar: {
      backgroundColor: colores.primario,
      padding: 16,
      borderRadius: RADIO.md,
      alignItems: "center",
      ...SOMBRA,
    },

    btnDeshabilitado: {
      opacity: 0.65,
    },

    btnSolicitarTexto: {
      color: colores.primarioTexto,
      fontWeight: "bold",
      fontSize: 16,
    },

    enviadoContainer: {
      alignItems: "center",
      paddingVertical: 12,
    },

    enviadoIcono: {
      fontSize: 48,
    },

    enviadoTitulo: {
      fontSize: 18,
      fontWeight: "bold",
      color: colores.exito,
      marginTop: 10,
    },

    enviadoTexto: {
      fontSize: 14,
      color: colores.textoSecundario,
      marginTop: 6,
      textAlign: "center",
    },

    btnMisSolicitudes: {
      backgroundColor: colores.primarioClaro,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: RADIO.sm,
      marginTop: 16,
    },

    btnMisSolicitudesTexto: {
      color: colores.primario,
      fontWeight: "bold",
    },
  });
