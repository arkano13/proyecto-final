import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { API_URLS } from "../config/config";
import { useTema } from "../context/TemaContext";
import SelectorMapa from "../componentes/SelectorMapa";

const TIPOS = [
  "Casa",
  "Apartamento",
  "Local",
  "Oficina",
  "Bodega",
  "Terreno",
];

export default function FormPropiedad({
  navigation,
  route,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route.params?.usuario;

  const propExistente =
    route.params?.propiedad;

  const editando = Boolean(
    propExistente?.id
  );

  const [titulo, setTitulo] = useState(
    propExistente?.titulo || ""
  );

  const [
    descripcion,
    setDescripcion,
  ] = useState(
    propExistente?.descripcion || ""
  );

  const [direccion, setDireccion] =
    useState(
      propExistente?.direccion || ""
    );

  const [precio, setPrecio] = useState(
    propExistente?.precio?.toString() ||
      ""
  );

  const [tipo, setTipo] = useState(
    propExistente?.tipo || "Casa"
  );

  const [
    habitaciones,
    setHabitaciones,
  ] = useState(
    propExistente?.habitaciones?.toString() ||
      "0"
  );

  const [banos, setBanos] = useState(
    propExistente?.banos?.toString() ||
      "0"
  );

  const [foto, setFoto] =
    useState(null);

  const [ubicacion, setUbicacion] =
    useState(
      propExistente?.latitud !== null &&
        propExistente?.latitud !==
          undefined &&
        propExistente?.longitud !==
          null &&
        propExistente?.longitud !==
          undefined
        ? {
            latitude: Number(
              propExistente.latitud
            ),

            longitude: Number(
              propExistente.longitud
            ),
          }
        : null
    );

  const [guardando, setGuardando] =
    useState(false);

  const seleccionarDesdeCamara =
    async () => {
      try {
        const permiso =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permiso.granted) {
          Alert.alert(
            "Permiso requerido",
            "Necesitamos acceso a tu cámara."
          );

          return;
        }

        const resultado =
          await ImagePicker.launchCameraAsync(
            {
              mediaTypes: ["images"],
              quality: 0.7,
              allowsEditing: false,
            }
          );

        if (
          !resultado.canceled &&
          resultado.assets?.length > 0
        ) {
          setFoto(
            resultado.assets[0]
          );
        }
      } catch (error) {
        console.error(
          "Error al abrir la cámara:",
          error
        );

        Alert.alert(
          "Error",
          "No se pudo abrir la cámara."
        );
      }
    };

  const seleccionarDesdeGaleria =
    async () => {
      try {
        const permiso =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          Platform.OS !== "web" &&
          !permiso.granted
        ) {
          Alert.alert(
            "Permiso requerido",
            "Necesitamos acceso a tus fotografías."
          );

          return;
        }

        const resultado =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ["images"],
              quality: 0.7,
              allowsEditing: false,
            }
          );

        if (
          !resultado.canceled &&
          resultado.assets?.length > 0
        ) {
          setFoto(
            resultado.assets[0]
          );
        }
      } catch (error) {
        console.error(
          "Error al abrir la galería:",
          error
        );

        if (Platform.OS === "web") {
          window.alert(
            "No se pudo abrir la galería."
          );
        } else {
          Alert.alert(
            "Error",
            "No se pudo abrir la galería."
          );
        }
      }
    };

  const seleccionarFoto = () => {
    if (Platform.OS === "web") {
      seleccionarDesdeGaleria();

      return;
    }

    Alert.alert(
      "Seleccionar fotografía",
      "Elige de dónde deseas obtener la imagen.",
      [
        {
          text: "Cámara",
          onPress:
            seleccionarDesdeCamara,
        },
        {
          text: "Galería",
          onPress:
            seleccionarDesdeGaleria,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const subirFotografia = async (
    propiedadId
  ) => {
    if (!foto) {
      return null;
    }

    const nombre =
      foto.fileName ||
      foto.file?.name ||
      `propiedad_${propiedadId}.jpg`;

    const tipoArchivo =
      foto.mimeType ||
      foto.file?.type ||
      "image/jpeg";

    const formulario =
      new FormData();

    formulario.append(
      "tableName",
      "tbl_propiedad_img_final"
    );

    formulario.append(
      "fieldID",
      "propiedad_id"
    );

    formulario.append(
      "fieldRuta",
      "propiedad_img_ruta"
    );

    formulario.append(
      "recordId",
      propiedadId.toString()
    );

    if (Platform.OS === "web") {
      let archivoWeb = foto.file;

      if (!archivoWeb) {
        const respuestaArchivo =
          await fetch(foto.uri);

        archivoWeb =
          await respuestaArchivo.blob();
      }

      formulario.append(
        "image",
        archivoWeb,
        nombre
      );
    } else {
      formulario.append("image", {
        uri: foto.uri,
        name: nombre,
        type: tipoArchivo,
      });
    }

    const respuesta = await fetch(
      API_URLS.SUBIR_FOTO,
      {
        method: "POST",
        body: formulario,
      }
    );

    const datos =
      await respuesta.json();

    if (
      !respuesta.ok ||
      !datos.exito
    ) {
      throw new Error(
        datos.mensaje ||
          "No se pudo subir la fotografía."
      );
    }

    return datos;
  };

  const mostrarError = (mensaje) => {
    if (Platform.OS === "web") {
      window.alert(mensaje);
    } else {
      Alert.alert(
        "Error",
        mensaje
      );
    }
  };

  const mostrarActualizacionExitosa =
    () => {
      if (Platform.OS === "web") {
        window.alert(
          "La propiedad se actualizó con éxito."
        );

        navigation.goBack();

        return;
      }

      Alert.alert(
        "✅ Propiedad actualizada",
        "La propiedad se actualizó con éxito.",
        [
          {
            text: "Aceptar",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    };

  const guardar = async () => {
    if (!usuario?.id) {
      mostrarError(
        "No se encontró la información del usuario."
      );

      return;
    }

    if (
      !titulo.trim() ||
      !precio.trim() ||
      !direccion.trim()
    ) {
      mostrarError(
        "Título, dirección y precio son obligatorios."
      );

      return;
    }

    const precioNumero = Number(
      precio.replace(",", ".")
    );

    const habitacionesNumero =
      Number(habitaciones || 0);

    const banosNumero =
      Number(banos || 0);

    if (
      !Number.isFinite(
        precioNumero
      ) ||
      precioNumero <= 0
    ) {
      mostrarError(
        "El precio debe ser mayor que cero."
      );

      return;
    }

    if (
      !Number.isInteger(
        habitacionesNumero
      ) ||
      habitacionesNumero < 0 ||
      !Number.isInteger(
        banosNumero
      ) ||
      banosNumero < 0
    ) {
      mostrarError(
        "Las habitaciones y baños deben ser números enteros."
      );

      return;
    }

    setGuardando(true);

    try {
      const cuerpo = {
        usuario_id: usuario.id,
        titulo: titulo.trim(),

        descripcion:
          descripcion.trim(),

        tipo,
        precio: precioNumero,

        direccion:
          direccion.trim(),

        habitaciones:
          habitacionesNumero,

        banos: banosNumero,

        latitud:
          ubicacion?.latitude ??
          null,

        longitud:
          ubicacion?.longitude ??
          null,
      };

      if (editando) {
        cuerpo.propiedad_id =
          propExistente.id;
      }

      const endpoint = editando
        ? API_URLS.ACTUALIZAR_PROPIEDAD
        : API_URLS.CREAR_PROPIEDAD;

      const respuesta = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            cuerpo
          ),
        }
      );

      const datos =
        await respuesta.json();

      if (
        !respuesta.ok ||
        !datos.exito
      ) {
        mostrarError(
          datos.mensaje ||
            "No se pudo guardar la propiedad."
        );

        return;
      }

      const propiedadId = editando
        ? propExistente.id
        : datos.propiedad.id;

      if (foto) {
        try {
          await subirFotografia(
            propiedadId
          );
        } catch (errorFoto) {
          console.error(
            "Error al subir fotografía:",
            errorFoto
          );

          if (
            Platform.OS === "web"
          ) {
            window.alert(
              "La propiedad se guardó, pero la fotografía no pudo subirse."
            );

            navigation.goBack();
          } else {
            Alert.alert(
              "Propiedad guardada",
              "La propiedad se guardó, pero la fotografía no pudo subirse.",
              [
                {
                  text: "Aceptar",

                  onPress: () =>
                    navigation.goBack(),
                },
              ]
            );
          }

          return;
        }
      }

      if (editando) {
        mostrarActualizacionExitosa();
      } else {
        navigation.goBack();
      }
    } catch (errorPeticion) {
      console.error(
        "Error al guardar propiedad:",
        errorPeticion
      );

      mostrarError(
        "No se pudo conectar con el servidor."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
     <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    > 
      <View style={styles.header}>
        <Text
          style={styles.headerTitulo}
        >
          {editando
            ? "✏️ Editar Propiedad"
            : "➕ Nueva Propiedad"}
        </Text>

        <Text style={styles.headerSub}>
          Completa la información
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.seccion}>
          <Text
            style={
              styles.seccionTitulo
            }
          >
            📋 Información básica
          </Text>

          <Text style={styles.label}>
            Título
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: Apartamento céntrico"
            placeholderTextColor={
              colores.textoSecundario
            }
            value={titulo}
            onChangeText={setTitulo}
            editable={!guardando}
          />

          <Text style={styles.label}>
            Descripción
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.inputMultiline,
            ]}
            placeholder="Describe la propiedad..."
            placeholderTextColor={
              colores.textoSecundario
            }
            value={descripcion}
            onChangeText={
              setDescripcion
            }
            multiline
            editable={!guardando}
          />

          <Text style={styles.label}>
            Tipo de propiedad
          </Text>

          <View
            style={
              styles.tiposContainer
            }
          >
            {TIPOS.map(
              (tipoActual) => (
                <TouchableOpacity
                  key={tipoActual}
                  style={[
                    styles.tipoBtn,

                    tipo ===
                      tipoActual &&
                      styles.tipoActivo,
                  ]}
                  onPress={() =>
                    setTipo(
                      tipoActual
                    )
                  }
                  disabled={guardando}
                >
                  <Text
                    style={[
                      styles.tipoTexto,

                      tipo ===
                        tipoActual &&
                        styles
                          .tipoTextoActivo,
                    ]}
                  >
                    {tipoActual}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text style={styles.label}>
            Precio mensual (L.)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: 8000"
            placeholderTextColor={
              colores.textoSecundario
            }
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
            editable={!guardando}
          />

          <Text style={styles.label}>
            Dirección
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: Col. Las Palmas, Casa 12"
            placeholderTextColor={
              colores.textoSecundario
            }
            value={direccion}
            onChangeText={
              setDireccion
            }
            editable={!guardando}
          />

          <Text style={styles.label}>
            Habitaciones
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: 3"
            placeholderTextColor={
              colores.textoSecundario
            }
            value={habitaciones}
            onChangeText={
              setHabitaciones
            }
            keyboardType="number-pad"
            editable={!guardando}
          />

          <Text style={styles.label}>
            Baños
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: 2"
            placeholderTextColor={
              colores.textoSecundario
            }
            value={banos}
            onChangeText={setBanos}
            keyboardType="number-pad"
            editable={!guardando}
          />
        </View>

        <View style={styles.seccion}>
          <Text
            style={
              styles.seccionTitulo
            }
          >
            📷 Foto de la propiedad
          </Text>

          <TouchableOpacity
            style={styles.fotoBtn}
            onPress={seleccionarFoto}
            disabled={guardando}
          >
            <Text
              style={
                styles.fotoBtnIcono
              }
            >
              {foto ? "✅" : "📷"}
            </Text>

            <Text
              style={
                styles.fotoBtnTexto
              }
            >
              {foto
                ? "Foto seleccionada"
                : editando &&
                    propExistente?.foto_ruta
                  ? "Cambiar fotografía"
                  : "Seleccionar fotografía"}
            </Text>

            <Text
              style={styles.fotoBtnSub}
            >
              Elige entre cámara o
              galería
            </Text>
          </TouchableOpacity>

          {foto?.uri ? (
            <Image
              source={{
                uri: foto.uri,
              }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 14,
                marginTop: 14,
              }}
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View style={styles.seccion}>
          <Text
            style={
              styles.seccionTitulo
            }
          >
            📍 Ubicación de la propiedad
          </Text>

          <SelectorMapa
            ubicacion={ubicacion}
            onSeleccionar={
              setUbicacion
            }
            colores={colores}
            deshabilitado={
              guardando
            }
          />
        </View>

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={guardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator
              color={
                colores.primarioTexto
              }
            />
          ) : (
            <Text
              style={
                styles.btnGuardarTexto
              }
            >
              💾{" "}
              {editando
                ? "Actualizar propiedad"
                : "Guardar propiedad"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
  );
}

const crearStyles = (colores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colores.fondo,
    },

    header: {
      backgroundColor:
        colores.primario,

      paddingTop: 55,
      paddingBottom: 20,
      paddingHorizontal: 20,

      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    headerTitulo: {
      color:
        colores.primarioTexto,

      fontSize: 20,
      fontWeight: "bold",
    },

    headerSub: {
      color:
        colores.primarioTexto,

      fontSize: 13,
      marginTop: 4,
      opacity: 0.9,
    },

    scroll: {
      padding: 20,
       paddingBottom: 120,
    },

    seccion: {
      backgroundColor:
        colores.tarjeta,

      borderRadius: 16,
      borderWidth: 1,
      borderColor: colores.borde,

      padding: 18,
      marginBottom: 16,

      boxShadow:
        "0px 2px 8px rgba(15, 23, 42, 0.08)",

      elevation: 2,
    },

    seccionTitulo: {
      fontSize: 15,
      fontWeight: "bold",
      color: colores.primario,
      marginBottom: 14,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",

      color:
        colores.textoPrincipal,

      marginBottom: 6,
    },

    input: {
      backgroundColor:
        colores.campo,

      borderWidth: 1.5,
      borderColor: colores.borde,
      borderRadius: 8,

      padding: 12,
      fontSize: 15,

      color:
        colores.textoPrincipal,

      marginBottom: 14,
    },

    inputMultiline: {
      height: 90,
      textAlignVertical: "top",
    },

    tiposContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },

    tipoBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,

      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colores.borde,

      backgroundColor:
        colores.campo,
    },

    tipoActivo: {
      borderColor:
        colores.primario,

      backgroundColor:
        colores.primarioClaro,
    },

    tipoTexto: {
      color:
        colores.textoSecundario,

      fontSize: 13,
      fontWeight: "600",
    },

    tipoTextoActivo: {
      color: colores.primario,
    },

    fotoBtn: {
      backgroundColor:
        colores.primarioClaro,

      borderRadius: 12,
      padding: 20,
      alignItems: "center",

      borderWidth: 2,
      borderColor: colores.primario,
      borderStyle: "dashed",

      marginBottom: 14,
    },

    fotoBtnIcono: {
      fontSize: 36,
      marginBottom: 6,
    },

    fotoBtnTexto: {
      color: colores.primario,
      fontWeight: "600",
      fontSize: 15,
    },

    fotoBtnSub: {
      color:
        colores.textoSecundario,

      fontSize: 12,
      marginTop: 2,
    },

    btnGuardar: {
      backgroundColor:
        colores.primario,

      padding: 17,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 30,

      boxShadow:
        "0px 2px 8px rgba(15, 23, 42, 0.08)",

      elevation: 2,
    },

    btnGuardarTexto: {
      color:
        colores.primarioTexto,

      fontWeight: "bold",
      fontSize: 17,
    },
  });