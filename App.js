import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Autenticación
import Login from './src/pantallas/Login';
import Registro from './src/pantallas/Registro';

// Arrendador
import AdminDashboard from './src/pantallas/AdminDashboard';
import MisPropiedades from './src/pantallas/MisPropiedades';
import FormPropiedad from './src/pantallas/FormPropiedad';
import Solicitudes from './src/pantallas/Solicitudes';
import CrearContrato from './src/pantallas/CrearContrato';
import ContratosAdmin from './src/pantallas/ContratosAdmin';
import PagosAdmin from './src/pantallas/PagosAdmin';
import RegistrarPago from './src/pantallas/RegistrarPago';

// Inquilino
import ExplorarScreen from './src/pantallas/ExplorarScreen';
import DetallePropiedadCliente from './src/pantallas/DetallePropiedadCliente';
import MisSolicitudes from './src/pantallas/MisSolicitudes';
import MiContrato from './src/pantallas/MiContrato';
import MisPagos from './src/pantallas/MisPagos';

const Stack = createNativeStackNavigator();

function Reportes() {
  return (
    <View style={styles.placeholder}>
      <Ionicons
        name="bar-chart-outline"
        size={60}
        color="#0f766e"
      />

      <Text style={styles.placeholderTitulo}>
        Reportes
      </Text>

      <Text style={styles.placeholderTexto}>
        Este módulo se agregará próximamente.
      </Text>
    </View>
  );
}

function Perfil() {
  return (
    <View style={styles.placeholder}>
      <Ionicons
        name="person-circle-outline"
        size={65}
        color="#0f766e"
      />

      <Text style={styles.placeholderTitulo}>
        Perfil
      </Text>

      <Text style={styles.placeholderTexto}>
        Este módulo se agregará próximamente.
      </Text>
    </View>
  );
}

function InquilinoTabs({
  route,
  navigation,
}) {
  const usuario = route?.params?.usuario;

  const abrirPantalla = (pantalla) => {
    navigation.navigate(pantalla, {
      usuario,
    });
  };

  return (
    <View style={styles.menuInquilino}>
      <View style={styles.menuEncabezado}>
        <Ionicons
          name="home-outline"
          size={32}
          color="#ffffff"
        />

        <View style={styles.menuEncabezadoTexto}>
          <Text style={styles.menuTitulo}>
            RentaFácil
          </Text>

          <Text style={styles.menuSubtitulo}>
            Menú del inquilino
          </Text>
        </View>
      </View>

      <View style={styles.menuContenido}>
        <Text style={styles.bienvenida}>
          Hola,{' '}
          {usuario?.nombre_completo ||
            usuario?.usuario_nombrecomp ||
            'usuario'}
        </Text>

        <Text style={styles.seleccionaOpcion}>
          Selecciona una opción
        </Text>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla('ExplorarScreen')
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
              color="#0f766e"
            />
          </View>

          <View style={styles.textoOpcion}>
            <Text style={styles.tituloOpcion}>
              Explorar propiedades
            </Text>

            <Text
              style={styles.descripcionOpcion}
            >
              Busca propiedades disponibles
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#94a3b8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla('MisSolicitudes')
          }
        >
          <View
            style={[
              styles.iconoOpcion,
              styles.iconoSolicitudes,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={25}
              color="#2563eb"
            />
          </View>

          <View style={styles.textoOpcion}>
            <Text style={styles.tituloOpcion}>
              Mis solicitudes
            </Text>

            <Text
              style={styles.descripcionOpcion}
            >
              Consulta el estado de tus solicitudes
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#94a3b8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla('MiContrato')
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
              color="#7c3aed"
            />
          </View>

          <View style={styles.textoOpcion}>
            <Text style={styles.tituloOpcion}>
              Mi contrato
            </Text>

            <Text
              style={styles.descripcionOpcion}
            >
              Consulta los datos de tu alquiler
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#94a3b8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionMenu}
          onPress={() =>
            abrirPantalla('MisPagos')
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
              color="#16a34a"
            />
          </View>

          <View style={styles.textoOpcion}>
            <Text style={styles.tituloOpcion}>
              Mis pagos
            </Text>

            <Text
              style={styles.descripcionOpcion}
            >
              Revisa el historial de pagos
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#94a3b8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCerrarSesion}
          onPress={() =>
            navigation.replace('Login')
          }
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#dc2626"
          />

          <Text style={styles.textoCerrarSesion}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerBackTitle: 'Atrás',
          headerTintColor: '#0f766e',
          headerTitleStyle: {
            fontWeight: 'bold',
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
          name="Registro"
          component={Registro}
          options={{
            title: 'Crear cuenta',
          }}
        />

        {/* ARRENDADOR */}

        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="MisPropiedades"
          component={MisPropiedades}
          options={{
            title: 'Mis propiedades',
          }}
        />

        <Stack.Screen
          name="FormPropiedad"
          component={FormPropiedad}
          options={({ route }) => ({
            title: route?.params?.propiedad
              ? 'Editar propiedad'
              : 'Nueva propiedad',
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
          component={CrearContrato}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ContratosAdmin"
          component={ContratosAdmin}
          options={{
            title: 'Contratos',
          }}
        />

        <Stack.Screen
          name="PagosAdmin"
          component={PagosAdmin}
          options={{
            title: 'Pagos',
          }}
        />

        <Stack.Screen
          name="RegistrarPago"
          component={RegistrarPago}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Reportes"
          component={Reportes}
          options={{
            title: 'Reportes',
          }}
        />

        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{
            title: 'Mi perfil',
          }}
        />

        {/* INQUILINO */}

        <Stack.Screen
          name="InquilinoTabs"
          component={InquilinoTabs}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ExplorarScreen"
          component={ExplorarScreen}
          options={{
            title: 'Explorar propiedades',
          }}
        />

        <Stack.Screen
          name="DetallePropiedadCliente"
          component={DetallePropiedadCliente}
          options={{
            title: 'Detalle de propiedad',
          }}
        />

        <Stack.Screen
          name="MisSolicitudes"
          component={MisSolicitudes}
          options={{
            title: 'Mis solicitudes',
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
            title: 'Mis pagos',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f8fafc',
  },

  placeholderTitulo: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f766e',
  },

  placeholderTexto: {
    marginTop: 7,
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },

  menuInquilino: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  menuEncabezado: {
    backgroundColor: '#0f766e',
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuEncabezadoTexto: {
    marginLeft: 12,
  },

  menuTitulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  menuSubtitulo: {
    marginTop: 2,
    fontSize: 14,
    color: '#ccfbf1',
  },

  menuContenido: {
    flex: 1,
    padding: 20,
  },

  bienvenida: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  seleccionaOpcion: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 14,
    color: '#64748b',
  },

  opcionMenu: {
    minHeight: 78,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow:
      '0px 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 2,
  },

  iconoOpcion: {
    width: 48,
    height: 48,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconoExplorar: {
    backgroundColor: '#ccfbf1',
  },

  iconoSolicitudes: {
    backgroundColor: '#dbeafe',
  },

  iconoContrato: {
    backgroundColor: '#ede9fe',
  },

  iconoPagos: {
    backgroundColor: '#dcfce7',
  },

  textoOpcion: {
    flex: 1,
    marginLeft: 13,
  },

  tituloOpcion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  descripcionOpcion: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748b',
  },

  botonCerrarSesion: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  textoCerrarSesion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dc2626',
  },
});