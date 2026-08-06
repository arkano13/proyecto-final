import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

export default function SelectorMapa({
  ubicacion,
  onSeleccionar,
  colores,
  deshabilitado = false,
}) {
  const styles = crearStyles(colores);

  const [visible, setVisible] =
    useState(false);

  const [latitud, setLatitud] =
    useState("");

  const [longitud, setLongitud] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (visible) {
      setLatitud(
        ubicacion?.latitude?.toString() ||
          ""
      );

      setLongitud(
        ubicacion?.longitude?.toString() ||
          ""
      );

      setError("");
    }
  }, [visible, ubicacion]);

  const confirmar = () => {
    const latitude = Number(
      latitud.replace(",", ".")
    );

    const longitude = Number(
      longitud.replace(",", ".")
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "Escribe coordenadas válidas."
      );

      return;
    }

    onSeleccionar({
      latitude,
      longitude,
    });

    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.botonAbrir}
        onPress={() => setVisible(true)}
        disabled={deshabilitado}
      >
        <Text style={styles.icono}>
          {ubicacion ? "✅" : "🗺️"}
        </Text>

        <Text
          style={styles.textoPrincipal}
        >
          {ubicacion
            ? "Cambiar coordenadas"
            : "Seleccionar coordenadas"}
        </Text>

        <Text
          style={styles.textoSecundario}
        >
          En el teléfono podrás
          elegirlas en el mapa
        </Text>
      </TouchableOpacity>

      {ubicacion ? (
        <Text style={styles.coordenadas}>
          📍{" "}
          {ubicacion.latitude.toFixed(5)}
          ,{" "}
          {ubicacion.longitude.toFixed(5)}
        </Text>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setVisible(false)
        }
      >
        <View style={styles.fondoModal}>
          <View
            style={styles.modalContenido}
          >
            <Text
              style={styles.modalTitulo}
            >
              Coordenadas de la
              propiedad
            </Text>

            <Text
              style={
                styles.modalSubtitulo
              }
            >
              Esta opción es para probar
              desde la web.
            </Text>

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Text style={styles.label}>
              Latitud
            </Text>

            <TextInput
              style={styles.input}
              value={latitud}
              onChangeText={setLatitud}
              placeholder="Ej: 14.0723"
              placeholderTextColor={
                colores.textoSecundario
              }
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>
              Longitud
            </Text>

            <TextInput
              style={styles.input}
              value={longitud}
              onChangeText={setLongitud}
              placeholder="Ej: -87.1921"
              placeholderTextColor={
                colores.textoSecundario
              }
              keyboardType="decimal-pad"
            />

            <View style={styles.botones}>
              <TouchableOpacity
                style={
                  styles.botonCancelar
                }
                onPress={() =>
                  setVisible(false)
                }
              >
                <Text
                  style={
                    styles.textoCancelar
                  }
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.botonConfirmar
                }
                onPress={confirmar}
              >
                <Text
                  style={
                    styles.textoConfirmar
                  }
                >
                  Guardar ubicación
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const crearStyles = (colores) =>
  StyleSheet.create({
    botonAbrir: {
      backgroundColor:
        colores.primarioClaro,

      borderRadius: 12,
      height: 140,

      justifyContent: "center",
      alignItems: "center",

      borderWidth: 2,
      borderColor: colores.primario,
      borderStyle: "dashed",

      paddingHorizontal: 15,
    },

    icono: {
      fontSize: 36,
      marginBottom: 6,
    },

    textoPrincipal: {
      color: colores.primario,
      fontWeight: "600",
      fontSize: 15,
    },

    textoSecundario: {
      color:
        colores.textoSecundario,

      fontSize: 12,
      marginTop: 2,
      textAlign: "center",
    },

    coordenadas: {
      color: colores.exito,
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      fontWeight: "600",
    },

    fondoModal: {
      flex: 1,

      backgroundColor:
        "rgba(0, 0, 0, 0.55)",

      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    modalContenido: {
      width: "100%",
      maxWidth: 430,

      backgroundColor:
        colores.tarjeta,

      borderRadius: 16,
      padding: 20,
    },

    modalTitulo: {
      color:
        colores.textoPrincipal,

      fontSize: 19,
      fontWeight: "bold",
    },

    modalSubtitulo: {
      color:
        colores.textoSecundario,

      fontSize: 13,
      marginTop: 4,
      marginBottom: 18,
    },

    error: {
      color: colores.peligro,
      marginBottom: 12,
    },

    label: {
      color:
        colores.textoPrincipal,

      fontWeight: "600",
      marginBottom: 6,
    },

    input: {
      backgroundColor:
        colores.campo,

      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 9,

      color:
        colores.textoPrincipal,

      padding: 12,
      marginBottom: 14,
    },

    botones: {
      flexDirection: "row",
      gap: 10,
      marginTop: 5,
    },

    botonCancelar: {
      flex: 1,
      padding: 13,
      borderRadius: 9,

      borderWidth: 1,
      borderColor: colores.borde,

      alignItems: "center",
    },

    textoCancelar: {
      color:
        colores.textoPrincipal,

      fontWeight: "600",
    },

    botonConfirmar: {
      flex: 1,
      padding: 13,
      borderRadius: 9,

      backgroundColor:
        colores.primario,

      alignItems: "center",
    },

    textoConfirmar: {
      color:
        colores.primarioTexto,

      fontWeight: "bold",
    },
  });