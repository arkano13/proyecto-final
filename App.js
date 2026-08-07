import React, {
  useState,
  useEffect,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import {
  useTema,
} from "./src/context/TemaContext";

import {
  obtenerSesion,
  borrarSesion,
} from "./src/servicios/sesion";

// Autenticación
import Login from "./src/pantallas/Login";
import LoginQR from "./src/pantallas/LoginQR";
import Registro from "./src/pantallas/Registro";
import RecuperarClave from "./src/pantallas/RecuperarClave";

// Perfil
import Perfil from "./src/pantallas/Perfil";
import MiCodigoQR from "./src/pantallas/MiCodigoQR";

// Arrendador
import AdminDashboard from "./src/pantallas/AdminDashboard";
import MisPropiedades from "./src/pantallas/MisPropiedades";
import FormPropiedad from "./src/pantallas/FormPropiedad";
import Solicitudes from "./src/pantallas/Solicitudes";
import CrearContrato from "./src/pantallas/CrearContrato";
import ContratosAdmin from "./src/pantallas/ContratosAdmin";
import PagosAdmin from "./src/pantallas/PagosAdmin";
import RegistrarPago from "./src/pantallas/RegistrarPago";
import Reportes from "./src/pantallas/Reportes";
import ModuloAcceso from "./src/pantallas/ModuloAcceso";
import BitacoraScreen from "./src/pantallas/BitacoraScreen";

// Inquilino
import ExplorarScreen from "./src/pantallas/ExplorarScreen";
import DetallePropiedadCliente from "./src/pantallas/DetallePropiedadCliente";
import MisSolicitudes from "./src/pantallas/MisSolicitudes";
import MiContrato from "./src/pantallas/MiContrato";
import MisPagos from "./src/pantallas/MisPagos";

const Stack =
  createNativeStackNavigator();

function InquilinoTabs({
  route,
  navigation,
}) {
  const { colores } = useTema();

  const styles =
    crearStyles(colores);

  const usuario =
    route?.params?.usuario;

  const abrirPantalla = (
    pantalla
  ) => {
    navigation.navigate(
      pantalla,
      {
        usuario,
      }
    );
  };

  return (
    <View
      style={
        styles.menuInquilino
      }
    >
      <View
        style={
          styles.menuEncabezado
        }
      >
        <Ionicons
          name="home-outline"
          size={32}
          color={
            colores.primarioTexto
          }
        />

        <View
          style={
            styles.menuEncabezadoTexto
          }
        >
          <Text
            style={styles.menuTitulo}
          >
            RentaFácil
          </Text>

          <Text
            style={
              styles.menuSubtitulo
            }
          >
            Menú del inquilino
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.menuContenido
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.bienvenida}
        >
          Hola,{" "}
          {usuario?.nombre_completo ||
            usuario?.usuario_nombrecomp ||
            usuario?.usuario ||
            "usuario"}
        </Text>

        <Text
          style={
            styles.seleccionaOpcion
          }
        >
          Selecciona una opción
        </Text>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla(
              "ExplorarScreen"
            )
          }
        >
          <View
            style={[
              styles.iconoOpcion,
              styles.iconoExplorar,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={25}
              color={
                colores.oscuro
                  ? "#5eead4"
                  : "#0f766e"
              }
            />
          </View>

          <View
            style={
              styles.textoOpcion
            }
          >
            <Text
              style={
                styles.tituloOpcion
              }
            >
              Explorar propiedades
            </Text>

            <Text
              style={
                styles
                  .descripcionOpcion
              }
            >
              Busca propiedades
              disponibles
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              colores.textoSecundario
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla(
              "MisSolicitudes"
            )
          }
        >
          <View
            style={[
              styles.iconoOpcion,
              styles
                .iconoSolicitudes,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={25}
              color={
                colores.oscuro
                  ? "#93c5fd"
                  : "#2563eb"
              }
            />
          </View>

          <View
            style={
              styles.textoOpcion
            }
          >
            <Text
              style={
                styles.tituloOpcion
              }
            >
              Mis solicitudes
            </Text>

            <Text
              style={
                styles
                  .descripcionOpcion
              }
            >
              Consulta el estado de tus
              solicitudes
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              colores.textoSecundario
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla(
              "MiContrato"
            )
          }
        >
          <View
            style={[
              styles.iconoOpcion,
              styles.iconoContrato,
            ]}
          >
            <Ionicons
              name="reader-outline"
              size={25}
              color={
                colores.oscuro
                  ? "#c4b5fd"
                  : "#7c3aed"
              }
            />
          </View>

          <View
            style={
              styles.textoOpcion
            }
          >
            <Text
              style={
                styles.tituloOpcion
              }
            >
              Mi contrato
            </Text>

            <Text
              style={
                styles
                  .descripcionOpcion
              }
            >
              Consulta los datos de tu
              alquiler
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              colores.textoSecundario
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla(
              "MisPagos"
            )
          }
        >
          <View
            style={[
              styles.iconoOpcion,
              styles.iconoPagos,
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={25}
              color={
                colores.oscuro
                  ? "#86efac"
                  : "#16a34a"
              }
            />
          </View>

          <View
            style={
              styles.textoOpcion
            }
          >
            <Text
              style={
                styles.tituloOpcion
              }
            >
              Mis pagos
            </Text>

            <Text
              style={
                styles
                  .descripcionOpcion
              }
            >
              Revisa el historial de
              pagos
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              colores.textoSecundario
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla(
              "Perfil"
            )
          }
        >
          <View
            style={[
              styles.iconoOpcion,
              styles.iconoPerfil,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={25}
              color={
                colores.oscuro
                  ? "#fdba74"
                  : "#ea580c"
              }
            />
          </View>

          <View
            style={
              styles.textoOpcion
            }
          >
            <Text
              style={
                styles.tituloOpcion
              }
            >
              Mi perfil
            </Text>

            <Text
              style={
                styles
                  .descripcionOpcion
              }
            >
              Edita tus datos y
              contraseña
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              colores.textoSecundario
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.botonCerrarSesion
          }
          onPress={async () => {
            await borrarSesion();

            navigation.replace(
              "Login"
            );
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color={colores.peligro}
          />

          <Text
            style={
              styles.textoCerrarSesion
            }
          >
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const {
    temaOscuro,
    colores,
  } = useTema();

  const [
    verificandoSesion,
    setVerificandoSesion,
  ] = useState(true);

  const [
    usuarioSesion,
    setUsuarioSesion,
  ] = useState(null);

  /*
   * Al abrir la app se consulta si
   * hay una sesión guardada en el
   * teléfono para entrar
   * automáticamente.
   */
  useEffect(() => {
    const verificarSesion =
      async () => {
        const usuario =
          await obtenerSesion();

        setUsuarioSesion(usuario);
        setVerificandoSesion(false);
      };

    verificarSesion();
  }, []);

  const rolUsuario = String(
    usuarioSesion?.rol ||
      usuarioSesion?.usuario_rol ||
      ""
  ).toLowerCase();

  const pantallaInicial =
    !usuarioSesion
      ? "Login"
      : rolUsuario === "arrendador"
      ? "AdminDashboard"
      : "InquilinoTabs";

  const temaBase =
    temaOscuro
      ? DarkTheme
      : DefaultTheme;

  const temaNavegacion = {
    ...temaBase,

    colors: {
      ...temaBase.colors,

      primary:
        colores.primario,

      background:
        colores.fondo,

      card:
        colores.encabezado,

      text:
        colores.textoPrincipal,

      border:
        colores.borde,

      notification:
        colores.peligro,
    },
  };

  if (verificandoSesion) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            colores.fondo,
        }}
      >
        <StatusBar
          style={
            temaOscuro
              ? "light"
              : "dark"
          }
          backgroundColor={
            colores.barraEstado
          }
        />

        <ActivityIndicator
          size="large"
          color={colores.primario}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        style={
          temaOscuro
            ? "light"
            : "dark"
        }
        backgroundColor={
          colores.barraEstado
        }
      />

      <NavigationContainer
        theme={temaNavegacion}
      >
        <Stack.Navigator
          initialRouteName={
            pantallaInicial
          }
          screenOptions={{
            headerBackTitle:
              "Atrás",

            animation:
              "slide_from_right",

            animationDuration:
              250,

            gestureEnabled: true,

            headerTintColor:
              colores.primario,

            headerStyle: {
              backgroundColor:
                colores.encabezado,
            },

            headerTitleStyle: {
              fontWeight: "bold",

              color:
                colores
                  .textoPrincipal,
            },

            contentStyle: {
              backgroundColor:
                colores.fondo,
            },
          }}
        >
          {/* AUTENTICACIÓN */}

          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="LoginQR"
            component={LoginQR}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Registro"
            component={Registro}
            options={{
              title:
                "Crear cuenta",
            }}
          />

          <Stack.Screen
            name="RecuperarClave"
            component={
              RecuperarClave
            }
            options={{
              headerShown: false,
            }}
          />

          {/* ARRENDADOR */}

          <Stack.Screen
            name="AdminDashboard"
            component={
              AdminDashboard
            }
            initialParams={{
              usuario: usuarioSesion,
            }}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="MisPropiedades"
            component={
              MisPropiedades
            }
            options={{
              title:
                "Mis propiedades",
            }}
          />

          <Stack.Screen
            name="FormPropiedad"
            component={
              FormPropiedad
            }
            options={({
              route,
            }) => ({
              title:
                route?.params
                  ?.propiedad
                  ? "Editar propiedad"
                  : "Nueva propiedad",
            })}
          />

          <Stack.Screen
            name="Solicitudes"
            component={Solicitudes}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="CrearContrato"
            component={
              CrearContrato
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ContratosAdmin"
            component={
              ContratosAdmin
            }
            options={{
              title: "Contratos",
            }}
          />

          <Stack.Screen
            name="PagosAdmin"
            component={PagosAdmin}
            options={{
              title: "Pagos",
            }}
          />

          <Stack.Screen
            name="RegistrarPago"
            component={
              RegistrarPago
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Reportes"
            component={Reportes}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ModuloAcceso"
            component={ModuloAcceso}
            options={{
              title:
                "Módulo de Acceso",
            }}
          />

          <Stack.Screen
            name="BitacoraScreen"
            component={
              BitacoraScreen
            }
            options={{
              title: "Bitácora",
            }}
          />

          <Stack.Screen
            name="Perfil"
            component={Perfil}
            options={{
              title: "Mi perfil",
            }}
          />

          <Stack.Screen
            name="MiCodigoQR"
            component={MiCodigoQR}
            options={{
              headerShown: false,
            }}
          />

          {/* INQUILINO */}

          <Stack.Screen
            name="InquilinoTabs"
            component={
              InquilinoTabs
            }
            initialParams={{
              usuario: usuarioSesion,
            }}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ExplorarScreen"
            component={
              ExplorarScreen
            }
            options={{
              title:
                "Explorar propiedades",
            }}
          />

          <Stack.Screen
            name="DetallePropiedadCliente"
            component={
              DetallePropiedadCliente
            }
            options={{
              title:
                "Detalle de propiedad",
            }}
          />

          <Stack.Screen
            name="MisSolicitudes"
            component={
              MisSolicitudes
            }
            options={{
              title:
                "Mis solicitudes",
            }}
          />

          <Stack.Screen
            name="MiContrato"
            component={MiContrato}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="MisPagos"
            component={MisPagos}
            options={{
              title: "Mis pagos",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const crearStyles = (
  colores
) =>
  StyleSheet.create({
    menuInquilino: {
      flex: 1,
      backgroundColor:
        colores.fondo,
    },

    menuEncabezado: {
      backgroundColor:
        colores.primario,

      paddingTop: 55,
      paddingBottom: 24,
      paddingHorizontal: 22,

      flexDirection: "row",
      alignItems: "center",
    },

    menuEncabezadoTexto: {
      marginLeft: 12,
    },

    menuTitulo: {
      fontSize: 23,
      fontWeight: "bold",
      color:
        colores.primarioTexto,
    },

    menuSubtitulo: {
      marginTop: 2,
      fontSize: 14,
      color:
        colores.primarioTexto,
    },

    menuContenido: {
      padding: 20,
      paddingBottom: 40,
    },

    bienvenida: {
      fontSize: 22,
      fontWeight: "bold",
      color:
        colores.textoPrincipal,
    },

    seleccionaOpcion: {
      marginTop: 4,
      marginBottom: 18,
      fontSize: 14,
      color:
        colores.textoSecundario,
    },

    opcionMenu: {
      minHeight: 78,

      backgroundColor:
        colores.tarjeta,

      borderRadius: 14,
      padding: 14,
      marginBottom: 13,

      borderWidth: 1,
      borderColor:
        colores.borde,

      flexDirection: "row",
      alignItems: "center",

      boxShadow:
        "0px 2px 8px rgba(15, 23, 42, 0.08)",

      elevation: 2,
    },

    iconoOpcion: {
      width: 48,
      height: 48,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
    },

    iconoExplorar: {
      backgroundColor:
        colores.oscuro
          ? "#134e4a"
          : "#ccfbf1",
    },

    iconoSolicitudes: {
      backgroundColor:
        colores.oscuro
          ? "#1e3a5f"
          : "#dbeafe",
    },

    iconoContrato: {
      backgroundColor:
        colores.oscuro
          ? "#4c1d95"
          : "#ede9fe",
    },

    iconoPagos: {
      backgroundColor:
        colores.oscuro
          ? "#14532d"
          : "#dcfce7",
    },

    iconoPerfil: {
      backgroundColor:
        colores.oscuro
          ? "#7c2d12"
          : "#ffedd5",
    },

    textoOpcion: {
      flex: 1,
      marginLeft: 13,
    },

    tituloOpcion: {
      fontSize: 16,
      fontWeight: "bold",
      color:
        colores.textoPrincipal,
    },

    descripcionOpcion: {
      marginTop: 3,
      fontSize: 13,
      color:
        colores.textoSecundario,
    },

    botonCerrarSesion: {
      minHeight: 48,
      marginTop: 10,

      borderRadius: 10,
      borderWidth: 1,

      borderColor:
        colores.peligro,

      backgroundColor:
        colores.peligroClaro,

      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",

      gap: 8,
    },

    textoCerrarSesion: {
      fontSize: 15,
      fontWeight: "bold",
      color: colores.peligro,
    },
  });