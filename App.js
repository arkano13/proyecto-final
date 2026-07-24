import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import Login from './src/pantallas/Login';
import Registro from './src/pantallas/Registro';

// Arrendador
import AdminDashboard from './src/pantallas/AdminDashboard';
import MisPropiedades from './src/pantallas/MisPropiedades';
import FormPropiedad from './src/pantallas/FormPropiedad';
import Solicitudes from './src/pantallas/Solicitudes';
import ContratosAdmin from './src/pantallas/ContratosAdmin';
import PagosAdmin from './src/pantallas/PagosAdmin';

// Inquilino
import ExplorarScreen from './src/pantallas/ExplorarScreen';
import DetallePropiedadCliente from './src/pantallas/DetallePropiedadCliente';
import MisSolicitudes from './src/pantallas/MisSolicitudes';
import MiContrato from './src/pantallas/MiContrato';
import MisPagos from './src/pantallas/MisPagos';

// Placeholders temporales
import { View, Text } from 'react-native';
const Reportes = () => <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><Text style={{ color:'#0f766e', fontSize:18 }}>📊 Reportes (próximamente)</Text></View>;
const Perfil = () => <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><Text style={{ color:'#0f766e', fontSize:18 }}>👤 Perfil (próximamente)</Text></View>;
const InquilinoTabs = ({ navigation }) => (
  <View style={{ flex:1, backgroundColor:'#f8fafc', paddingTop: 60, paddingHorizontal: 20, gap: 14 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f766e', marginBottom: 10 }}>🔍 Menú Inquilino</Text>
    {[
      { label: '🏠 Explorar propiedades', pantalla: 'ExplorarScreen' },
      { label: '📋 Mis Solicitudes', pantalla: 'MisSolicitudes' },
      { label: '📝 Mi Contrato', pantalla: 'MiContrato' },
      { label: '💰 Mis Pagos', pantalla: 'MisPagos' },
    ].map((item, i) => (
      <Text
        key={i}
        onPress={() => navigation.navigate(item.pantalla)}
        style={{ backgroundColor: '#fff', padding: 18, borderRadius: 14, fontSize: 16, fontWeight: '600', color: '#0f172a', elevation: 2 }}
      >
        {item.label}
      </Text>
    ))}
    <Text onPress={() => navigation.replace('Login')} style={{ color: '#dc2626', textAlign: 'center', marginTop: 20, fontWeight: 'bold' }}>
      Cerrar sesión
    </Text>
  </View>
);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
        {/* Auth */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registro" component={Registro} />

        {/* Arrendador */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="MisPropiedades" component={MisPropiedades} />
        <Stack.Screen name="FormPropiedad" component={FormPropiedad} />
        <Stack.Screen name="Solicitudes" component={Solicitudes} />
        <Stack.Screen name="ContratosAdmin" component={ContratosAdmin} />
        <Stack.Screen name="PagosAdmin" component={PagosAdmin} />
        <Stack.Screen name="Reportes" component={Reportes} />
        <Stack.Screen name="Perfil" component={Perfil} />

        {/* Inquilino */}
        <Stack.Screen name="InquilinoTabs" component={InquilinoTabs} />
        <Stack.Screen name="ExplorarScreen" component={ExplorarScreen} />
        <Stack.Screen name="DetallePropiedadCliente" component={DetallePropiedadCliente} />
        <Stack.Screen name="MisSolicitudes" component={MisSolicitudes} />
        <Stack.Screen name="MiContrato" component={MiContrato} />
        <Stack.Screen name="MisPagos" component={MisPagos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}