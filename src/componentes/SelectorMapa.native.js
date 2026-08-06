import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

import MapView, {
  Marker,
} from "react-native-maps";

const UBICACION_INICIAL = {
  latitude: 14.0723,
  longitude: -87.1921,
};

export default function SelectorMapa({
  ubicacion,
  onSeleccionar,
  colores,
  deshabilitado = false,
}) {
  const styles = crearStyles(colores);

  const [visible, setVisible] =
    useState(false);

  const [
    ubicacionTemporal,
    setUbicacionTemporal,
  ] = useState(
    ubicacion || UBICACION_INICIAL
  );

  useEffect(() => {
    if (visible) {
      setUbicacionTemporal(
        ubicacion || UBICACION_INICIAL
      );
    }
  }, [visible, ubicacion]);

  const seleccionarPunto = (evento) => {
    setUbicacionTemporal(
      evento.nativeEvent.coordinate
    );
  };

  const confirmar = () => {
    onSeleccionar(ubicacionTemporal);
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
            ? "Cambiar ubicación"
            : "Seleccionar ubicación"}
        </Text>

        <Text
          style={styles.textoSecundario}
        >
          Abre el mapa y toca el lugar
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
        animationType="slide"
        onRequestClose={() =>
          setVisible(false)
        }
      >
        <View
          style={styles.modalContainer}
        >
          <View
            style={styles.modalHeader}
          >
            <Text
              style={styles.modalTitulo}
            >
              Seleccionar ubicación
            </Text>

            <Text
              style={
                styles.modalSubtitulo
              }
            >
              Toca el mapa o mueve el
              marcador
            </Text>
          </View>

          <MapView
            style={styles.mapa}
            initialRegion={{
              latitude:
                ubicacionTemporal.latitude,

              longitude:
                ubicacionTemporal.longitude,

              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            onPress={seleccionarPunto}
          >
            <Marker
              coordinate={
                ubicacionTemporal
              }
              draggable
              onDragEnd={
                seleccionarPunto
              }
              title="Ubicación de la propiedad"
            />
          </MapView>

          <View
            style={
              styles.datosSeleccionados
            }
          >
            <Text
              style={styles.datosTexto}
            >
              Latitud:{" "}
              {ubicacionTemporal.latitude.toFixed(
                6
              )}
            </Text>

            <Text
              style={styles.datosTexto}
            >
              Longitud:{" "}
              {ubicacionTemporal.longitude.toFixed(
                6
              )}
            </Text>
          </View>

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
                Usar esta ubicación
              </Text>
            </TouchableOpacity>
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
    },

    coordenadas: {
      color: colores.exito,
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      fontWeight: "600",
    },

    modalContainer: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    modalHeader: {
      backgroundColor:
        colores.primario,

      paddingTop: 55,
      paddingBottom: 16,
      paddingHorizontal: 20,
    },

    modalTitulo: {
      color:
        colores.primarioTexto,

      fontSize: 20,
      fontWeight: "bold",
    },

    modalSubtitulo: {
      color:
        colores.primarioTexto,

      fontSize: 13,
      marginTop: 3,
      opacity: 0.9,
    },

    mapa: {
      flex: 1,
    },

    datosSeleccionados: {
      backgroundColor:
        colores.tarjeta,

      borderTopWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 18,
      paddingVertical: 12,
    },

    datosTexto: {
      color:
        colores.textoPrincipal,

      fontSize: 13,
      textAlign: "center",
    },

    botones: {
      flexDirection: "row",
      gap: 10,
      padding: 14,
      paddingBottom: 25,

      backgroundColor:
        colores.tarjeta,
    },

    botonCancelar: {
      flex: 1,
      padding: 14,
      borderRadius: 10,
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
      flex: 2,
      padding: 14,
      borderRadius: 10,

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