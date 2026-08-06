import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
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

import { useTema } from "../context/TemaContext";

export default function LoginQR({ navigation }) {
  const {
    colores,
    cargarTemaUsuario,
  } = useTema();

  const styles = crearStyles(colores);

  const [
    permiso,
    solicitarPermiso,
  ] = useCameraPermissions();

  const [paso, setPaso] =
    useState("solicitar");

  const [correo, setCorreo] =
    useState("");

  const [qrToken, setQrToken] =
    useState("");

  const [pin, setPin] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

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
        "Respuesta del servidor QR:",
        texto
      );

      throw new Error(
        "El servidor respondió incorrectamente."
      );
    }
  };

  const mostrarMensaje = (
    titulo,
    mensaje,
    alAceptar
  ) => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined"
    ) {
      window.alert(mensaje);
      alAceptar?.();

      return;
    }

    Alert.alert(
      titulo,
      mensaje,
      [
        {
          text: "Aceptar",
          onPress: alAceptar,
        },
      ]
    );
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

  const solicitarAcceso =
    async () => {
      const correoLimpio =
        correo.trim().toLowerCase();

      if (!correoLimpio) {
        setError(
          "Escribe tu correo electrónico."
        );

        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          correoLimpio
        )
      ) {
        setError(
          "Escribe un correo electrónico válido."
        );

        return;
      }

      setError("");
      setCargando(true);

      try {
        const respuesta = await fetch(
          API_URLS.SOLICITAR_LOGIN_QR,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              correo: correoLimpio,
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
              "No se pudo enviar el código."
          );
        }

        mostrarMensaje(
          "Correo enviado",

          datos.mensaje ||
            "Revisa tu correo. Recibirás un QR y un PIN.",

          () => setPaso("escanear")
        );
      } catch (errorPeticion) {
        console.error(
          "Error al solicitar QR:",
          errorPeticion
        );

        setError(
          errorPeticion.message ||
            "No se pudo solicitar el acceso."
        );
      } finally {
        setCargando(false);
      }
    };

  const procesarCodigo = ({
    data,
  }) => {
    if (paso !== "escanear") {
      return;
    }

    const token = String(
      data || ""
    ).trim();

    if (!token) {
      return;
    }

    setQrToken(token);
    setPin("");
    setError("");
    setPaso("pin");
  };

  const iniciarSesion =
    async () => {
      const pinLimpio =
        pin.trim();

      if (!qrToken) {
        setError(
          "Primero debes escanear el código QR."
        );

        return;
      }

      if (
        !/^\d{4}$/.test(
          pinLimpio
        )
      ) {
        setError(
          "El PIN debe contener 4 números."
        );

        return;
      }

      setError("");
      setCargando(true);

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
              pin: pinLimpio,
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
              "El QR o el PIN no son válidos."
          );
        }

        if (!datos.usuario) {
          throw new Error(
            "El servidor no devolvió los datos del usuario."
          );
        }

        cargarTemaUsuario(
          datos.usuario
        );

        registrarNotificaciones(
          datos.usuario
        );

        entrarAlSistema(
          datos.usuario
        );
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

  const volverAlEscaner = () => {
    setError("");
    setPin("");
    setQrToken("");
    setPaso("escanear");
  };

  /*
   * PASO 2:
   * Escanear el QR.
   */
  if (paso === "escanear") {
    if (!permiso) {
      return (
        <View style={styles.centro}>
          <ActivityIndicator
            size="large"
            color={
              colores.primario
            }
          />

          <Text
            style={
              styles.textoSecundario
            }
          >
            Preparando cámara...
          </Text>
        </View>
      );
    }

    if (!permiso.granted) {
      return (
        <View style={styles.centro}>
          <View
            style={
              styles.iconoCirculo
            }
          >
            <Ionicons
              name="camera-outline"
              size={48}
              color={
                colores.primario
              }
            />
          </View>

          <Text style={styles.titulo}>
            Permiso de cámara
          </Text>

          <Text
            style={styles.descripcion}
          >
            Necesitamos utilizar la
            cámara para escanear el QR
            enviado a tu correo.
          </Text>

          <TouchableOpacity
            style={
              styles.botonPrincipal
            }
            onPress={
              solicitarPermiso
            }
          >
            <Text
              style={
                styles
                  .textoBotonPrincipal
              }
            >
              Permitir cámara
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.botonTexto
            }
            onPress={() =>
              setPaso("solicitar")
            }
          >
            <Text
              style={
                styles.textoEnlace
              }
            >
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        style={
          styles.pantallaCamara
        }
      >
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
            procesarCodigo
          }
        />

        <View
          style={
            styles.capaCamara
          }
        >
          <View
            style={
              styles.headerCamara
            }
          >
            <TouchableOpacity
              style={
                styles.botonVolver
              }
              onPress={() =>
                setPaso(
                  "solicitar"
                )
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
                styles.tituloCamara
              }
            >
              Escanear QR
            </Text>

            <View
              style={{
                width: 42,
              }}
            />
          </View>

          <View
            style={
              styles
                .contenidoCamara
            }
          >
            <Text
              style={
                styles
                  .instruccionCamara
              }
            >
              Coloca dentro del cuadro
              el QR que recibiste por
              correo
            </Text>

            <View
              style={
                styles.marcoQR
              }
            />
          </View>
        </View>
      </View>
    );
  }

  /*
   * PASO 3:
   * Escribir el PIN.
   */
  if (paso === "pin") {
    return (
      <KeyboardAvoidingView
        style={styles.pantalla}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={
            styles.contenido
          }
        >
          <TouchableOpacity
            style={
              styles
                .botonVolverClaro
            }
            onPress={
              volverAlEscaner
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                colores
                  .textoPrincipal
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.iconoCirculo
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={50}
              color={
                colores.exito
              }
            />
          </View>

          <Text style={styles.titulo}>
            QR escaneado
          </Text>

          <Text
            style={styles.descripcion}
          >
            Ahora escribe el PIN de 4
            números que llegó en el
            mismo correo.
          </Text>

          {error ? (
            <Text
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}

          <TextInput
            style={styles.inputPin}
            value={pin}
            onChangeText={(
              valor
            ) =>
              setPin(
                valor.replace(
                  /\D/g,
                  ""
                )
              )
            }
            placeholder="0000"
            placeholderTextColor={
              colores
                .textoSecundario
            }
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            editable={!cargando}
            autoFocus
          />

          <TouchableOpacity
            style={
              styles.botonPrincipal
            }
            onPress={
              iniciarSesion
            }
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator
                color={
                  colores
                    .primarioTexto
                }
              />
            ) : (
              <Text
                style={
                  styles
                    .textoBotonPrincipal
                }
              >
                Iniciar sesión
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.botonTexto
            }
            onPress={
              volverAlEscaner
            }
            disabled={cargando}
          >
            <Text
              style={
                styles.textoEnlace
              }
            >
              Escanear otro código
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  /*
   * PASO 1:
   * Solicitar el QR por correo.
   */
  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View
        style={styles.contenido}
      >
        <TouchableOpacity
          style={
            styles.botonVolverClaro
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              colores.textoPrincipal
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.iconoCirculo
          }
        >
          <Ionicons
            name="qr-code-outline"
            size={48}
            color={colores.primario}
          />
        </View>

        <Text style={styles.titulo}>
          Acceso con QR
        </Text>

        <Text
          style={styles.descripcion}
        >
          Escribe tu correo y te
          enviaremos un QR junto con
          un PIN de acceso.
        </Text>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          placeholder="Correo electrónico"
          placeholderTextColor={
            colores.textoSecundario
          }
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!cargando}
        />

        <TouchableOpacity
          style={
            styles.botonPrincipal
          }
          onPress={
            solicitarAcceso
          }
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator
              color={
                colores.primarioTexto
              }
            />
          ) : (
            <Text
              style={
                styles
                  .textoBotonPrincipal
              }
            >
              Enviar QR y PIN
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.botonSecundario
          }
          onPress={() => {
            setError("");
            setPaso("escanear");
          }}
          disabled={cargando}
        >
          <Ionicons
            name="scan-outline"
            size={21}
            color={colores.primario}
          />

          <Text
            style={
              styles
                .textoBotonSecundario
            }
          >
            Ya tengo mi código
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function crearStyles(colores) {
  return StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor:
        colores.fondo,
    },

    contenido: {
      flex: 1,
      width: "100%",
      maxWidth: 440,
      alignSelf: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 35,
    },

    centro: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 25,

      backgroundColor:
        colores.fondo,
    },

    botonVolverClaro: {
      position: "absolute",

      top:
        Platform.OS ===
        "android"
          ? 45
          : 20,

      left: 20,
      width: 44,
      height: 44,
      borderRadius: 22,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        colores.tarjeta,

      borderWidth: 1,
      borderColor: colores.borde,
    },

    iconoCirculo: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        colores.primarioClaro,

      marginBottom: 18,
    },

    titulo: {
      fontSize: 26,
      fontWeight: "bold",

      color:
        colores.textoPrincipal,

      textAlign: "center",
    },

    descripcion: {
      marginTop: 9,
      marginBottom: 22,

      fontSize: 15,
      lineHeight: 22,

      color:
        colores.textoSecundario,

      textAlign: "center",
    },

    textoSecundario: {
      marginTop: 12,

      color:
        colores.textoSecundario,
    },

    error: {
      marginBottom: 14,
      padding: 12,
      borderRadius: 9,

      color: colores.peligro,

      backgroundColor:
        colores.peligroClaro,

      textAlign: "center",
    },

    input: {
      minHeight: 52,

      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,

      backgroundColor:
        colores.campo,

      color:
        colores.textoPrincipal,

      paddingHorizontal: 14,
      fontSize: 16,
    },

    inputPin: {
      width: "100%",
      minHeight: 65,

      borderWidth: 2,
      borderColor:
        colores.primario,

      borderRadius: 12,

      backgroundColor:
        colores.campo,

      color:
        colores.textoPrincipal,

      fontSize: 29,
      fontWeight: "bold",
      letterSpacing: 15,
      textAlign: "center",
      paddingHorizontal: 15,
    },

    botonPrincipal: {
      minHeight: 52,
      marginTop: 16,
      borderRadius: 10,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        colores.primario,
    },

    textoBotonPrincipal: {
      color:
        colores.primarioTexto,

      fontSize: 16,
      fontWeight: "bold",
    },

    botonSecundario: {
      minHeight: 52,
      marginTop: 12,
      borderRadius: 10,

      flexDirection: "row",
      gap: 8,

      justifyContent: "center",
      alignItems: "center",

      borderWidth: 1,
      borderColor:
        colores.primario,

      backgroundColor:
        colores.tarjeta,
    },

    textoBotonSecundario: {
      color: colores.primario,
      fontWeight: "bold",
      fontSize: 15,
    },

    botonTexto: {
      alignSelf: "center",
      marginTop: 17,
      padding: 8,
    },

    textoEnlace: {
      color: colores.primario,
      fontWeight: "600",
    },

    pantallaCamara: {
      flex: 1,
      backgroundColor: "#000000",
    },

    capaCamara: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.22)",
    },

    headerCamara: {
      paddingTop:
        Platform.OS ===
        "android"
          ? 45
          : 20,

      paddingHorizontal: 18,
      paddingBottom: 14,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      backgroundColor:
        "rgba(0,0,0,0.55)",
    },

    botonVolver: {
      width: 42,
      height: 42,
      borderRadius: 21,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        "rgba(255,255,255,0.16)",
    },

    tituloCamara: {
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: 19,
    },

    contenidoCamara: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    instruccionCamara: {
      maxWidth: 330,
      marginBottom: 25,

      color: "#ffffff",
      fontSize: 17,
      fontWeight: "600",
      lineHeight: 24,
      textAlign: "center",

      textShadowColor:
        "rgba(0,0,0,0.8)",

      textShadowOffset: {
        width: 0,
        height: 1,
      },

      textShadowRadius: 4,
    },

    marcoQR: {
      width: 270,
      height: 270,
      borderRadius: 22,
      borderWidth: 5,
      borderColor: "#5eead4",

      backgroundColor:
        "rgba(255,255,255,0.05)",
    },
  });
}