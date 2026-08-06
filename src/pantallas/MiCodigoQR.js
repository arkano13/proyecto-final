import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  API_URLS,
} from "../config/config";

import {
  useTema,
} from "../context/TemaContext";

export default function MiCodigoQR({
  route,
  navigation,
}) {
  const { colores } = useTema();

  const styles =
    crearStyles(colores);

  const usuario =
    route?.params?.usuario;

  const correo = String(
    usuario?.correo ||
      usuario?.usuario_correo ||
      ""
  ).trim();

  const [
    enviando,
    setEnviando,
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
        "Respuesta al enviar QR:",
        texto
      );

      throw new Error(
        "El servidor respondió incorrectamente."
      );
    }
  };

  const mostrarExito = (
    mensaje
  ) => {
    if (
      Platform.OS === "web" &&
      typeof window !==
        "undefined"
    ) {
      window.alert(mensaje);

      return;
    }

    Alert.alert(
      "Correo enviado",
      mensaje
    );
  };

  const enviarCodigo =
    async () => {
      if (!correo) {
        setError(
          "Tu cuenta no tiene un correo registrado."
        );

        return;
      }

      setError("");
      setEnviando(true);

      try {
        const respuesta =
          await fetch(
            API_URLS
              .SOLICITAR_LOGIN_QR,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                correo,
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

        mostrarExito(
          datos.mensaje ||
            "El QR y el PIN fueron enviados correctamente."
        );
      } catch (
        errorPeticion
      ) {
        console.error(
          "Error al enviar QR:",
          errorPeticion
        );

        setError(
          errorPeticion.message ||
            "No se pudo enviar el código."
        );
      } finally {
        setEnviando(false);
      }
    };

  return (
    <View
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVolver}
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

        <Text
          style={
            styles.headerTitulo
          }
        >
          Acceso con QR
        </Text>

        <View
          style={
            styles.espacioHeader
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.contenido
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.iconoCirculo
          }
        >
          <Ionicons
            name="qr-code-outline"
            size={50}
            color={
              colores.primario
            }
          />
        </View>

        <Text
          style={styles.titulo}
        >
          Solicitar código de acceso
        </Text>

        <Text
          style={
            styles.descripcion
          }
        >
          Enviaremos un código QR y
          un PIN de 4 números al
          correo de tu cuenta.
        </Text>

        <View
          style={
            styles.tarjetaCorreo
          }
        >
          <Ionicons
            name="mail-outline"
            size={23}
            color={
              colores.primario
            }
          />

          <View
            style={
              styles.correoTexto
            }
          >
            <Text
              style={
                styles.correoLabel
              }
            >
              Correo registrado
            </Text>

            <Text
              style={
                styles.correoValor
              }
            >
              {correo ||
                "Correo no disponible"}
            </Text>
          </View>
        </View>

        {error ? (
          <View
            style={
              styles.errorCaja
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={
                colores.peligro
              }
            />

            <Text
              style={
                styles.errorTexto
              }
            >
              {error}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={
            styles.botonEnviar
          }
          onPress={
            enviarCodigo
          }
          disabled={
            enviando || !correo
          }
        >
          {enviando ? (
            <ActivityIndicator
              color={
                colores
                  .primarioTexto
              }
            />
          ) : (
            <>
              <Ionicons
                name="send-outline"
                size={21}
                color={
                  colores
                    .primarioTexto
                }
              />

              <Text
                style={
                  styles
                    .textoBotonEnviar
                }
              >
                Enviar QR y PIN
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View
          style={styles.aviso}
        >
          <Ionicons
            name="time-outline"
            size={23}
            color={
              colores.advertencia
            }
          />

          <Text
            style={
              styles.avisoTexto
            }
          >
            El QR y el PIN duran 15
            minutos y dejan de
            funcionar después de
            iniciar sesión.
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles
              .botonVolverPerfil
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles
                .textoVolverPerfil
            }
          >
            Volver al perfil
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function crearStyles(colores) {
  return StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        colores.fondo,
    },

    header: {
      minHeight: 64,
      paddingHorizontal: 18,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      backgroundColor:
        colores.tarjeta,

      borderBottomWidth: 1,

      borderBottomColor:
        colores.borde,
    },

    btnVolver: {
      width: 42,
      height: 42,
      borderRadius: 21,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        colores.campo,
    },

    headerTitulo: {
      color:
        colores.textoPrincipal,

      fontSize: 19,
      fontWeight: "bold",
    },

    espacioHeader: {
      width: 42,
    },

    contenido: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 430,

      alignSelf: "center",
      alignItems: "center",

      paddingHorizontal: 22,
      paddingTop: 38,
      paddingBottom: 40,
    },

    iconoCirculo: {
      width: 88,
      height: 88,
      borderRadius: 44,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        colores.primarioClaro,

      marginBottom: 18,
    },

    titulo: {
      color:
        colores.textoPrincipal,

      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
    },

    descripcion: {
      marginTop: 9,
      marginBottom: 24,

      color:
        colores.textoSecundario,

      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },

    tarjetaCorreo: {
      width: "100%",
      padding: 16,
      borderRadius: 12,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        colores.tarjeta,

      borderWidth: 1,
      borderColor:
        colores.borde,
    },

    correoTexto: {
      flex: 1,
      marginLeft: 12,
    },

    correoLabel: {
      color:
        colores.textoSecundario,

      fontSize: 12,
    },

    correoValor: {
      marginTop: 2,

      color:
        colores.textoPrincipal,

      fontSize: 15,
      fontWeight: "600",
    },

    errorCaja: {
      width: "100%",
      marginTop: 14,
      padding: 13,
      borderRadius: 10,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        colores.peligroClaro,
    },

    errorTexto: {
      flex: 1,
      marginLeft: 9,

      color:
        colores.peligro,

      fontSize: 14,
    },

    botonEnviar: {
      width: "100%",
      minHeight: 52,
      marginTop: 18,
      borderRadius: 10,

      flexDirection: "row",
      gap: 8,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor:
        colores.primario,
    },

    textoBotonEnviar: {
      color:
        colores.primarioTexto,

      fontSize: 16,
      fontWeight: "bold",
    },

    aviso: {
      width: "100%",
      marginTop: 18,
      padding: 15,
      borderRadius: 10,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        colores.advertenciaClaro,
    },

    avisoTexto: {
      flex: 1,
      marginLeft: 10,

      color:
        colores.textoPrincipal,

      fontSize: 13,
      lineHeight: 19,
    },

    botonVolverPerfil: {
      marginTop: 20,
      padding: 10,
    },

    textoVolverPerfil: {
      color:
        colores.primario,

      fontWeight: "600",
    },
  });
}