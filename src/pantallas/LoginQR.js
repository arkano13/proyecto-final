import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { Ionicons } from "@expo/vector-icons";

import { API_URLS } from "../config/config";

import {
  registrarNotificaciones,
} from "../servicios/notificaciones";

import {
  useTema,
} from "../context/TemaContext";

import {
  RADIO,
} from "../estilos/globales";

export default function LoginQR({
  navigation,
}) {
  const { colores } = useTema();

  const styles =
    crearStyles(colores);

  const [
    permiso,
    solicitarPermiso,
  ] = useCameraPermissions();

  const [
    escaneado,
    setEscaneado,
  ] = useState(false);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const leerRespuesta = async (
    respuesta
  ) => {
    const texto =
      await respuesta.text();

    try {
      return JSON.parse(texto);
    } catch (errorJson) {
      console.log(
        "Respuesta del login QR:",
        texto
      );

      throw new Error(
        "El servidor respondió incorrectamente."
      );
    }
  };

  const entrarAlSistema = (
    usuario
  ) => {
    const rol = String(
      usuario?.rol ||
        usuario?.usuario_rol ||
        ""
    ).toLowerCase();

    const pantalla =
      rol === "arrendador"
        ? "AdminDashboard"
        : "InquilinoTabs";

    navigation.reset({
      index: 0,

      routes: [
        {
          name: pantalla,

          params: {
            usuario,
          },
        },
      ],
    });
  };

  const procesarCodigo = async ({
    data,
  }) => {
    if (
      escaneado ||
      cargando
    ) {
      return;
    }

    const qrToken = String(
      data || ""
    ).trim();

    if (!qrToken) {
      return;
    }

    setEscaneado(true);
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(
        API_URLS.LOGIN_QR,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            qr_token: qrToken,
          }),
        }
      );

      const datos =
        await leerRespuesta(
          respuesta
        );

      if (
        !respuesta.ok ||
        (!datos.exito &&
          !datos.success)
      ) {
        throw new Error(
          datos.mensaje ||
            datos.message ||
            "El código QR no es válido."
        );
      }

      if (!datos.usuario) {
        throw new Error(
          "El servidor no devolvió los datos del usuario."
        );
      }

      const usuario = {
        ...datos.usuario,

        qr_token:
          datos.usuario
            ?.qr_token ||
          datos.usuario
            ?.usuario_qr_token ||
          qrToken,
      };

      /*
       * Registrar el teléfono para
       * recibir notificaciones.
       *
       * No usamos await para que esto
       * no detenga el inicio de sesión.
       */
      registrarNotificaciones(
        usuario
      );

      entrarAlSistema(usuario);
    } catch (errorPeticion) {
      console.error(
        "Error de login QR:",
        errorPeticion
      );

      setError(
        errorPeticion.message ||
          "No se pudo iniciar sesión con el código QR."
      );
    } finally {
      setCargando(false);
    }
  };

  const intentarNuevamente =
    () => {
      setError("");
      setEscaneado(false);
    };

  /*
   * Esperar mientras Expo consulta
   * el permiso actual.
   */
  if (!permiso) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={colores.primario}
        />

        <Text
          style={
            styles.textoCargando
          }
        >
          Preparando cámara...
        </Text>
      </View>
    );
  }

  /*
   * Mostrar solicitud de permiso.
   */
  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <View
          style={
            styles.iconoPermiso
          }
        >
          <Ionicons
            name="camera-outline"
            size={48}
            color={colores.primario}
          />
        </View>

        <Text
          style={
            styles.tituloPermiso
          }
        >
          Permiso de cámara
        </Text>

        <Text
          style={
            styles.descripcionPermiso
          }
        >
          RentaFácil necesita utilizar
          la cámara para escanear tu
          código QR.
        </Text>

        <TouchableOpacity
          style={
            styles.botonPermiso
          }
          onPress={
            solicitarPermiso
          }
        >
          <Ionicons
            name="camera-outline"
            size={21}
            color="#ffffff"
          />

          <Text
            style={
              styles
                .textoBotonPermiso
            }
          >
            Permitir cámara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.botonVolverClaro
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles
                .textoVolverClaro
            }
          >
            Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <CameraView
        style={
          StyleSheet
            .absoluteFillObject
        }
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          escaneado
            ? undefined
            : procesarCodigo
        }
        onMountError={(evento) => {
          console.error(
            "Error de cámara:",
            evento
          );

          setError(
            "No se pudo abrir la cámara."
          );

          setEscaneado(true);
        }}
      />

      <View
        style={styles.capaOscura}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={
              styles.botonVolver
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color="#ffffff"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitulo
            }
          >
            Iniciar con QR
          </Text>

          <View
            style={
              styles.espacioHeader
            }
          />
        </View>

        <View
          style={
            styles.contenidoCamara
          }
        >
          <Text
            style={styles.titulo}
          >
            Escanea tu código QR
          </Text>

          <Text
            style={
              styles.descripcion
            }
          >
            Coloca el código dentro del
            cuadro
          </Text>

          <View
            style={styles.marcoQR}
          >
            <View
              style={[
                styles.esquina,
                styles
                  .esquinaSuperiorIzquierda,
              ]}
            />

            <View
              style={[
                styles.esquina,
                styles
                  .esquinaSuperiorDerecha,
              ]}
            />

            <View
              style={[
                styles.esquina,
                styles
                  .esquinaInferiorIzquierda,
              ]}
            />

            <View
              style={[
                styles.esquina,
                styles
                  .esquinaInferiorDerecha,
              ]}
            />

            {cargando && (
              <View
                style={
                  styles.procesando
                }
              >
                <ActivityIndicator
                  size="large"
                  color="#ffffff"
                />

                <Text
                  style={
                    styles
                      .textoProcesando
                  }
                >
                  Iniciando sesión...
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={
            styles.panelInferior
          }
        >
          {error ? (
            <>
              <View
                style={
                  styles.errorCaja
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={23}
                  color="#fecaca"
                />

                <Text
                  style={
                    styles.errorTexto
                  }
                >
                  {error}
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles
                    .botonReintentar
                }
                onPress={
                  intentarNuevamente
                }
              >
                <Ionicons
                  name="scan-outline"
                  size={21}
                  color="#ffffff"
                />

                <Text
                  style={
                    styles
                      .textoReintentar
                  }
                >
                  Escanear nuevamente
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={styles.ayuda}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#ffffff"
              />

              <Text
                style={
                  styles.ayudaTexto
                }
              >
                Puedes encontrar tu código
                en Perfil → Mi código QR.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function crearStyles(colores) {
  return StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: "#000000",
    },

    centro: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        colores.fondo,
    },

    textoCargando: {
      marginTop: 13,
      fontSize: 15,
      color:
        colores.textoSecundario,
    },

    iconoPermiso: {
      width: 90,
      height: 90,
      borderRadius: 45,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        colores.primarioClaro,
    },

    tituloPermiso: {
      marginTop: 20,
      fontSize: 24,
      fontWeight: "bold",
      color:
        colores.textoPrincipal,
      textAlign: "center",
    },

    descripcionPermiso: {
      maxWidth: 360,
      marginTop: 10,
      fontSize: 15,
      lineHeight: 22,
      color:
        colores.textoSecundario,
      textAlign: "center",
    },

    botonPermiso: {
      width: "100%",
      maxWidth: 350,
      minHeight: 50,
      marginTop: 24,
      borderRadius: RADIO.sm,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      backgroundColor:
        colores.primario,
    },

    textoBotonPermiso: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#ffffff",
    },

    botonVolverClaro: {
      marginTop: 18,
      padding: 10,
    },

    textoVolverClaro: {
      fontSize: 14,
      fontWeight: "600",
      color: colores.primario,
    },

    capaOscura: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.22)",
    },

    header: {
      paddingTop:
        Platform.OS === "android"
          ? 42
          : 18,

      paddingHorizontal: 18,
      paddingBottom: 14,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      backgroundColor:
        "rgba(0, 0, 0, 0.55)",
    },

    botonVolver: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        "rgba(255, 255, 255, 0.16)",
    },

    headerTitulo: {
      fontSize: 19,
      fontWeight: "bold",
      color: "#ffffff",
    },

    espacioHeader: {
      width: 42,
    },

    contenidoCamara: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    titulo: {
      fontSize: 25,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",

      textShadowColor:
        "rgba(0, 0, 0, 0.7)",

      textShadowOffset: {
        width: 0,
        height: 1,
      },

      textShadowRadius: 4,
    },

    descripcion: {
      marginTop: 7,
      marginBottom: 24,
      fontSize: 15,
      color: "#ffffff",
      textAlign: "center",
    },

    marcoQR: {
      width: 270,
      height: 270,
      position: "relative",
      borderRadius: 22,

      backgroundColor:
        "rgba(255, 255, 255, 0.06)",
    },

    esquina: {
      width: 56,
      height: 56,
      position: "absolute",
      borderColor: "#5eead4",
    },

    esquinaSuperiorIzquierda: {
      top: 0,
      left: 0,
      borderTopWidth: 5,
      borderLeftWidth: 5,
      borderTopLeftRadius: 20,
    },

    esquinaSuperiorDerecha: {
      top: 0,
      right: 0,
      borderTopWidth: 5,
      borderRightWidth: 5,
      borderTopRightRadius: 20,
    },

    esquinaInferiorIzquierda: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 5,
      borderLeftWidth: 5,
      borderBottomLeftRadius: 20,
    },

    esquinaInferiorDerecha: {
      right: 0,
      bottom: 0,
      borderRightWidth: 5,
      borderBottomWidth: 5,
      borderBottomRightRadius: 20,
    },

    procesando: {
      ...StyleSheet
        .absoluteFillObject,

      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        "rgba(0, 0, 0, 0.72)",
    },

    textoProcesando: {
      marginTop: 13,
      fontSize: 15,
      fontWeight: "600",
      color: "#ffffff",
    },

    panelInferior: {
      minHeight: 150,
      paddingHorizontal: 22,
      paddingTop: 16,

      paddingBottom:
        Platform.OS === "ios"
          ? 32
          : 22,

      justifyContent: "center",

      backgroundColor:
        "rgba(0, 0, 0, 0.58)",
    },

    ayuda: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    ayudaTexto: {
      flexShrink: 1,
      marginLeft: 9,
      fontSize: 14,
      lineHeight: 20,
      color: "#ffffff",
    },

    errorCaja: {
      padding: 13,
      borderRadius: RADIO.sm,
      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        "rgba(127, 29, 29, 0.88)",
    },

    errorTexto: {
      flex: 1,
      marginLeft: 9,
      fontSize: 13,
      lineHeight: 19,
      color: "#ffffff",
    },

    botonReintentar: {
      minHeight: 48,
      marginTop: 12,
      borderRadius: RADIO.sm,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      backgroundColor:
        colores.primario,
    },

    textoReintentar: {
      fontSize: 15,
      fontWeight: "bold",
      color: "#ffffff",
    },
  });
}